(async () => {
  // Sends a message to the service worker for every page load
  await chrome.runtime.sendMessage({
    action: 'pageLoaded',
  });
})();

// Helper function to inject static external script
function injectStaticScript(filename: string, callback: () => void) {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL(filename);
  script.onload = callback;
  document.head.appendChild(script);
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.action == 'injectScript') {
    // const script = document.createElement('script');
    // script.textContent = message.func;
    // document.head.appendChild(script);
    // return true;
    injectStaticScript('src/lib/bootstrap.js', function () {
      const dynamicCode = `window.dynamicScriptExecutor(\`${message.func}\`);`;
      const blob = new Blob([dynamicCode], { type: 'text/javascript' });
      const scriptURL = URL.createObjectURL(blob);

      const script = document.createElement('script');
      script.src = scriptURL;
      document.head.appendChild(script);

      // Cleanup after script loads
      script.onload = function () {
        URL.revokeObjectURL(scriptURL);
      };
    });
    return true;
  }
});
