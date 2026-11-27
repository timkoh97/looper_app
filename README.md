# Pad Looper

A web/mobile worship pad player, hosted on GitHub Pages. Tap a key (C–B) to play a looping ambient pad, and tap another key to crossfade to it.

**Open the app:** <https://timkoh97.github.io/looper_app/>. On a phone, add it to your home screen for the best experience. See [CHANGELOG.md](CHANGELOG.md) for what's new.

## Features

- **12 keys**, played on a piano-style keyboard. On a phone held upright, the keyboard is turned 90° anticlockwise.
- **Layout:** in landscape, the volume slider runs the full height of the screen, with PANIC / STOP and the stereo/mono toggle at the screen edge. In portrait, they're stacked in one column.
- **Seamless looping:** near the end of a pad, it crossfades into a fresh copy of itself.
- **Crossfades:** changing key crossfades between pads on gentle S-curves, with the volume dipping by 16 dB at the midpoint to mark the change. Starting from silence also fades in on an S-curve. The length is set in ⚙ settings (0–20 s, default 4 s). Tapping the playing key fades it out.
- **Two-pad limit:** while two pads are crossfading, other key taps are ignored and the key glows gold briefly. PANIC / STOP still works.
- **PANIC / STOP:** cuts all sound immediately, with a 50 ms fade to avoid a click.
- **Volume:** 0–100%. Changes only when you drag, so a stray tap can't jump it.
- **Stereo / mono toggle:** mono combines both channels and sends the result to both speakers.
- **Offline:** ⚙ → *Download for offline*. Add the app to your home screen so the browser keeps the downloaded pads.
- **Key highlighting:** the playing key is solid gold; the outgoing key pulses until its fade ends.

## Credits

Pads by **[Arisen Worship](https://pixabay.com/users/arisen_worship-49256057)** on Pixabay. Thank you!

## Licence

**Pad Looper** (code, design, icons and documentation) © 2026 Tim Koh, licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). See [LICENSE](LICENSE).

- **You may** use, copy, share and adapt it for free.
- **You must** credit Tim Koh, link to the licence, and release any adaptations under the same licence.
- **You may not** use it for commercial purposes, such as selling it.

**Pad audio:** the pads in `pads/` are not covered by this licence. They are by Arisen Worship and used under the [Pixabay Content License](https://pixabay.com/service/license-summary/) as part of this app. They are not offered for separate download or redistribution, and all rights in the recordings remain with Arisen Worship.

## Adding or replacing a pad

1. Trim a 5-minute fade-free section without re-encoding. This example takes 1:00–6:00, inside the steady part of the original 10:58 files:
   ```sh
   ffmpeg -ss 60 -i source.mp3 -t 300 -map 0:a -c copy -map_metadata -1 pads/<id>.mp3
   ```
   File ids are `C Db D Eb E F Gb G Ab A Bb B`.
2. Measure its loudness:
   ```sh
   ffmpeg -i pads/<id>.mp3 -af ebur128 -f null - 2>&1 | grep -A1 "Integrated loudness"
   ```
3. Set `loudnessLufs` for that key in [js/pads.js](js/pads.js). Keys with `null` show as disabled.
4. Bump `SHELL_CACHE` in [sw.js](sw.js) so installed copies pick up the change.

## Updating the icon

1. Edit [icons/icon.svg](icons/icon.svg), the source drawing.
2. Render it at 512 px with headless Edge or Chrome. Don't render smaller sizes directly: headless windows have a minimum width of about 500 px, so smaller screenshots come out cropped.
   ```sh
   msedge --headless --default-background-color=00000000 --window-size=512,512 --screenshot=icons/icon-512.png icons/icon.svg
   ```
3. Make the other sizes from it with ffmpeg:
   ```sh
   ffmpeg -i icons/icon-512.png -vf scale=192:192:flags=lanczos icons/icon-192.png
   ```
   For `icons/apple-touch-icon.png` (180 px), render a copy of the SVG with the background's `rx="96"` removed, so it's square, and save it without transparency (`-pix_fmt rgb24`). iOS adds its own rounded corners.
4. Bump `SHELL_CACHE` in [sw.js](sw.js).

## Running locally

Service workers and Web Audio need `http://localhost`, not `file://`:

```sh
python -m http.server 8000
# open http://localhost:8000
```

## Project layout

```text
index.html, css/style.css     UI
js/main.js                    wiring
js/audioEngine.js             voices, crossfades, looping, panic, stereo/mono
js/pads.js                    keys, files, loudness matching
js/ui.js                      keyboard, vertical slider, toast
js/settings.js                localStorage settings
js/offline.js, sw.js          offline download + service worker
js/mobileSupport.js           wake lock, media session, iOS audio session
manifest.webmanifest          home-screen install settings
icons/                        app icons (icon.svg is the source; PNGs are made from it)
pads/*.mp3                    pad audio (256 kbps stereo, 5:00)
CHANGELOG.md                  version history
ROADMAP.md                    planned work and known limitations
LICENSE                       CC BY-NC-SA 4.0 (pads excluded)
```
