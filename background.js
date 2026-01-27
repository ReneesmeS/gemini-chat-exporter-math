/**
 * Background service worker for Gemini Chat Exporter
 * Handles extension lifecycle events
 */

console.log('Gemini Chat Exporter background service worker loaded');

/**
 * Handle installation
 */
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Gemini Chat Exporter installed');
    
    // Open welcome page
    chrome.tabs.create({
      url: 'https://gemini.google.com'
    });
  } else if (details.reason === 'update') {
    console.log('Gemini Chat Exporter updated');
  }
});

/**
 * Handle extension icon click (open popup)
 */
chrome.action.onClicked.addListener((tab) => {
  // This will open the popup automatically
  // No additional action needed as we have a default_popup in manifest
});
