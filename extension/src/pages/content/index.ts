(async () => {
  // Sends a message to the service worker for every page load
  await chrome.runtime.sendMessage({
    action: 'pageLoaded',
  });
})();
