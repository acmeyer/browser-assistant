(async () => {
  // Sends a message to the service worker for every page load
  await chrome.runtime.sendMessage({
    action: 'pageLoaded',
  });
})();

chrome.runtime.onMessage.addListener((message) => {
  if (message.action == 'injectScript') {
    const script = document.createElement('script');
    script.textContent = message.func;
    console.log('injecting script from content script', script);
    document.head.appendChild(script);
    return true;
  }
});
