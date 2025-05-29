// src/background.ts
chrome.action.onClicked.addListener(async (tab: chrome.tabs.Tab) => {
    console.log('Action clicked, tab:', tab)
    if (!tab.id) {
      console.log('No tab id')
      return
    }
    
    // Check if the tab URL matches our pattern
    if (!tab.url || !tab.url.includes('.atlassian.net/wiki/')) {
      console.log('Not a Confluence page:', tab.url)
      return
    }
    
    // First, try to send a message to see if content script is already loaded
    console.log('Sending message to tab:', tab.id)
    chrome.tabs.sendMessage(tab.id, 'COPY_CONFLUENCE_MD', (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error sending message:', chrome.runtime.lastError.message)
        
        // If content script is not loaded, inject it programmatically
        console.log('Injecting content script...')
        chrome.scripting.executeScript({
          target: { tabId: tab.id! },
          files: ['content.js']
        }, () => {
          if (chrome.runtime.lastError) {
            console.error('Error injecting script:', chrome.runtime.lastError.message)
          } else {
            // After injecting, send the message again
            setTimeout(() => {
              chrome.tabs.sendMessage(tab.id!, 'COPY_CONFLUENCE_MD')
            }, 100)
          }
        })
      } else {
        console.log('Message sent successfully, response:', response)
      }
    })
  })
  