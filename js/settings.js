/**
 * settings.js — Loads and saves user settings in localStorage.
 */

const STORAGE_KEY = 'padLooper.settings.v1';

const DEFAULT_SETTINGS = Object.freeze({
  crossfadeSec: 4,
  volumePercent: 75,
  outputMode: 'stereo',
});

/** Returns saved settings merged over the defaults (defaults if nothing saved or storage is blocked). */
export function loadSettings() {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(STORAGE_KEY)) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/** Saves settings; silently ignores storage being unavailable (e.g. private browsing). */
export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch { /* not critical */ }
}
