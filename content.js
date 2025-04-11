console.log("[Kipik] content.js actif !");

let detectedStack = [];
let performanceData = {};

// STACK DETECTOR INJECTION
const script = document.createElement('script');
script.src = chrome.runtime.getURL('detectors/detect-stack.js');
script.onload = function() {
  this.remove();
};
(document.head || document.documentElement).appendChild(script);

// PERF DETECTOR INJECTION
const perfScript = document.createElement('script');
perfScript.src = chrome.runtime.getURL('detectors/detect-performance.js');
perfScript.onload = function() {
  this.remove();
};
(document.head || document.documentElement).appendChild(perfScript);


// DETECTORS LISTENING
window.addEventListener('message', (event) => {
  if (event.source !== window) return;

  if (event.data.type === 'STACK_DETECTED') {
    detectedStack = event.data.stack;
    console.log("[Kipik] Stack détectée:", detectedStack);
  }

  if (event.data.type === 'PERFORMANCE_DATA') {
    performanceData = event.data.data;
    console.log("[Kipik] Données de performance récupérées:", performanceData);
  }
});

// WE SEND ALL THE INFOS TO THE POPUP
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_PAGE_INFO") {
    const pageInfo = {
      title: document.title,
      url: window.location.href,
      stack: detectedStack.length ? detectedStack : ["Aucune stack détectée"],
      performance: performanceData || { loadTime: 0, domContentLoaded: 0, resourceCount: 0, totalResourceSizeKB: 0 }
    };
    sendResponse(pageInfo);
  }
});

