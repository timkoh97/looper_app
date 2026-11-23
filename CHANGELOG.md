# Changelog

All notable changes to Pad Looper are recorded here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/).

## Future updates

Planned work, roughly in priority order. Move items into a release section when they ship.

### Planned

- **Remaining device testing:**
  - iPhone (Safari): crossfades and lock-screen playback both work (tested 2026-11-23). Still to check:
    - the loop join at the 5-minute mark
    - playing with the silent switch on
    - offline mode after **⚙ → Download for offline**, including in airplane mode
  - Android (Chrome): not tested yet. Check crossfades, the loop join, lock-screen playback and offline mode.
- **Fixes from device testing:** fix any problems found in the tests above.
- **Visual updates**
- **Bug fixes**
- **My own generated pads**
- **Different versions of pads, e.g. warm, shimmery**

### Known limitations

- **Partly tested on phones:** tested on iPhone (Safari) and desktop Edge only. The loop join hasn't yet been heard on a real device.
- **Background playback on Android:** with battery saver on, pads may stop when the screen locks. Keeping the screen awake and showing lock-screen controls should prevent this. (It works on iPhone.)
- **Volume dip at the loop point:** a few pads differ by up to about 1.7 dB between their start and end. The 8-second loop crossfade should smooth this over.
- **Other dark modes:** Samsung Internet's own dark mode and dark-mode browser extensions (such as Dark Reader) may still recolour the page.

## [Unreleased]

Nothing yet.

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
