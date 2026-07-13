const DEFAULT_SETTINGS = { enabled: true, animations: true, swipeSensitivity: 80, wheelNavigation: true, keyboardShortcuts: true, autoFullscreen: false, hideCommentsButton: false, hideShareButton: false, darkMode: true, debugMode: false };
const booleanKeys = ['enabled','animations','wheelNavigation','keyboardShortcuts','autoFullscreen','hideCommentsButton','hideShareButton','darkMode','debugMode'];
const form = document.getElementById('form');
chrome.storage.sync.get(DEFAULT_SETTINGS).then(settings => {
  form.innerHTML = `${booleanKeys.map(key => `<label><input type="checkbox" name="${key}" ${settings[key] ? 'checked' : ''}> ${key}</label>`).join('<br>')}<label>Swipe sensitivity <input type="range" min="30" max="180" name="swipeSensitivity" value="${settings.swipeSensitivity}"></label>`;
  form.addEventListener('input', () => {
    const data = new FormData(form);
    const next = { swipeSensitivity: Number(data.get('swipeSensitivity')) };
    for (const key of booleanKeys) next[key] = data.get(key) === 'on';
    chrome.storage.sync.set(next);
  });
});
