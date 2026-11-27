/**
 * audioEngine.js — Pad playback engine.
 *
 * Each pad streams through an <audio> element into the Web Audio graph (streaming avoids
 * holding ~100 MB of decoded audio per pad in memory on phones):
 *
 *   <audio> → trim (loudness match) → fade → dip → master (volume) ─┬→ stereoGain ─────────────→ speakers
 *                                                                   └→ monoGain (1 channel) ──→ speakers
 *
 * Features: equal-power crossfades between keys with a volume dip to mark the key change,
 * seamless looping by crossfading a pad into a fresh copy of itself near its end, panic stop,
 * and a click-free stereo/mono switch.
 */

const VOICE_COUNT = 6;              // enough for a key crossfade overlapping a loop crossfade, plus rapid taps
const LOOP_CROSSFADE_SEC = 8;       // fixed self-crossfade at the loop point
const LOOP_TRIGGER_MARGIN_SEC = 1.5; // start the loop crossfade this much early (timers are coarse in background)
const LOOP_CHECK_MS = 250;
const PANIC_FADE_SEC = 0.05;        // "immediate" but click-free
const MIN_FADE_SEC = 0.03;          // a 0 s crossfade still gets a tiny fade to avoid clicks
const OUTPUT_SWITCH_SEC = 0.05;
const VOLUME_SMOOTHING_SEC = 0.03;
const MONO_GAIN = Math.SQRT2;       // offsets the ~3 dB drop when summing wide (uncorrelated) stereo to mono
const KEY_CHANGE_DIP_GAIN = 0.5;    // output amplitude at the midpoint of a key-change crossfade

/** Equal-power curve from `from` to `to`; keeps perceived loudness steady during a crossfade. */
function equalPowerCurve(from, to, durationSec) {
  const pointCount = Math.max(2, Math.ceil(durationSec * 60));
  const curve = new Float32Array(pointCount);
  const isRising = to > from;
  for (let i = 0; i < pointCount; i++) {
    const t = i / (pointCount - 1);
    const shape = isRising ? Math.sin(t * Math.PI / 2) : 1 - Math.cos(t * Math.PI / 2);
    curve[i] = from + (to - from) * shape;
  }
  return curve;
}

/** Smooth curve from `from` down to `low` at the midpoint, then back up to 1. */
function dipCurve(from, low, durationSec) {
  const pointCount = Math.max(3, Math.ceil(durationSec * 60));
  const curve = new Float32Array(pointCount);
  const ease = t => (1 - Math.cos(t * Math.PI)) / 2;
  for (let i = 0; i < pointCount; i++) {
    const t = i / (pointCount - 1);
    curve[i] = t < 0.5 ? from + (low - from) * ease(t * 2) : low + (1 - low) * ease(t * 2 - 1);
  }
  return curve;
}

/** Ramps an AudioParam from its current value to `target`, replacing any ramp in progress. */
function rampParam(param, target, durationSec, ctx, { equalPower = true } = {}) {
  const now = ctx.currentTime;
  const current = param.value;
  const duration = Math.max(durationSec, MIN_FADE_SEC);
  param.cancelScheduledValues(now);
  param.setValueAtTime(current, now);
  if (equalPower) param.setValueCurveAtTime(equalPowerCurve(current, target, duration), now + 0.001, duration);
  else param.linearRampToValueAtTime(target, now + duration);
}

/** Builds a tiny silent WAV object URL, used to unlock <audio> elements inside the first tap (iOS). */
function createSilentWavUrl() {
  const sampleCount = 4410;
  const view = new DataView(new ArrayBuffer(44 + sampleCount * 2));
  const writeText = (offset, text) => [...text].forEach((ch, i) => view.setUint8(offset + i, ch.charCodeAt(0)));
  writeText(0, 'RIFF'); view.setUint32(4, 36 + sampleCount * 2, true); writeText(8, 'WAVE');
  writeText(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, 44100, true); view.setUint32(28, 88200, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  writeText(36, 'data'); view.setUint32(40, sampleCount * 2, true);
  return URL.createObjectURL(new Blob([view.buffer], { type: 'audio/wav' }));
}

/**
 * One playback channel. Roles: 'idle' → 'starting' (buffering) → 'active' → 'fadingOut' → 'idle'.
 * `generation` increments on every start/release so stale async callbacks can be ignored.
 */
class Voice {
  constructor(ctx, outputNode, silentUrl) {
    this.ctx = ctx;
    this.silentUrl = silentUrl;
    this.audio = new Audio();
    this.audio.preload = 'auto';
    this.trim = ctx.createGain();
    this.fade = ctx.createGain();
    this.fade.gain.value = 0;
    ctx.createMediaElementSource(this.audio).connect(this.trim).connect(this.fade).connect(outputNode);
    this.generation = 0;
    this.#resetState();
  }

  get isIdle() { return this.role === 'idle'; }
  get secondsLeft() { return (this.audio.duration || Infinity) - this.audio.currentTime; }

  /** Plays a silent clip within a user gesture so later programmatic play() calls are allowed (iOS). */
  prime() {
    this.audio.src = this.silentUrl;
    this.audio.play().then(() => { if (this.audio.src === this.silentUrl) this.audio.pause(); }).catch(() => {});
  }

  /** Loads a pad from the beginning at zero gain. Returns the play() promise (resolves once audio flows). */
  start(pad) {
    this.release();
    this.pad = pad;
    this.role = 'starting';
    this.trim.gain.value = pad.trimGain;
    this.audio.loop = true; // safety net: if a loop crossfade is ever missed, the element still loops
    this.audio.src = pad.file;
    return this.audio.play();
  }

  fadeIn(durationSec) {
    clearTimeout(this.releaseTimer);
    this.role = 'active';
    rampParam(this.fade.gain, 1, durationSec, this.ctx);
  }

  /** Fades to silence, then frees the voice and calls `onReleased`. */
  fadeOut(durationSec, onReleased) {
    clearTimeout(this.releaseTimer);
    this.role = 'fadingOut';
    rampParam(this.fade.gain, 0, durationSec, this.ctx);
    const releaseAfterMs = (Math.max(durationSec, MIN_FADE_SEC) + 0.1) * 1000;
    this.releaseTimer = setTimeout(() => { this.release(); onReleased(); }, releaseAfterMs);
  }

  /** Stops playback immediately and frees the voice. */
  release() {
    this.generation++;
    clearTimeout(this.releaseTimer);
    this.fade.gain.cancelScheduledValues(0);
    this.fade.gain.value = 0;
    if (this.audio.getAttribute('src')) {
      this.audio.pause();
      this.audio.removeAttribute('src');
      this.audio.load(); // stops any ongoing download
    }
    this.#resetState();
  }

  #resetState() {
    this.pad = null;
    this.role = 'idle';
  }
}

/** Public engine. All fade durations are in seconds. */
export class PadEngine {
  /**
   * @param {object} callbacks
   * @param {(state: {activePadId: string|null, fadingPadIds: string[]}) => void} callbacks.onStateChange
   * @param {(pad: object, error: Error) => void} callbacks.onError
   */
  constructor({ onStateChange = () => {}, onError = () => {} } = {}) {
    this.onStateChange = onStateChange;
    this.onError = onError;
    this.ctx = null;
    this.voices = [];
    this.activePadId = null;
    this.volumePercent = 75;
    this.outputMode = 'stereo';
  }

  /** Creates or resumes audio. Call from inside a tap/click handler before any playback. */
  unlock() {
    if (!this.ctx) this.#buildGraph();
    if (this.ctx.state !== 'running') this.ctx.resume().catch(() => {});
  }

  /** Tapping the active pad fades it out; any other pad crossfades in. */
  toggle(pad, fadeSec) {
    if (pad.id === this.activePadId) this.stop(fadeSec);
    else this.play(pad, fadeSec);
  }

  /** Crossfades from whatever is playing to `pad`. */
  play(pad, fadeSec) {
    this.unlock();
    this.#releaseStartingVoices();
    this.activePadId = pad.id;

    // Tapping back to a pad that is still fading out: just fade it back up.
    const fadingVoice = this.voices.find(v =>
      v.role === 'fadingOut' && v.pad.id === pad.id && v.secondsLeft > LOOP_CROSSFADE_SEC * 2);
    if (fadingVoice) {
      this.#crossfadeTo(fadingVoice, fadeSec);
      this.#emitState();
      return;
    }

    // Otherwise start a fresh voice; the outgoing pad keeps sounding until the new one is playing.
    const voice = this.#takeIdleVoice();
    this.#startVoice(voice, pad, () => this.#crossfadeTo(voice, fadeSec));
    this.#emitState();
  }

  /** Fades everything out over `fadeSec`. */
  stop(fadeSec) {
    this.#releaseStartingVoices();
    this.activePadId = null;
    this.#fadeOutAllExcept(null, fadeSec);
    this.#emitState();
  }

  /** Stops everything immediately (with a click-free micro-fade), including voices already fading. */
  panic() {
    this.#releaseStartingVoices();
    this.activePadId = null;
    this.#fadeOutAllExcept(null, PANIC_FADE_SEC, { includeFading: true });
    this.#emitState();
  }

  /** Sets master volume from a 0–100 slider value, on a squared (perceptual) curve. */
  setVolume(percent) {
    this.volumePercent = percent;
    if (this.ctx) this.#applyVolume(VOLUME_SMOOTHING_SEC);
  }

  /** Switches between 'stereo' and 'mono' without interrupting playback. */
  setOutputMode(mode) {
    this.outputMode = mode;
    if (this.ctx) this.#applyOutputMode(OUTPUT_SWITCH_SEC);
  }

  #buildGraph() {
    const ctx = this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.dip = ctx.createGain();
    this.master = ctx.createGain();
    this.dip.connect(this.master);
    this.stereoGain = ctx.createGain();
    this.monoGain = ctx.createGain();
    Object.assign(this.monoGain, { channelCount: 1, channelCountMode: 'explicit', channelInterpretation: 'speakers' });
    this.master.connect(this.stereoGain).connect(ctx.destination);
    this.master.connect(this.monoGain).connect(ctx.destination);
    this.#applyVolume(0);
    this.#applyOutputMode(0);

    const silentUrl = createSilentWavUrl();
    this.voices = Array.from({ length: VOICE_COUNT }, () => new Voice(ctx, this.dip, silentUrl));
    this.voices.forEach(voice => voice.prime());
    setInterval(() => this.#checkLoop(), LOOP_CHECK_MS);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && ctx.state !== 'running') ctx.resume().catch(() => {});
    });
  }

  #applyVolume(smoothingSec) {
    const gain = (this.volumePercent / 100) ** 2;
    if (smoothingSec === 0) this.master.gain.value = gain;
    else this.master.gain.setTargetAtTime(gain, this.ctx.currentTime, smoothingSec);
  }

  #applyOutputMode(durationSec) {
    const isMono = this.outputMode === 'mono';
    rampParam(this.stereoGain.gain, isMono ? 0 : 1, durationSec, this.ctx, { equalPower: false });
    rampParam(this.monoGain.gain, isMono ? MONO_GAIN : 0, durationSec, this.ctx, { equalPower: false });
  }

  /** Starts `pad` on `voice`; runs `onPlaying` once audio flows, unless superseded meanwhile. */
  #startVoice(voice, pad, onPlaying) {
    const playing = voice.start(pad);
    const generation = voice.generation;
    playing
      .then(() => {
        if (voice.generation !== generation) return;
        onPlaying();
        this.#emitState();
      })
      .catch(error => {
        if (voice.generation !== generation) return;
        voice.release();
        if (this.activePadId === pad.id) {
          this.activePadId = this.voices.find(v => v.role === 'active')?.pad.id ?? null;
        }
        this.#emitState();
        this.onError(pad, error);
      });
  }

  /** Near the end of the active pad, crossfades into a fresh copy of it from the start. */
  #checkLoop() {
    const current = this.voices.find(v => v.role === 'active' && v.pad.id === this.activePadId);
    if (!current || !current.audio.duration) return;
    if (this.voices.some(v => v.role === 'starting')) return;

    const loopFadeSec = Math.min(LOOP_CROSSFADE_SEC, current.audio.duration / 4);
    if (current.secondsLeft > loopFadeSec + LOOP_TRIGGER_MARGIN_SEC) return;

    const next = this.#takeIdleVoice();
    this.#startVoice(next, current.pad, () => {
      current.audio.loop = false;
      next.fadeIn(loopFadeSec);
      current.fadeOut(loopFadeSec, () => this.#emitState());
    });
  }

  /** Fades `voice` in and the others out; if another pad was playing, dips the output to mark the key change. */
  #crossfadeTo(voice, fadeSec) {
    const isKeyChange = this.voices.some(v => v !== voice && v.role === 'active');
    if (isKeyChange && fadeSec > MIN_FADE_SEC) this.#dipOutput(fadeSec);
    voice.fadeIn(fadeSec);
    this.#fadeOutAllExcept(voice, fadeSec);
  }

  /** Dips output to KEY_CHANGE_DIP_GAIN at the crossfade midpoint and back, replacing any dip in progress. */
  #dipOutput(durationSec) {
    const param = this.dip.gain;
    const now = this.ctx.currentTime;
    const current = param.value;
    param.cancelScheduledValues(now);
    param.setValueAtTime(current, now);
    param.setValueCurveAtTime(dipCurve(current, KEY_CHANGE_DIP_GAIN, durationSec), now + 0.001, durationSec);
  }

  /** Fades out every sounding voice except `keptVoice`. Voices already fading keep their fade unless `includeFading`. */
  #fadeOutAllExcept(keptVoice, fadeSec, { includeFading = false } = {}) {
    for (const voice of this.voices) {
      if (voice === keptVoice) continue;
      if (voice.role === 'active' || (includeFading && voice.role === 'fadingOut')) {
        voice.fadeOut(fadeSec, () => this.#emitState());
      }
    }
  }

  #releaseStartingVoices() {
    this.voices.filter(v => v.role === 'starting').forEach(v => v.release());
  }

  /** Returns a free voice, stealing the quietest fading one if all are busy. */
  #takeIdleVoice() {
    const idle = this.voices.find(v => v.isIdle);
    if (idle) return idle;
    const fading = this.voices.filter(v => v.role === 'fadingOut');
    const victim = fading.length
      ? fading.reduce((a, b) => (a.fade.gain.value <= b.fade.gain.value ? a : b))
      : this.voices.find(v => v.role !== 'active') ?? this.voices[0];
    victim.release();
    return victim;
  }

  #emitState() {
    const fadingPadIds = this.voices
      .filter(v => v.role === 'fadingOut' && v.pad.id !== this.activePadId)
      .map(v => v.pad.id);
    this.onStateChange({ activePadId: this.activePadId, fadingPadIds: [...new Set(fadingPadIds)] });
  }
}
