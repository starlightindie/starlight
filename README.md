# YouTube Swipe

YouTube Swipe is a Manifest V3 Chromium extension that turns regular YouTube watch pages into a fullscreen, Shorts-like swipe experience while reusing YouTube's native HTML5 player.

## Features

- Activates only on `https://www.youtube.com/watch*`.
- Reuses YouTube's existing video element and controls where possible.
- Fullscreen overlay with metadata, action buttons, mini controls, comments panel, and description sheet.
- Mouse, touch, wheel, trackpad, and keyboard navigation.
- Internal history stack for swiping back to previously viewed videos.
- Recommendation queue populated from YouTube's existing recommendation DOM.
- Popup and options pages for settings.
- Strict TypeScript, Vite, ES modules, and modular source layout.

## Install in Chrome from this folder

1. Download or clone this repository.
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the repository root folder, for example `starlight-main`.
6. Open a regular YouTube watch URL such as `https://www.youtube.com/watch?v=...`.

The repository root is directly loadable because `manifest.json` references committed JavaScript files in `assets/`.

## Development build

```bash
npm install
npm run typecheck
npm run build
```

If you build with Vite, you can also load the generated `dist` directory in Chrome.

## Architecture

- `src/content/overlay.ts` renders the immersive interface.
- `src/content/player.ts` bridges to YouTube's existing HTML5 video element.
- `src/content/gestures.ts` normalizes touch, mouse, and wheel navigation.
- `src/content/recommendations.ts` builds an infinite-feeling queue from page recommendations.
- `src/content/state.ts` provides centralized app state.
- `src/popup` and `src/options` expose user settings.
- `assets/content.js`, `assets/background.js`, `assets/popup.js`, and `assets/options.js` are committed browser-loadable JavaScript entry points so Chrome can load the unpacked repository root without a build step.
