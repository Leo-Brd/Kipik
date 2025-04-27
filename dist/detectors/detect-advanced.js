"use strict";
(function () {
    console.log("[Kipik] Détecteur avancé injecté.");
    function detectMetaTags() {
        var _a, _b, _c, _d;
        const metaTags = {
            description: ((_a = document.querySelector('meta[name="description"]')) === null || _a === void 0 ? void 0 : _a.content) || '',
            keywords: ((_b = document.querySelector('meta[name="keywords"]')) === null || _b === void 0 ? void 0 : _b.content) || '',
            viewport: ((_c = document.querySelector('meta[name="viewport"]')) === null || _c === void 0 ? void 0 : _c.content) || '',
            robots: ((_d = document.querySelector('meta[name="robots"]')) === null || _d === void 0 ? void 0 : _d.content) || '',
            og: "Non détecté",
            twitter: "Non détecté",
        };
        // Détection des balises OpenGraph
        const ogTags = document.querySelectorAll('meta[property^="og:"]');
        if (ogTags.length > 0) {
            metaTags.og = "Détecté";
        }
        // Détection des balises Twitter Cards
        const twitterTagsName = document.querySelectorAll('meta[name^="twitter:"]');
        if (twitterTagsName.length > 0) {
            metaTags.twitter = "Détecté";
        }
        return metaTags;
    }
    function detectStorage() {
        return {
            cookies: document.cookie.split(';').map((cookie) => cookie.trim()),
            localStorage: Object.keys(localStorage),
            sessionStorage: Object.keys(sessionStorage)
        };
    }
    function detectLinks() {
        const links = { internal: [], external: [], broken: [] };
        const anchorElements = document.querySelectorAll('a[href]');
        anchorElements.forEach((link) => {
            const href = link.href;
            if (href.startsWith(window.location.origin)) {
                links.internal.push(href);
            }
            else {
                links.external.push(href);
            }
        });
        return links;
    }
    try {
        const advancedData = {
            metaTags: detectMetaTags(),
            storage: detectStorage(),
            links: detectLinks()
        };
        console.log("[Kipik] Données avancées détectées:", advancedData);
        const message = { type: 'ADVANCED_DATA', data: advancedData };
        window.postMessage(message, '*');
    }
    catch (error) {
        console.error("[Kipik] Erreur lors de la détection avancée:", error);
        const fallback = {
            type: 'ADVANCED_DATA',
            data: {
                metaTags: { description: '', keywords: '', viewport: '', robots: '', og: '', twitter: '' },
                storage: { cookies: [], localStorage: [], sessionStorage: [] },
                links: { internal: [], external: [], broken: [] }
            }
        };
        window.postMessage(fallback, '*');
    }
})();
