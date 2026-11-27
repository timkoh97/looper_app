# Roadmap

Planned work for Pad Looper, grouped by theme. Shipped changes are recorded in [CHANGELOG.md](CHANGELOG.md); remove items here when they ship.

## Testing and fixes

- **Remaining device testing:**
  - iPhone (Safari): crossfades and lock-screen playback both work (tested 2026-11-23). Still to check:
    - the loop join at the 5-minute mark
    - playing with the silent switch on
    - offline mode after **⚙ → Download for offline**, including in airplane mode
  - Android (Chrome): works, per a tester.
  - Android (Firefox Focus): one tester reports it doesn't work. Cause unknown; reproduce and find out why.
  - iPhone with AirPods: one tester found stereo "more scratchy" than mono. Check whether mono sounds cleaner, and whether it happens at lower volume or on other headphones.
- **Fixes from device testing:** fix any problems found in the tests above.
- **Bug fixes**

## Design

- **Visual updates**

## Pads

- **My own generated pads**
- **Different versions of pads, e.g. warm, shimmery**

## Known limitations

- **Partly tested on phones:** tested on iPhone (Safari), Android (Chrome) and desktop Edge. The loop join hasn't yet been heard on a real device.
- **Firefox Focus (Android):** reported not working by one tester; unconfirmed.
- **Stereo on AirPods:** reported as sounding scratchy by one tester; unconfirmed.
- **Background playback on Android:** with battery saver on, pads may stop when the screen locks. Keeping the screen awake and showing lock-screen controls should prevent this. (It works on iPhone.)
- **Volume dip at the loop point:** a few pads differ by up to about 1.7 dB between their start and end. The 8-second loop crossfade should smooth this over.
- **Other dark modes:** Samsung Internet's own dark mode and dark-mode browser extensions (such as Dark Reader) may still recolour the page.
