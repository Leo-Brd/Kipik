console.log("[Kipik] content.js actif !");

// Types pour les données et messages
interface PerformanceInfo { loadTime: number; domContentLoaded: number; resourceCount: number; totalResourceSizeKB: number; }
interface ContentInfo { language: string; fonts: string[]; }
interface MetaTags { description: string; keywords: string; robots: string; og: string; twitter: string }
interface StorageInfo { cookies: unknown[]; localStorage: unknown[]; sessionStorage: unknown[]; }
interface LinksInfo { internal: string[]; external: string[]; broken: string[]; }
interface AdvancedInfo { metaTags: MetaTags; storage: StorageInfo; links: LinksInfo; }
interface PageInfo { title: string; url: string; stack: string[]; performance: PerformanceInfo; content: ContentInfo; advanced: AdvancedInfo; }
type DetectorMessage =
  | { type: 'STACK_DETECTED'; stack: string[] }
  | { type: 'PERFORMANCE_DATA'; data: PerformanceInfo }
  | { type: 'CONTENT_DATA'; data: ContentInfo }
  | { type: 'ADVANCED_DATA'; data: AdvancedInfo };
type PopupMessage = { type: 'GET_PAGE_INFO' };

let detectedStack: string[] = [];
let performanceData: PerformanceInfo = { loadTime: 0, domContentLoaded: 0, resourceCount: 0, totalResourceSizeKB: 0 };
let contentData: ContentInfo = {
    language: "unknown",
    fonts: []
};
let advancedData: AdvancedInfo = {
    metaTags: {
        description: "",
        keywords: "",
        robots: "",
        og: "",
        twitter: ""
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
script.src = chrome.runtime.getURL('dist/detectors/detect-stack.js');
(script.onload = (): void => {
    script.remove();
});
(document.head || document.documentElement).appendChild(script);

// PERF DETECTOR INJECTION
const perfScript = document.createElement('script');
perfScript.src = chrome.runtime.getURL('dist/detectors/detect-performance.js');
(perfScript.onload = (): void => {
    perfScript.remove();
});
(document.head || document.documentElement).appendChild(perfScript);

// CONTENT DETECTOR INJECTION
const contentScript = document.createElement('script');
contentScript.src = chrome.runtime.getURL('dist/detectors/detect-content.js');
(contentScript.onload = (): void => {
    contentScript.remove();
});
(document.head || document.documentElement).appendChild(contentScript);

// ADVANCED DETECTOR INJECTION
const advancedScript = document.createElement('script');
advancedScript.src = chrome.runtime.getURL('dist/detectors/detect-advanced.js');
(advancedScript.onload = (): void => {
    advancedScript.remove();
});
(document.head || document.documentElement).appendChild(advancedScript);

// DETECTORS LISTENING
window.addEventListener('message', (event: MessageEvent<DetectorMessage>): void => {
    if (event.source !== window) return;

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
                fonts: Array.isArray(event.data.data.fonts) ? event.data.data.fonts : []
            };
        }
        contentDetected = true;
    }

    if (event.data.type === 'ADVANCED_DATA') {
        if (event.data.data && typeof event.data.data === 'object') {
            advancedData = {
                metaTags: {
                    description: event.data.data.metaTags?.description || "",
                    keywords: event.data.data.metaTags?.keywords || "",
                    robots: event.data.data.metaTags?.robots || "",
                    og: event.data.data.metaTags?.og || "",
                    twitter: event.data.data.metaTags?.twitter || "",
                },
                storage: event.data.data.storage || { cookies: [], localStorage: [], sessionStorage: [] },
                links: event.data.data.links || { internal: [], external: [], broken: [] }
            };
        }
        advancedDetected = true;
    }
});

// Gestionnaire de messages du popup
chrome.runtime.onMessage.addListener((message: PopupMessage, sender: chrome.runtime.MessageSender, sendResponse: (response: PageInfo) => void): boolean => {
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

