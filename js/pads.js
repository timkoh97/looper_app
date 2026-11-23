/**
 * pads.js — The 12 keys and their pad files.
 *
 * Pads by Arisen Worship (https://pixabay.com/users/arisen_worship-49256057),
 * trimmed to 5:00 from the steady middle section (no fade-in/out).
 *
 * To add a pad: drop `pads/<id>.mp3` in place and fill in its `loudnessLufs`
 * (see README for the ffmpeg commands). Keys with `loudnessLufs: null` are shown disabled.
 */

/** All pads are level-matched to this integrated loudness. */
const TARGET_LUFS = -14;

/**
 * Keys in chromatic order.
 * `labelLines`: one line for white keys, [sharp, flat] for black keys.
 * `blackPos`: black-key position in white-key units (absent for white keys).
 */
const KEY_DEFINITIONS = [
  { id: 'C',  labelLines: ['C'],       loudnessLufs: -11.7 },
  { id: 'Db', labelLines: ['C♯', 'D♭'], loudnessLufs: -12.6, blackPos: 1 },
  { id: 'D',  labelLines: ['D'],       loudnessLufs: -13.8 },
  { id: 'Eb', labelLines: ['D♯', 'E♭'], loudnessLufs: -14.1, blackPos: 2 },
  { id: 'E',  labelLines: ['E'],       loudnessLufs: -12.4 },
  { id: 'F',  labelLines: ['F'],       loudnessLufs: -11.8 },
  { id: 'Gb', labelLines: ['F♯', 'G♭'], loudnessLufs: -13.0, blackPos: 4 },
  { id: 'G',  labelLines: ['G'],       loudnessLufs: -13.4 },
  { id: 'Ab', labelLines: ['G♯', 'A♭'], loudnessLufs: -14.0, blackPos: 5 },
  { id: 'A',  labelLines: ['A'],       loudnessLufs: -12.1 },
  { id: 'Bb', labelLines: ['A♯', 'B♭'], loudnessLufs: -12.3, blackPos: 6 },
  { id: 'B',  labelLines: ['B'],       loudnessLufs: -11.8 },
];

/** Pads with derived fields: file URL, availability, display label and loudness-matching gain. */
export const PADS = KEY_DEFINITIONS.map(key => ({
  ...key,
  label: key.labelLines.join('/'),
  isBlack: key.blackPos !== undefined,
  isAvailable: key.loudnessLufs !== null,
  file: `pads/${key.id}.mp3`,
  trimGain: key.loudnessLufs === null ? 1 : 10 ** ((TARGET_LUFS - key.loudnessLufs) / 20),
}));

/** Looks up a pad by id. */
export const findPad = padId => PADS.find(pad => pad.id === padId);
