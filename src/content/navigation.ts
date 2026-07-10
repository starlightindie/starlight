import { Store } from './state';
import { RecommendationQueue } from './recommendations';
import { getVideoId, navigateTo } from './youtube';
export class SwipeNavigation { constructor(private store: Store, private queue: RecommendationQueue) {} next(): void { const current = getVideoId(); if (current) this.store.pushHistory(current); const recommendation = this.queue.next(); if (recommendation) navigateTo(recommendation.url); } previous(): void { const previous = this.store.popHistory(); if (previous) navigateTo(previous); } }
