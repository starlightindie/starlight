chrome.runtime.onInstalled.addListener(() => { void chrome.storage.sync.set({ installedAt: Date.now() }); });
