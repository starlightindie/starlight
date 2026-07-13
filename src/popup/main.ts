import { DEFAULT_SETTINGS } from '../shared/types';
const keys = ['enabled','animations','wheelNavigation','keyboardShortcuts'] as const;
const init = async (): Promise<void> => { const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS); for (const key of keys) { const input = document.getElementById(key) as HTMLInputElement; input.checked = settings[key]; input.addEventListener('change', () => void chrome.storage.sync.set({ [key]: input.checked })); } };
void init();
