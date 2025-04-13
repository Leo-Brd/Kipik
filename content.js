console.log("[Kipik] content.js actif !");

let detectedStack = [];
let performanceData = {};
let contentData = {
    language: "unknown",
    fonts: []
};
let advancedData = {
    media: { images: [], videos: [], audios: [] },
    metaTags: {},
    storage: { cookies: [], localStorage: [], sessionStorage: [] },
    resources: { scripts: [], styles: [], externalScripts: [], externalStyles: [] },
    forms: [],
    links: { internal: [], external: [], broken: [] }
};
let stackDetected = false;
let performanceDetected = false;
let contentDetected = true;
let advancedDetected = true;

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

// CONTENT DETECTOR INJECTION
console.log("[Kipik] Tentative d'injection du détecteur de contenu...");
const contentScript = document.createElement('script');
contentScript.src = chrome.runtime.getURL('detectors/detect-content.js');
contentScript.onload = function() {
  console.log("[Kipik] Détecteur de contenu injecté avec succès");
  this.remove();
};
contentScript.onerror = function(error) {
  console.error("[Kipik] Erreur lors de l'injection du détecteur de contenu:", error);
  contentData = {
    language: "unknown",
    fonts: []
  };
  contentDetected = true;
};
(document.head || document.documentElement).appendChild(contentScript);

// ADVANCED DETECTOR INJECTION
console.log("[Kipik] Tentative d'injection du détecteur avancé...");
const advancedScript = document.createElement('script');
advancedScript.src = chrome.runtime.getURL('detectors/detect-advanced.js');
advancedScript.onload = function() {
  console.log("[Kipik] Détecteur avancé injecté avec succès");
  this.remove();
};
advancedScript.onerror = function(error) {
  console.error("[Kipik] Erreur lors de l'injection du détecteur avancé:", error);
  advancedData = {
    media: { images: [], videos: [], audios: [] },
    metaTags: {},
    storage: { cookies: [], localStorage: [], sessionStorage: [] },
    resources: { scripts: [], styles: [], externalScripts: [], externalStyles: [] },
    forms: [],
    links: { internal: [], external: [], broken: [] }
  };
  advancedDetected = true;
};
(document.head || document.documentElement).appendChild(advancedScript);

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

  if (event.data.type === 'CONTENT_DATA') {
    if (event.data.data && typeof event.data.data === 'object') {
      contentData = {
        language: event.data.data.language || "unknown",
        fonts: Array.isArray(event.data.data.fonts) ? event.data.data.fonts : []
      };
    }
    contentDetected = true;
    console.log("[Kipik] Données de contenu récupérées:", contentData);
  }

  if (event.data.type === 'ADVANCED_DATA') {
    if (event.data.data && typeof event.data.data === 'object') {
      advancedData = event.data.data;
    }
    advancedDetected = true;
    console.log("[Kipik] Données avancées récupérées:", advancedData);
  }
});

// WE SEND ALL THE INFOS TO THE POPUP
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[Kipik] Message reçu du popup:", message);
  
  if (message.type === "GET_PAGE_INFO") {
    console.log("[Kipik] État des détections - Stack:", stackDetected, "Performance:", performanceDetected, "Content:", contentDetected, "Advanced:", advancedDetected);
    
    // Attendre que les détecteurs essentiels aient terminé
    const checkData = setInterval(() => {
      console.log("[Kipik] Vérification des données - Stack:", stackDetected, "Performance:", performanceDetected);
      
      if (stackDetected && performanceDetected) {
        console.log("[Kipik] Données essentielles disponibles, envoi de la réponse...");
        clearInterval(checkData);
        const pageInfo = {
          title: document.title,
          url: window.location.href,
          stack: detectedStack.length ? detectedStack : ["Aucune stack détectée"],
          performance: performanceData || { loadTime: 0, domContentLoaded: 0, resourceCount: 0, totalResourceSizeKB: 0 },
          content: contentData,
          advanced: advancedData
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
          performance: { loadTime: 0, domContentLoaded: 0, resourceCount: 0, totalResourceSizeKB: 0 },
          content: contentData,
          advanced: advancedData
        };
        console.log("[Kipik] Envoi de la réponse de secours:", fallbackResponse);
        sendResponse(fallbackResponse);
      }
    }, 5000);

    return true;
  }
});

