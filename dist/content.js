"use strict";
console.log("[Kipik] content.js actif !");
let detectedStack = [];
let performanceData = { loadTime: 0, domContentLoaded: 0, resourceCount: 0, totalResourceSizeKB: 0 };
let contentData = {
    language: "unknown",
    fonts: [],
    images: [],
    videos: []
};
let advancedData = {
    metaTags: {
        description: "",
        keywords: "",
        viewport: "",
        robots: "",
        og: {}
    },
    storage: { cookies: [], localStorage: [], sessionStorage: [] },
    links: { internal: [], external: [], broken: [] }
};
let stackDetected = false;
let performanceDetected = false;
let contentDetected = true;
let advancedDetected = true;
// STACK DETECTOR INJECTION
const script = document.createElement('script');
script.src = chrome.runtime.getURL('detectors/detect-stack.js');
(script.onload = () => {
    script.remove();
});
(document.head || document.documentElement).appendChild(script);
// PERF DETECTOR INJECTION
const perfScript = document.createElement('script');
perfScript.src = chrome.runtime.getURL('detectors/detect-performance.js');
(perfScript.onload = () => {
    perfScript.remove();
});
(document.head || document.documentElement).appendChild(perfScript);
// CONTENT DETECTOR INJECTION
const contentScript = document.createElement('script');
contentScript.src = chrome.runtime.getURL('detectors/detect-content.js');
(contentScript.onload = () => {
    contentScript.remove();
});
(document.head || document.documentElement).appendChild(contentScript);
// ADVANCED DETECTOR INJECTION
const advancedScript = document.createElement('script');
advancedScript.src = chrome.runtime.getURL('detectors/detect-advanced.js');
(advancedScript.onload = () => {
    advancedScript.remove();
});
(document.head || document.documentElement).appendChild(advancedScript);
// DETECTORS LISTENING
window.addEventListener('message', (event) => {
    var _a, _b, _c, _d, _e;
    if (event.source !== window)
        return;
    if (event.data.type === 'STACK_DETECTED') {
        detectedStack = event.data.stack;
        stackDetected = true;
    }
    if (event.data.type === 'PERFORMANCE_DATA') {
        performanceData = event.data.data;
        performanceDetected = true;
    }
    if (event.data.type === 'CONTENT_DATA') {
        if (event.data.data && typeof event.data.data === 'object') {
            contentData = {
                language: event.data.data.language || "unknown",
                fonts: Array.isArray(event.data.data.fonts) ? event.data.data.fonts : [],
                images: Array.isArray(event.data.data.images) ? event.data.data.images : [],
                videos: Array.isArray(event.data.data.videos) ? event.data.data.videos : []
            };
        }
        contentDetected = true;
    }
    if (event.data.type === 'ADVANCED_DATA') {
        if (event.data.data && typeof event.data.data === 'object') {
            advancedData = {
                metaTags: {
                    description: ((_a = event.data.data.metaTags) === null || _a === void 0 ? void 0 : _a.description) || "",
                    keywords: ((_b = event.data.data.metaTags) === null || _b === void 0 ? void 0 : _b.keywords) || "",
                    viewport: ((_c = event.data.data.metaTags) === null || _c === void 0 ? void 0 : _c.viewport) || "",
                    robots: ((_d = event.data.data.metaTags) === null || _d === void 0 ? void 0 : _d.robots) || "",
                    og: ((_e = event.data.data.metaTags) === null || _e === void 0 ? void 0 : _e.og) || {}
                },
                storage: event.data.data.storage || { cookies: [], localStorage: [], sessionStorage: [] },
                links: event.data.data.links || { internal: [], external: [], broken: [] }
            };
        }
        advancedDetected = true;
    }
});
// Gestionnaire de messages du popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GET_PAGE_INFO") {
        // Attendre que les détecteurs essentiels aient terminé
        const checkData = setInterval(() => {
            if (stackDetected && performanceDetected) {
                clearInterval(checkData);
                const pageInfo = {
                    title: document.title,
                    url: window.location.href,
                    stack: detectedStack.length ? detectedStack : ["Aucune stack détectée"],
                    performance: performanceData || { loadTime: 0, domContentLoaded: 0, resourceCount: 0, totalResourceSizeKB: 0 },
                    content: contentData,
                    advanced: advancedData
                };
                sendResponse(pageInfo);
            }
        }, 100);
        // Timeout après 5 secondes
        setTimeout(() => {
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
                sendResponse(fallbackResponse);
            }
        }, 5000);
        return true;
    }
    return false;
});
