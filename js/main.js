/**
 * main.js — App entry point: wires the UI, settings, audio engine, offline storage and mobile extras.
 */

import { PADS, findPad } from './pads.js';
import { PadEngine } from './audioEngine.js';
import { loadSettings, saveSettings } from './settings.js';
import { registerServiceWorker, countCachedPads, downloadPads } from './offline.js';
import { renderKeyboard, updateKeyHighlights, createVerticalSlider, showToast } from './ui.js';
import { configureAudioSession, setScreenAwake, initMediaSession, updateMediaSession } from './mobileSupport.js';

const settings = loadSettings();
const availablePadFiles = PADS.filter(pad => pad.isAvailable).map(pad => pad.file);
let lastPlayedPadId = null;

const elements = {
  keyboard: document.getElementById('keyboard'),
  nowPlaying: document.getElementById('now-playing'),
  panic: document.getElementById('panic'),
  volumeSlider: document.getElementById('volume-slider'),
  volumeLabel: document.getElementById('volume-label'),
  outputToggle: document.getElementById('output-toggle'),
  settingsButton: document.getElementById('settings-button'),
  settingsCrossfadeLabel: document.getElementById('settings-crossfade-label'),
  settingsDialog: document.getElementById('settings-dialog'),
  crossfadeInput: document.getElementById('crossfade-input'),
  crossfadeValue: document.getElementById('crossfade-value'),
  offlineStatus: document.getElementById('offline-status'),
  offlineButton: document.getElementById('offline-button'),
  offlineProgress: document.getElementById('offline-progress'),
};

const engine = new PadEngine({ onStateChange: handleEngineState, onError: handleEngineError });

/** Applies a setting change, persists it, and refreshes the related UI. */
function updateSetting(name, value) {
  settings[name] = value;
  saveSettings(settings);
  renderSettings();
}

function renderSettings() {
  elements.volumeLabel.textContent = `${settings.volumePercent}%`;
  elements.outputToggle.dataset.mode = settings.outputMode;
  elements.outputToggle.querySelector('.mode-label').textContent = settings.outputMode.toUpperCase();
  elements.outputToggle.setAttribute('aria-label', `Output: ${settings.outputMode}. Tap to switch.`);
  elements.settingsCrossfadeLabel.textContent = `${settings.crossfadeSec} s`;
  elements.crossfadeInput.value = settings.crossfadeSec;
  elements.crossfadeValue.textContent = `${settings.crossfadeSec} s`;
}

function handleKeyTap(pad) {
  if (!pad.isAvailable) {
    showToast(`${pad.label} pad not added yet`);
    return;
  }
  engine.toggle(pad, settings.crossfadeSec);
}

function handleEngineState(state) {
  updateKeyHighlights(elements.keyboard, state);
  const activePad = state.activePadId && findPad(state.activePadId);
  elements.nowPlaying.textContent = activePad ? activePad.label : '—';
  if (activePad) lastPlayedPadId = activePad.id;
  setScreenAwake(Boolean(activePad) || state.fadingPadIds.length > 0);
  updateMediaSession(activePad?.label);
}

function handleEngineError(pad, error) {
  console.warn(`Could not play ${pad.id}:`, error);
  showToast(navigator.onLine
    ? `Couldn't play ${pad.label} pad`
    : `${pad.label} pad isn't saved for offline use`);
}

async function refreshOfflineStatus() {
  const cachedCount = await countCachedPads(availablePadFiles);
  const isComplete = cachedCount === availablePadFiles.length;
  elements.offlineStatus.textContent = `${cachedCount} of ${availablePadFiles.length} pads saved on this device`;
  elements.offlineButton.textContent = isComplete ? 'All pads saved ✓' : 'Download for offline';
  elements.offlineButton.disabled = isComplete;
}

async function handleOfflineDownload() {
  elements.offlineButton.disabled = true;
  elements.offlineProgress.hidden = false;
  try {
    await downloadPads(availablePadFiles, fraction => { elements.offlineProgress.value = fraction; });
    showToast('Pads saved for offline use');
  } catch (error) {
    console.warn(error);
    showToast('Download failed – check your connection and try again');
  } finally {
    elements.offlineProgress.hidden = true;
    refreshOfflineStatus();
  }
}

function wireControls() {
  renderKeyboard(elements.keyboard, PADS, handleKeyTap);

  elements.panic.addEventListener('click', () => engine.panic());

  createVerticalSlider(elements.volumeSlider, {
    value: settings.volumePercent,
    onInput: percent => {
      engine.setVolume(percent);
      updateSetting('volumePercent', percent);
    },
  });

  elements.outputToggle.addEventListener('click', () => {
    const mode = settings.outputMode === 'stereo' ? 'mono' : 'stereo';
    engine.setOutputMode(mode);
    updateSetting('outputMode', mode);
  });

  elements.settingsButton.addEventListener('click', () => {
    refreshOfflineStatus();
    elements.settingsDialog.showModal();
  });
  elements.crossfadeInput.addEventListener('input', () => updateSetting('crossfadeSec', Number(elements.crossfadeInput.value)));
  elements.offlineButton.addEventListener('click', handleOfflineDownload);

  initMediaSession({
    onPlay: () => { if (lastPlayedPadId) engine.play(findPad(lastPlayedPadId), settings.crossfadeSec); },
    onPause: () => engine.stop(settings.crossfadeSec),
    onStop: () => engine.panic(),
  });
}

configureAudioSession();
engine.setVolume(settings.volumePercent);
engine.setOutputMode(settings.outputMode);
wireControls();
renderSettings();
registerServiceWorker();
