// src/background.ts
chrome.action.onClicked.addListener(async (tab: chrome.tabs.Tab) => {
  if (!tab.id) return
  
  try {
    await chrome.tabs.sendMessage(tab.id, 'COPY_CONFLUENCE_MD')
  } catch (error) {
    // Content script might not be loaded yet
  }
})
  