const DEFAULT_SETTINGS = { enabled: true, animations: true, wheelNavigation: true, keyboardShortcuts: true };
const keys = Object.keys(DEFAULT_SETTINGS);
chrome.storage.sync.get(DEFAULT_SETTINGS).then(settings => {
  for (const key of keys) {
    const input = document.getElementById(key);
    if (!input) continue;
    input.checked = Boolean(settings[key]);
    input.addEventListener('change', () => chrome.storage.sync.set({ [key]: input.checked }));
  }
});
