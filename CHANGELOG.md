# Changelog

All notable changes to Pad Looper are recorded here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

Nothing yet.

## [0.4.2] – 2026-11-27

### Added

- **Version label:** the app version (e.g. v0.4.2) now shows after the title, so testers can say which version they're on.

## [0.4.1] – 2026-11-27

### Changed

- **Ignored taps:** the tapped key now glows gold and fades slowly back (1.2 s), instead of a sharp red flash.

## [0.4.0] – 2026-11-27

### Added

- **Two-pad limit:** only two pads can sound at once, one fading in (or loading) and one fading out. Key taps during that time are ignored, including the two keys involved, and the tapped key flashes red. Taps work again once the fade-out ends. PANIC / STOP and the loop crossfade are unaffected.

### Fixed

- **Rapid taps:** tapping several keys within the crossfade time could leave the wrong pad playing (reported on Android Chrome). The two-pad limit prevents this. The root cause isn't confirmed; the likely cause is Android limiting how many audio players can start at once.

## [0.3.2] – 2026-11-27

### Changed

- **Key-change dip:** deeper, now −10 dB (about 32% amplitude) at the midpoint of the crossfade, was −6 dB (50%).

## [0.3.1] – 2026-11-27

### Changed

- **PANIC / STOP:** the STOP button is now labelled "PANIC / STOP" over two lines, to make clear it cuts all sound at once.
- **Black-key labels:** slightly larger (13 px, was 11 px) so they're easier to read.

## [0.3.0] – 2026-11-27

### Changed

- **Key-change dip:** changing key now dips the volume to half (50% amplitude, about −6 dB) at the midpoint of the crossfade, then brings it back up, so the change is easier to hear. The loop crossfade and fading out the playing key are unchanged.

## [0.2.1] – 2026-11-23

### Added

- **Licence:** Pad Looper's code, design, icons and docs are now © 2026 Tim Koh under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). Anyone can use, share and adapt it with credit, adaptations must use the same licence, and it can't be sold. The pad audio isn't covered; it stays under the Pixabay Content License. The licence is in `LICENSE`, the README and ⚙ settings → Credits.

### Changed

- **README:** added a link to the live app, the landscape layout, steps for updating the icon, and `icons/`, `LICENSE` and `CHANGELOG.md` in the project layout.

## [0.2.0] – 2026-11-23

### Added

- **iPhone home-screen icon:** a new square 180 px icon with no rounded corners and no see-through areas, because iOS adds its own rounded corners.

### Changed

- **Landscape layout:** the volume slider now has its own column running the full height of the screen. STOP (top) and the stereo/mono toggle (bottom) have moved to a column at the screen edge. Portrait is unchanged.
- **App icon redesigned:** it now shows the keys C to E (C, C♯, D, D♯, E) with D lit gold, centred on a dark background. If you added Pad Looper to your home screen before this version, remove it and add it again to get the new icon.

### Fixed

- **Fading keys:** they now pulse between dim gold and their normal colour. Before, they faded to transparent, which let the white key show through a fading black key.
- **Dark mode:** the browser's automatic dark mode (for example, Chrome on Android) no longer turns the white keys black. The page now tells the browser it's already dark (`color-scheme: dark`).
- **App icon:** the 192 px icon (used for Android installs, and previously for the iPhone home screen) was broken, showing a white background and only the left edge of the icon. It's now made by shrinking the 512 px version.

## [0.1.0] – 2026-11-23

First release.

### Added

- **Keyboard:** 12 keys (C–B), turned 90° anticlockwise on a phone held upright (C at the bottom).
- **Playing:**
  - Seamless looping: near the end, each pad crossfades into a fresh copy of itself over 8 s.
  - Changing key crossfades between pads, keeping the overall loudness steady. The length is set in ⚙ settings (0–20 s, default 4 s).
  - Tapping the playing key fades it out.
  - **STOP** cuts all sound immediately, with a 50 ms fade to avoid a click.
- **Key highlighting:** the playing key is solid gold; the key you're leaving pulses until its fade ends.
- **Controls:**
  - Volume slider (0–100%). It changes only when you drag, so a stray tap can't jump it.
  - **Stereo/mono toggle**, stereo by default. Mono combines both channels and is boosted 3 dB so it doesn't sound quieter.
- **Settings:** crossfade length, volume and output mode are remembered between visits.
- **Offline:** installable to the home screen, with a button to download all 12 pads to the phone.
- **Phone features:** keeps the screen awake while playing, shows lock-screen controls, and on iPhone plays even with the silent switch on.
- **Pads:** 12 pads by [Arisen Worship](https://pixabay.com/users/arisen_worship-49256057), used under the Pixabay Content License. Each is a 5-minute fade-free section (1:00–6:00 of the original), cut without re-encoding, and the app evens out their loudness.
- **Design:** flat, with no shadows or glows.

[Unreleased]: https://github.com/timkoh97/looper_app/compare/v0.4.2...HEAD
[0.4.2]: https://github.com/timkoh97/looper_app/compare/v0.4.1...v0.4.2
[0.4.1]: https://github.com/timkoh97/looper_app/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/timkoh97/looper_app/compare/v0.3.2...v0.4.0
[0.3.2]: https://github.com/timkoh97/looper_app/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/timkoh97/looper_app/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/timkoh97/looper_app/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/timkoh97/looper_app/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/timkoh97/looper_app/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/timkoh97/looper_app/releases/tag/v0.1.0
