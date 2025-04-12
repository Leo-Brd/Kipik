console.log("[Kipik] content.js actif !");

let detectedStack = [];
let performanceData = {};
let stackDetected = false;
let performanceDetected = false;

// STACK DETECTOR INJECTION
console.log("[Kipik] Tentative d'injection du détecteur de stack...");
const script = document.createElement('script');
script.src = chrome.runtime.getURL('detectors/detect-stack.js');
script.onload = function() {
  console.log("[Kipik] Détecteur de stack injecté avec succès");
  this.remove();
};
script.onerror = function(error) {
  console.error("[Kipik] Erreur lors de l'injection du détecteur de stack:", error);
};
(document.head || document.documentElement).appendChild(script);

// PERF DETECTOR INJECTION
console.log("[Kipik] Tentative d'injection du détecteur de performance...");
const perfScript = document.createElement('script');
perfScript.src = chrome.runtime.getURL('detectors/detect-performance.js');
perfScript.onload = function() {
  console.log("[Kipik] Détecteur de performance injecté avec succès");
  this.remove();
};
perfScript.onerror = function(error) {
  console.error("[Kipik] Erreur lors de l'injection du détecteur de performance:", error);
};
(document.head || document.documentElement).appendChild(perfScript);

// DETECTORS LISTENING
console.log("[Kipik] Configuration des écouteurs d'événements...");
window.addEventListener('message', (event) => {
  if (event.source !== window) return;

  console.log("[Kipik] Message reçu:", event.data);

  if (event.data.type === 'STACK_DETECTED') {
    detectedStack = event.data.stack;
    stackDetected = true;
    console.log("[Kipik] Stack détectée:", detectedStack);
  }

  if (event.data.type === 'PERFORMANCE_DATA') {
    performanceData = event.data.data;
    performanceDetected = true;
    console.log("[Kipik] Données de performance récupérées:", performanceData);
  }
});

// WE SEND ALL THE INFOS TO THE POPUP
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[Kipik] Message reçu du popup:", message);
  
  if (message.type === "GET_PAGE_INFO") {
    console.log("[Kipik] État des détections - Stack:", stackDetected, "Performance:", performanceDetected);
    
    // Attendre que les deux détecteurs aient terminé
    const checkData = setInterval(() => {
      console.log("[Kipik] Vérification des données - Stack:", stackDetected, "Performance:", performanceDetected);
      
      if (stackDetected && performanceDetected) {
        console.log("[Kipik] Toutes les données sont disponibles, envoi de la réponse...");
        clearInterval(checkData);
        const pageInfo = {
          title: document.title,
          url: window.location.href,
          stack: detectedStack.length ? detectedStack : ["Aucune stack détectée"],
          performance: performanceData || { loadTime: 0, domContentLoaded: 0, resourceCount: 0, totalResourceSizeKB: 0 }
        };
        console.log("[Kipik] Données envoyées:", pageInfo);
        sendResponse(pageInfo);
      }
    }, 100);

    // Timeout après 5 secondes
    setTimeout(() => {
      console.log("[Kipik] Timeout atteint, état final - Stack:", stackDetected, "Performance:", performanceDetected);
      clearInterval(checkData);
      if (!stackDetected || !performanceDetected) {
        const fallbackResponse = {
          title: document.title,
          url: window.location.href,
          stack: ["Impossible de détecter la stack"],
          performance: { loadTime: 0, domContentLoaded: 0, resourceCount: 0, totalResourceSizeKB: 0 }
        };
        console.log("[Kipik] Envoi de la réponse de secours:", fallbackResponse);
        sendResponse(fallbackResponse);
      }
    }, 5000);

    return true; // Important pour garder le canal de communication ouvert
  }
});

