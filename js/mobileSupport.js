/**
 * mobileSupport.js — Phone-friendly extras, each skipped silently where unsupported:
 * - iOS audio session: play even with the silent switch on (Safari 16.4+).
 * - Screen Wake Lock: keep the screen on while a pad sounds.
 * - Media Session: lock-screen / notification controls and title.
 */

let wakeLock = null;
let wantsWakeLock = false;

/** Marks the page as a media-playback app so iOS ignores the ringer/silent switch. */
export function configureAudioSession() {
  if (navigator.audioSession) navigator.audioSession.type = 'playback';
}

/** Holds or releases the screen wake lock. */
export async function setScreenAwake(shouldStayAwake) {
  wantsWakeLock = shouldStayAwake;
  if (!('wakeLock' in navigator)) return;
  try {
    if (shouldStayAwake && !wakeLock) {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    } else if (!shouldStayAwake && wakeLock) {
      await wakeLock.release();
    }
  } catch { /* denied, e.g. low battery mode */ }
}

// The browser drops the wake lock when the page is hidden; re-acquire on return.
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && wantsWakeLock) setScreenAwake(true);
});

/**
 * Wires lock-screen controls.
 * @param {{onPlay: () => void, onPause: () => void, onStop: () => void}} handlers
 */
export function initMediaSession({ onPlay, onPause, onStop }) {
  if (!('mediaSession' in navigator)) return;
  const actions = { play: onPlay, pause: onPause, stop: onStop };
  for (const [action, handler] of Object.entries(actions)) {
    try { navigator.mediaSession.setActionHandler(action, handler); } catch { /* action unsupported */ }
  }
}

/** Updates the lock-screen title and play state. */
export function updateMediaSession(padLabel) {
  if (!('mediaSession' in navigator)) return;
  navigator.mediaSession.playbackState = padLabel ? 'playing' : 'paused';
  if (padLabel && 'MediaMetadata' in window) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: `${padLabel} pad`,
      artist: 'Pad Looper · pads by Arisen Worship',
      // Square and opaque: iOS rounds the corners itself and shows transparency as white.
      artwork: [{ src: 'icons/artwork-512.png', sizes: '512x512', type: 'image/png' }],
    });
  }
}
