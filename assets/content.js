(() => {
  'use strict';

  const DEFAULT_SETTINGS = {
    enabled: true,
    animations: true,
    swipeSensitivity: 80,
    wheelNavigation: true,
    keyboardShortcuts: true,
    autoFullscreen: false,
    hideCommentsButton: false,
    hideShareButton: false,
    darkMode: true,
    debugMode: false,
  };

  const STYLE = `
html.ys-active-page body > *:not(.ys-root) { visibility: hidden !important; }
.ys-root { position: fixed; inset: 0; z-index: 2147483647; color: white; background: radial-gradient(circle at 50% 15%, #242424, #050505 68%); font: 500 16px/1.4 Inter, Roboto, system-ui, sans-serif; overflow: hidden; touch-action: none; }
.ys-stage { position: absolute; inset: 0; display: grid; place-items: center; }
.ys-video-shell { width: min(100vw, calc(100vh * 16 / 9)); aspect-ratio: 16 / 9; border-radius: clamp(0px, 2vw, 24px); background: #000; box-shadow: 0 24px 80px #000a; overflow: hidden; display: grid; place-items: center; }
.ys-actions { position: absolute; right: clamp(1rem, 4vw, 3rem); bottom: 24%; display: grid; gap: .9rem; }
.ys-actions button, .ys-controls button, .ys-description-button { border: 0; color: white; background: color-mix(in srgb, #fff 16%, transparent); backdrop-filter: blur(18px); border-radius: 999px; min-width: 3rem; min-height: 3rem; cursor: pointer; transition: transform .18s ease, background .18s ease; }
.ys-actions button:hover, .ys-controls button:hover { transform: translate3d(0,-2px,0) scale(1.04); background: color-mix(in srgb, #fff 24%, transparent); }
.ys-meta { position: absolute; left: clamp(1rem, 5vw, 4rem); bottom: clamp(5rem, 10vh, 8rem); max-width: min(44rem, calc(100vw - 9rem)); text-shadow: 0 2px 16px #000; }
.ys-meta h1 { margin: .3rem 0; font-size: clamp(1.4rem, 3vw, 3rem); line-height: 1.05; }
.ys-channel { background: transparent; color: white; border: 0; font-weight: 800; font-size: 1rem; }
.ys-controls { position: absolute; left: 50%; bottom: 1.4rem; transform: translateX(-50%); display: flex; align-items: center; gap: .6rem; width: min(58rem, calc(100vw - 2rem)); }
.ys-controls progress { flex: 1; accent-color: #ff0033; height: .45rem; }
.ys-panel { position: absolute; background: color-mix(in srgb, #101010 84%, transparent); backdrop-filter: blur(24px); box-shadow: 0 0 80px #0008; transition: transform .28s cubic-bezier(.2,.8,.2,1); padding: 1.2rem; overflow: auto; }
.ys-comments { inset: 0 0 0 auto; width: min(28rem, 92vw); transform: translate3d(100%,0,0); }
.ys-description { inset: auto 0 0 0; max-height: 48vh; transform: translate3d(0,100%,0); border-radius: 24px 24px 0 0; }
.ys-show-comments .ys-comments, .ys-show-description .ys-description { transform: translate3d(0,0,0); }
.ys-comments-hidden [data-act="comments"], .ys-share-hidden [data-act="share"] { display: none; }
.ys-reduced-motion, .ys-reduced-motion * { transition: none !important; animation: none !important; }
@media (orientation: portrait) { .ys-video-shell { width: 100vw; height: 100vh; aspect-ratio: auto; border-radius: 0; } .ys-meta { bottom: 7rem; } }
@media (prefers-reduced-motion: reduce) { .ys-root, .ys-root * { transition: none !important; animation: none !important; } }
`;

  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const isWatchPage = () => location.hostname === 'www.youtube.com' && location.pathname === '/watch' && new URLSearchParams(location.search).has('v');
  const getVideoId = () => new URLSearchParams(location.search).get('v');
  const formatTime = seconds => {
    const value = Math.floor(seconds || 0);
    const h = Math.floor(value / 3600);
    const m = Math.floor((value % 3600) / 60);
    const s = value % 60;
    return h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
  };
  const readMetadata = () => ({
    title: qs('h1.ytd-watch-metadata yt-formatted-string, h1.title')?.innerText.trim() || document.title.replace(' - YouTube', ''),
    channelName: qs('#owner #channel-name a, ytd-video-owner-renderer a')?.innerText.trim() || '',
    views: qs('#info-container #info span, #count')?.innerText.trim() || '',
    uploadAge: qsa('#info-container #info span').at(2)?.innerText.trim() || '',
    description: qs('#description, ytd-text-inline-expander')?.innerText.trim() || '',
    duration: qs('video')?.duration ? formatTime(qs('video').duration) : '',
  });
  const readRecommendations = () => qsa('ytd-compact-video-renderer a#thumbnail[href*="/watch"], ytd-rich-item-renderer a#thumbnail[href*="/watch"]').map(anchor => {
    const url = new URL(anchor.href);
    const item = anchor.closest('ytd-compact-video-renderer, ytd-rich-item-renderer') || document;
    return { videoId: url.searchParams.get('v') || '', url: url.toString(), title: qs('#video-title', item)?.innerText.trim() || anchor.title };
  }).filter((item, index, all) => item.videoId && all.findIndex(other => other.videoId === item.videoId) === index);

  class YouTubeSwipeRuntime {
    constructor() {
      this.settings = { ...DEFAULT_SETTINGS };
      this.history = [];
      this.queue = [];
      this.overlay = null;
      this.startY = 0;
      this.startX = 0;
      this.dragging = false;
      this.wheelLocked = false;
      this.observer = null;
    }

    async start() {
      this.settings = { ...DEFAULT_SETTINGS, ...(await chrome.storage.sync.get(DEFAULT_SETTINGS)) };
      this.injectStyles();
      this.bindSpaEvents();
      this.activateIfNeeded();
    }

    injectStyles() {
      if (document.getElementById('ys-style')) return;
      const style = document.createElement('style');
      style.id = 'ys-style';
      style.textContent = STYLE;
      document.documentElement.append(style);
    }

    activateIfNeeded() {
      if (!this.settings.enabled || !isWatchPage()) {
        this.destroy();
        return;
      }
      this.queue = [...this.queue, ...readRecommendations()].filter((item, index, all) => all.findIndex(other => other.videoId === item.videoId) === index);
      if (!this.overlay) this.mountOverlay();
      this.render();
      this.observe();
    }

    mountOverlay() {
      this.overlay = document.createElement('section');
      this.overlay.className = 'ys-root';
      this.overlay.setAttribute('aria-label', 'YouTube Swipe immersive player');
      this.overlay.innerHTML = `<div class="ys-stage"><div class="ys-video-shell" aria-hidden="true"></div><div class="ys-actions"><button data-act="like" aria-label="Like">♥</button><button data-act="dislike" aria-label="Dislike">👍</button><button data-act="comments" aria-label="Open comments">💬</button><button data-act="share" aria-label="Share">↗</button><button data-act="save" aria-label="Save">＋</button></div><div class="ys-meta"></div><div class="ys-controls"><button data-act="play" aria-label="Play or pause">▶</button><button data-act="previous" aria-label="Previous video">↑</button><button data-act="next" aria-label="Next video">↓</button><progress value="0" max="1"></progress><button data-act="mute">M</button><button data-act="pip">PiP</button><button data-act="full">⛶</button></div></div><aside class="ys-panel ys-comments"><button data-act="close-comments">Close</button><div>Comments remain powered by YouTube.</div></aside><aside class="ys-panel ys-description"><button data-act="close-description">Close</button><div class="ys-description-content"></div></aside>`;
      this.overlay.addEventListener('click', event => this.handleClick(event));
      this.overlay.addEventListener('pointerdown', event => this.onPointerDown(event));
      this.overlay.addEventListener('pointerup', event => this.onPointerUp(event));
      this.overlay.addEventListener('pointercancel', () => { this.dragging = false; });
      window.addEventListener('wheel', event => this.onWheel(event), { passive: false });
      window.addEventListener('keydown', event => this.onKeyDown(event));
      document.documentElement.classList.add('ys-active-page');
      document.body.append(this.overlay);
    }

    render() {
      if (!this.overlay) return;
      const metadata = readMetadata();
      this.overlay.classList.toggle('ys-comments-hidden', this.settings.hideCommentsButton);
      this.overlay.classList.toggle('ys-share-hidden', this.settings.hideShareButton);
      this.overlay.classList.toggle('ys-reduced-motion', !this.settings.animations);
      qs('.ys-meta', this.overlay).innerHTML = `<button class="ys-channel">@${metadata.channelName || 'YouTube'}</button><h1>${metadata.title}</h1><p>${[metadata.views, metadata.uploadAge, metadata.duration].filter(Boolean).join(' • ')}</p><button data-act="description" class="ys-description-button">${metadata.description ? metadata.description.slice(0, 140) : 'Open description'}</button>`;
      qs('.ys-description-content', this.overlay).textContent = metadata.description || 'No description available.';
    }

    navigate(direction) {
      if (this.settings.animations && this.overlay) {
        this.overlay.animate([{ transform: `translate3d(0, ${direction === 'next' ? '4rem' : '-4rem'}, 0)`, opacity: 0.86 }, { transform: 'translate3d(0,0,0)', opacity: 1 }], { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' });
      }
      if (direction === 'previous') {
        const previous = this.history.pop();
        if (previous) this.goTo(`https://www.youtube.com/watch?v=${previous}`);
        return;
      }
      const current = getVideoId();
      if (current) this.history.push(current);
      if (this.queue.length < 3) this.queue.push(...readRecommendations());
      const next = this.queue.shift();
      if (next) this.goTo(next.url);
    }

    goTo(url) {
      history.pushState(null, '', url);
      window.dispatchEvent(new PopStateEvent('popstate'));
      document.dispatchEvent(new CustomEvent('yt-navigate-finish'));
    }

    handleClick(event) {
      const action = event.target.closest('[data-act]')?.dataset.act;
      const video = qs('video');
      if (!action) return;
      if (action === 'play' && video) video.paused ? video.play() : video.pause();
      if (action === 'mute' && video) video.muted = !video.muted;
      if (action === 'pip' && video && document.pictureInPictureEnabled) video.requestPictureInPicture();
      if (action === 'full') document.fullscreenElement ? document.exitFullscreen() : this.overlay.requestFullscreen?.();
      if (action === 'next') this.navigate('next');
      if (action === 'previous') this.navigate('previous');
      if (action === 'comments') this.overlay.classList.add('ys-show-comments');
      if (action === 'close-comments') this.overlay.classList.remove('ys-show-comments');
      if (action === 'description') this.overlay.classList.add('ys-show-description');
      if (action === 'close-description') this.overlay.classList.remove('ys-show-description');
    }

    onPointerDown(event) {
      this.dragging = true;
      this.startY = event.clientY;
      this.startX = event.clientX;
      this.overlay.setPointerCapture(event.pointerId);
    }

    onPointerUp(event) {
      if (!this.dragging) return;
      const dy = event.clientY - this.startY;
      const dx = event.clientX - this.startX;
      this.dragging = false;
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > this.settings.swipeSensitivity) this.navigate(dy < 0 ? 'next' : 'previous');
    }

    onWheel(event) {
      if (!this.settings.wheelNavigation || this.wheelLocked || Math.abs(event.deltaY) < this.settings.swipeSensitivity) return;
      event.preventDefault();
      this.wheelLocked = true;
      this.navigate(event.deltaY > 0 ? 'next' : 'previous');
      setTimeout(() => { this.wheelLocked = false; }, 700);
    }

    onKeyDown(event) {
      if (!this.settings.keyboardShortcuts || event.target?.matches?.('input, textarea, [contenteditable="true"]')) return;
      const video = qs('video');
      if (event.key === 'ArrowDown') { event.preventDefault(); this.navigate('next'); }
      if (event.key === 'ArrowUp') { event.preventDefault(); this.navigate('previous'); }
      if ((event.key === ' ' || event.key.toLowerCase() === 'k') && video) { event.preventDefault(); video.paused ? video.play() : video.pause(); }
      if (event.key.toLowerCase() === 'j' && video) video.currentTime -= 10;
      if (event.key.toLowerCase() === 'l' && video) video.currentTime += 10;
      if (event.key.toLowerCase() === 'm' && video) video.muted = !video.muted;
      if (event.key.toLowerCase() === 'f' && this.overlay) document.fullscreenElement ? document.exitFullscreen() : this.overlay.requestFullscreen?.();
    }

    observe() {
      this.observer?.disconnect();
      this.observer = new MutationObserver(() => this.render());
      this.observer.observe(document.body, { childList: true, subtree: true });
    }

    bindSpaEvents() {
      document.addEventListener('yt-navigate-finish', () => this.activateIfNeeded());
      document.addEventListener('yt-page-data-updated', () => this.activateIfNeeded());
      window.addEventListener('popstate', () => this.activateIfNeeded());
    }

    destroy() {
      this.observer?.disconnect();
      this.overlay?.remove();
      this.overlay = null;
      document.documentElement.classList.remove('ys-active-page');
    }
  }

  new YouTubeSwipeRuntime().start();
})();
