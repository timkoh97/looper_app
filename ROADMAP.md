# Roadmap

Planned work for Pad Looper, grouped by theme. Shipped changes are recorded in [CHANGELOG.md](CHANGELOG.md); remove items here when they ship.

## Testing and fixes

Ask testers to report the version shown after the title (e.g. v0.6.3).

### Device testing

| Platform | Browser | Plays & crossfades | Rapid taps | Loop join (5:00) | Lock screen / background | Offline | Notes |
|---|---|---|---|---|---|---|---|
| iPhone | Safari | ✓ 0.6.x | ✓ | ✓ (G only) | ✓ | ✓ incl. airplane mode | Plays with the silent switch on ✓ (0.6.x) |
| iPhone | Chrome | – | – | – | – | – | Uses Safari's engine (WebKit), like all iPhone browsers |
| iPhone | Firefox | – | – | – | – | – | WebKit |
| iPhone | Firefox Focus | – | – | – | – | – | WebKit; clears data on close, so offline won't persist |
| iPhone | Edge | – | – | – | – | – | WebKit |
| Android | Chrome | ✓ (tester) | – | – | – | – | |
| Android | Firefox | – | – | – | – | – | Test to see whether the Focus failure is Firefox in general |
| Android | Firefox Focus | ✗ (tester) | – | – | – | – | Reported not working; cause unknown, reproduce. Clears data on close |
| Android | Edge | – | – | – | – | – | |
| Windows | Chrome | – | – | – | – | – | |
| Windows | Firefox | – | – | – | – | – | |
| Windows | Edge | ✓ | – | – | – | – | |
| Mac | Safari | – | – | – | – | – | |
| Mac | Chrome | – | – | – | – | – | |
| Mac | Firefox | – | – | – | – | – | |
| Mac | Edge | – | – | – | – | – | |

✓ works · ✗ fails · – not tested yet. **Rapid taps:** tap several keys during a crossfade; the third should be ignored with a gold glow (two-pad limit, 0.4.0). **Loop join:** let a pad play past 5:00 and listen for a gap or jump.

### Other checks

- **iPhone with AirPods:** one tester found stereo "more scratchy" than mono. Check whether mono sounds cleaner, and whether it happens at lower volume or on other headphones.

### Fixes

- **Fixes from device testing:** fix any problems found in the tests above.
- **Bug fixes**

## Design

- **Visual updates**

## Pads

- **My own generated pads**
- **Different versions of pads, e.g. warm, shimmery**

## Future app

Pad Looper is a proof of concept for a future native app (iOS / iPadOS, possibly Android). Ideas for that app, not this project:

- **Lock-screen controls that drive the pad:** play/pause and key name on the lock screen and in Control Centre, controlling the pad engine itself. In this web version, iOS treats the underlying audio file as a 5-minute track, and its play button only works some of the time, because Safari ties the controls to one of several audio elements the engine crossfades between. A native app would own the controls directly (iOS: `MPRemoteCommandCenter` and `MPNowPlayingInfoCenter`; Android: `MediaSession`).

## Known limitations

- **Partly tested:** see the device testing table. The loop join has only been heard on one pad (G, iPhone Safari).
- **Firefox Focus (Android):** reported not working by one tester; unconfirmed.
- **Stereo on AirPods:** reported as sounding scratchy by one tester; unconfirmed.
- **Background playback on Android:** with battery saver on, pads may stop when the screen locks. Keeping the screen awake and showing lock-screen controls should prevent this. (It works on iPhone.)
- **Level change at the loop point:** a few pads differ by up to about 1.7 dB between their start and end. The 8-second loop crossfade should smooth this over.
- **Other dark modes:** Samsung Internet's own dark mode and dark-mode browser extensions (such as Dark Reader) may still recolour the page.
