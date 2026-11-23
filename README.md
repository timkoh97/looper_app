# Pad Looper

A web/mobile worship pad player, hosted on GitHub Pages. Tap a key (C–B) to play a looping ambient pad, and tap another key to crossfade to it.

## Features

- **12 keys**, played on a piano-style keyboard. On a phone held upright, the keyboard is turned 90° anticlockwise.
- **Seamless looping:** near the end of a pad, it crossfades into a fresh copy of itself.
- **Crossfades:** changing key crossfades between pads. The length is set in ⚙ settings (0–20 s, default 4 s). Tapping the playing key fades it out.
- **STOP:** cuts all sound immediately, with a 50 ms fade to avoid a click.
- **Volume:** 0–100%. Changes only when you drag, so a stray tap can't jump it.
- **Stereo / mono toggle:** mono combines both channels and sends the result to both speakers.
- **Offline:** ⚙ → *Download for offline*. Add the app to your home screen so the browser keeps the downloaded pads.
- **Key highlighting:** the playing key is solid gold; the outgoing key pulses until its fade ends.

## Credits

Pads by **[Arisen Worship](https://pixabay.com/users/arisen_worship-49256057)** on Pixabay. Thank you!

## Licence for the pad audio

The pads in `pads/` are used under the [Pixabay Content License](https://pixabay.com/service/license-summary/) as part of this app. They are not offered for separate download or redistribution. All rights in the recordings remain with Arisen Worship.

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

## Running locally

Service workers and Web Audio need `http://localhost`, not `file://`:

```sh
python -m http.server 8000
# open http://localhost:8000
```

## Project layout

```
index.html, css/style.css     UI
js/main.js                    wiring
js/audioEngine.js             voices, crossfades, looping, panic, stereo/mono
js/pads.js                    keys, files, loudness matching
js/ui.js                      keyboard, vertical slider, toast
js/settings.js                localStorage settings
js/offline.js, sw.js          offline download + service worker
js/mobileSupport.js           wake lock, media session, iOS audio session
pads/*.mp3                    pad audio (256 kbps stereo, 5:00)
```
