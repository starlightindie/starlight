import { DEFAULT_SETTINGS, SwipeSettings } from '../shared/types';
const booleanKeys = ['enabled','animations','wheelNavigation','keyboardShortcuts','autoFullscreen','hideCommentsButton','hideShareButton','darkMode','debugMode'] as const;
const form = document.getElementById('form') as HTMLFormElement;
const init = async (): Promise<void> => { const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS); form.innerHTML = `${booleanKeys.map(key => `<label><input type="checkbox" name="${key}" ${settings[key] ? 'checked' : ''}> ${key}</label>`).join('<br>')}<label>Swipe sensitivity <input type="range" min="30" max="180" name="swipeSensitivity" value="${settings.swipeSensitivity}"></label>`; form.addEventListener('input', () => { const data = new FormData(form); const next: Partial<SwipeSettings> = { swipeSensitivity: Number(data.get('swipeSensitivity')) }; for (const key of booleanKeys) { next[key] = data.get(key) === 'on'; } void chrome.storage.sync.set(next); }); };
void init();
