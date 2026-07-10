import '../ui/styles/overlay.css';
import { GestureController } from './gestures';
import { SwipeNavigation } from './navigation';
import { Overlay } from './overlay';
import { YouTubePlayerBridge } from './player';
import { RecommendationQueue } from './recommendations';
import { SettingsStore } from './settings';
import { Store } from './state';
import { animateSwipe } from './animations';
import { getVideoId, isWatchPage, readMetadata } from './youtube';

class YouTubeSwipeApp { private store = new Store(); private settings = new SettingsStore(); private player = new YouTubePlayerBridge(); private queue = new RecommendationQueue(); private navigation = new SwipeNavigation(this.store, this.queue); private overlay: Overlay | null = null; private gestures: GestureController | null = null; private observer: MutationObserver | null = null;
  async start(): Promise<void> { this.store.patch({ settings: await this.settings.load() }); this.bindSpaEvents(); await this.activateIfNeeded(); }
  private async activateIfNeeded(): Promise<void> { if (!isWatchPage() || !this.settings.value.enabled) { this.destroy(); return; } await this.player.attach(); this.queue.refresh(); this.store.patch({ active: true, currentVideoId: getVideoId(), metadata: readMetadata(), forwardQueue: this.queue.snapshot() }); if (!this.overlay) { this.overlay = new Overlay(this.store, this.player, { next: () => this.navigate('next'), previous: () => this.navigate('previous') }); this.overlay.mount(); this.gestures = new GestureController(this.overlay.root, { threshold: this.settings.value.swipeSensitivity, wheelEnabled: () => this.settings.value.wheelNavigation, onNavigate: direction => this.navigate(direction) }); this.gestures.connect(); this.bindKeyboard(); } this.observeMetadata(); }
  private navigate(direction: 'next' | 'previous'): void { if (!this.overlay) return; animateSwipe(this.overlay.root, direction, this.settings.value.animations); direction === 'next' ? this.navigation.next() : this.navigation.previous(); }
  private bindKeyboard(): void { window.addEventListener('keydown', event => { if (!this.settings.value.keyboardShortcuts || (event.target as HTMLElement)?.matches('input, textarea, [contenteditable="true"]')) return; if (event.key === 'ArrowDown') { event.preventDefault(); this.navigate('next'); } else if (event.key === 'ArrowUp') { event.preventDefault(); this.navigate('previous'); } else if (event.key === ' ' || event.key.toLowerCase() === 'k') { event.preventDefault(); this.player.playPause(); } else if (event.key.toLowerCase() === 'j') this.player.seek(-10); else if (event.key.toLowerCase() === 'l') this.player.seek(10); else if (event.key === 'ArrowLeft') this.player.seek(-5); else if (event.key === 'ArrowRight') this.player.seek(5); else if (event.key.toLowerCase() === 'm') this.player.mute(); else if (event.key.toLowerCase() === 'c') this.player.captions(); else if (event.key.toLowerCase() === 'f' && this.overlay) this.player.fullscreen(this.overlay.root); }); }
  private bindSpaEvents(): void { ['yt-navigate-finish','yt-page-data-updated'].forEach(name => document.addEventListener(name, () => void this.activateIfNeeded())); window.addEventListener('popstate', () => void this.activateIfNeeded()); }
  private observeMetadata(): void { this.observer?.disconnect(); this.observer = new MutationObserver(() => this.store.patch({ currentVideoId: getVideoId(), metadata: readMetadata(), forwardQueue: this.queue.refresh() })); this.observer.observe(document.body, { childList: true, subtree: true }); }
  private destroy(): void { this.observer?.disconnect(); this.gestures?.disconnect(); this.overlay?.unmount(); this.overlay = null; this.gestures = null; this.store.patch({ active: false }); }
}
void new YouTubeSwipeApp().start();
