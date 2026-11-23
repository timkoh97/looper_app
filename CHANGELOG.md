# Changelog

All notable changes to Pad Looper are recorded here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/).

## Future updates

Planned work, roughly in priority order. Move items into a release section when they ship.

### Planned

- **Real-device testing** on iPhone (Safari) and Android (Chrome):
  - crossfades and the loop join at the 5-minute mark sound smooth
  - audio keeps playing with the screen locked, and on iPhone with the silent switch on
  - offline mode works after **⚙ → Download for offline**, including in airplane mode
- **Fixes from device testing:** fix any problems found in the tests above.
- **iOS fallback, only if needed:** if iOS won't play several pads at once, switch the iOS version to load pads fully into memory instead of streaming them.
- **visual updates**
- **bug fixes**
- **my own generated pads**
- **different versions of pads e.g. warm, shimmery**

### Known limitations

- **Untested on phones:** so far it has only been tested in desktop Edge.
- **Background playback:** on iPhone, and on Android with battery saver on, pads may stop when the screen locks. Keeping the screen awake and showing lock-screen controls should prevent this.
- **Volume dip at the loop point:** a few pads differ by up to about 1.7 dB between their start and end. The 8-second loop crossfade should smooth this over.

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
