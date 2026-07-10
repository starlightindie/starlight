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

## Development

```bash
npm install
npm run typecheck
npm run build
```

## Install locally

1. Run `npm run build`.
2. Open `chrome://extensions` in any Chromium browser.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select this repository's `dist` directory.
6. Open a regular YouTube watch URL.

## Architecture

- `src/content/overlay.ts` renders the immersive interface.
- `src/content/player.ts` bridges to YouTube's existing HTML5 video element.
- `src/content/gestures.ts` normalizes touch, mouse, and wheel navigation.
- `src/content/recommendations.ts` builds an infinite-feeling queue from page recommendations.
- `src/content/state.ts` provides centralized app state.
- `src/popup` and `src/options` expose user settings.
