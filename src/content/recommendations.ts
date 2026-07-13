import { Recommendation } from '../shared/types';
import { readRecommendations } from './youtube';
export class RecommendationQueue { private queue: Recommendation[] = []; refresh(): Recommendation[] { const seen = new Set(this.queue.map(item => item.videoId)); this.queue = [...this.queue, ...readRecommendations().filter(item => !seen.has(item.videoId))]; return this.queue; } next(): Recommendation | null { if (this.queue.length < 3) this.refresh(); return this.queue.shift() ?? null; } snapshot(): Recommendation[] { return [...this.queue]; } }
