chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ installedAt: Date.now() });
});
