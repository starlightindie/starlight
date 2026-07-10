export type Direction = 'next' | 'previous';
export interface SwipeSettings { enabled: boolean; animations: boolean; swipeSensitivity: number; wheelNavigation: boolean; keyboardShortcuts: boolean; autoFullscreen: boolean; hideCommentsButton: boolean; hideShareButton: boolean; darkMode: boolean; debugMode: boolean; }
export interface VideoMetadata { title: string; channelName: string; views: string; uploadAge: string; description: string; verified: boolean; duration: string; subscriberCount: string; }
export interface Recommendation { videoId: string; url: string; title: string; channelName: string; duration: string; }
export interface AppState { active: boolean; currentVideoId: string | null; history: string[]; forwardQueue: Recommendation[]; metadata: VideoMetadata; settings: SwipeSettings; commentsOpen: boolean; descriptionOpen: boolean; }
export const DEFAULT_SETTINGS: SwipeSettings = { enabled: true, animations: true, swipeSensitivity: 80, wheelNavigation: true, keyboardShortcuts: true, autoFullscreen: false, hideCommentsButton: false, hideShareButton: false, darkMode: true, debugMode: false };
