chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'openPopup') {
    try {
      chrome.action.openPopup()
      sendResponse({ success: true })
    } catch (error) {
      sendResponse({ success: false, error: error.message })
    }
    return true // Indicates we will send a response
  }
})
