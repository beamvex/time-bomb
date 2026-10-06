# Decompilation Report — Time Bomb 1.0.0 (AppImage)

**Ticket:** GAM-1 — Decompile the Game
**Target:** `release/Time Bomb-1.0.0.AppImage` (sha256 `3a042fe4d435c992c041d501795ff0aff40133371d3f9b1715fe17d078c36a4c`)
**Also analyzed:** `release/linux-unpacked/` — identical payload, already extracted.

## Summary

"Time Bomb" is not a game in the traditional sense — it is a small **Electron
prank/joke app**: a countdown timer styled like a bomb's LED timer that quits the
application when it reaches zero. There is no gameplay, scoring, enemy AI, or
game loop — just a `setInterval` ticking once per second.

## Toolchain used

| Step | Tool |
|---|---|
| AppImage extraction | `Time Bomb-1.0.0.AppImage --appimage-extract` (built-in runtime) |
| asar unpack | `@electron/asar` (`npx`) |
| Source recovery | esbuild sourcemaps embed full `sourcesContent` → byte-exact original TypeScript |

Output layout:

- `app-extracted/` — contents of `resources/app.asar` (dist JS + sourcemaps + package.json)
- `recovered-src/` — original TypeScript reconstructed from the sourcemaps (`main.ts`, `preload.ts`, `renderer.ts`)

## Container / runtime

- AppImage type-2 (ELF runtime + squashfs); extracted root ≈ 284 MB.
- **Electron 37.10.3 / Chromium 138.0.7204.251** (from binary strings).
- `AppRun` — stock electron-builder bash launcher (sets `LD_LIBRARY_PATH`, execs `time-bomb`).
- `time-bomb.desktop` — `Exec=AppRun --no-sandbox %U`, Categories=Utility, Comment="TypeScript Hello World".
- `resources/app-update.yml` — electron-updater config: **GitHub provider, `beamvex/time-bomb`** (auto-update metadata; the app itself never calls `autoUpdater`, so it is dormant).

## Decompiled code

`package.json` inside the asar: name `time-bomb`, version `1.0.0`, main `dist/main.js`, CommonJS.

### `main.ts` (main process, 78 lines of bundled JS)

- Opens a fixed **420×260** `BrowserWindow`, menu bar hidden, loads `dist/index.html?seconds=N`.
- Countdown length resolution order: `--seconds=N` CLI flag → `TIMEBOMB_SECONDS` env var → default **10 s**.
- `ipcMain.on('timebomb:quit')` → `app.quit()`.
- Standard `activate`/`window-all-closed` handlers.

### `preload.ts`

- `contextBridge.exposeInMainWorld('timebomb', { quit })` — the only IPC surface; renderer can only ask the app to quit. Context isolation is on (default), no `nodeIntegration`.

### `renderer.ts`

- Reads `?seconds=` from the window URL (fallback 10 s), renders `HH:MM:SS` into `#count`, updates `document.title` each tick.
- `setInterval(tick, 1000)`; at `remaining <= 0` calls `window.timebomb.quit()` — **the "bomb" just closes the app. Nothing destructive.**

### `index.html`

- Dark card UI ("Time remaining" / countdown / "This window will close when it reaches 0.").
- Loads the **Seven Segment font from a CDN** (`fonts.cdnfonts.com`) — the only external network dependency, cosmetic only.
- Countdown digits styled green (`#0e8f19`) at 72 px.

## Assets inventory

| Asset | Notes |
|---|---|
| `time-bomb.png` (32/48/128/256 px) + `.DirIcon` | **Default Electron icon** — no custom game art |
| `resources.pak`, `chrome_*.pak`, `locales/*.pak` (55 files) | Stock Chromium UI/i18n paks |
| `icudtl.dat` (10 MB) | ICU data — stock Chromium |
| `snapshot_blob.bin`, `v8_context_snapshot.bin` | V8 startup snapshots — stock |
| `libEGL.so`, `libGLESv2.so`, `libvulkan.so.1`, `libvk_swiftshader.so`, `libffmpeg.so` | Stock Electron runtime libs |
| `LICENSES.chromium.html`, `LICENSE.electron.txt` | Third-party licenses |

No custom sprites, audio, fonts (bundled), levels, or data files exist — the asar contains only `dist/` + `package.json`.

## Shipped binary vs. current `src/`

The packaged build predates HEAD. Diffing the recovered TypeScript against `src/`:

- **`main.ts`**: shipped build lacks the close-confirmation dialog (`dialog.showMessageBox` "Close Time Bomb?") and the `isQuitting` flag — closing the window just quits.
- **`renderer.ts`**: shipped build lacks the pause/resume ("Defuse"/"Re-fuse"), reset and time-extension buttons, and the flashing `!!! TIME BOMB !!!` title under 1 minute.
- `preload.ts` is identical.

So the binary corresponds to roughly commit `7f7cc77`–era code, before commits `0709c6a`..`4aa6239` (controls, flashing title, layout) landed.

## Security notes

- Harmless: single quit-only IPC channel, no shell exec, no file system access, no network calls other than the font stylesheet.
- `Exec=AppRun --no-sandbox` in the desktop entry disables Chromium's sandbox (common for AppImages, still worth noting).
- Sourcemaps ship inside the asar, which is why the original TypeScript was recoverable verbatim.
