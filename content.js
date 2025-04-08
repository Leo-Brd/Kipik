console.log("[Kipik] content.js actif !");

let detectedStack = [];

// Étape 1 : Injection du script détecteur dans la page
const script = document.createElement('script');
script.src = chrome.runtime.getURL('detect-stack.js');
script.onload = function() {
  this.remove(); // Nettoyage propre après exécution
};
(document.head || document.documentElement).appendChild(script);

// Étape 2 : Ecoute des messages venant de detect-stack.js
window.addEventListener('message', (event) => {
  if (event.source !== window) return; // On ignore les events externes
  if (event.data.type && event.data.type === 'STACK_DETECTED') {
    detectedStack = event.data.stack;
    console.log("[Kipik] Stack détectée:", detectedStack);
  }
});

// Étape 3 : Réponse aux messages venant de la popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_PAGE_INFO") {
    const pageInfo = {
      title: document.title,
      url: window.location.href,
      stack: detectedStack.length ? detectedStack : ["Aucune stack détectée"]
    };
    sendResponse(pageInfo);
  }
});
