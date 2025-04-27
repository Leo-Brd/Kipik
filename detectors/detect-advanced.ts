// Types pour la communication
interface DetectorMetaTags { description: string; keywords: string; viewport: string; robots: string; og: string; twitter: string; }
interface DetectorStorageInfo { cookies: string[]; localStorage: string[]; sessionStorage: string[]; }
interface DetectorLinksInfo { internal: string[]; external: string[]; broken: string[]; }
interface DetectorAdvancedData { metaTags: DetectorMetaTags; storage: DetectorStorageInfo; links: DetectorLinksInfo; }
interface DetectorAdvancedMessage { type: 'ADVANCED_DATA'; data: DetectorAdvancedData; }

(function() {
    console.log("[Kipik] Détecteur avancé injecté.");

    function detectMetaTags(): DetectorMetaTags {
        const metaTags: DetectorMetaTags = {
            description: document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content || '',
            keywords: document.querySelector<HTMLMetaElement>('meta[name="keywords"]')?.content || '',
            viewport: document.querySelector<HTMLMetaElement>('meta[name="viewport"]')?.content || '',
            robots: document.querySelector<HTMLMetaElement>('meta[name="robots"]')?.content || '',
            og: "Non détecté",
            twitter: "Non détecté",
        };
        
        // Détection des balises OpenGraph
        const ogTags = document.querySelectorAll<HTMLMetaElement>('meta[property^="og:"]');
        if (ogTags.length > 0) {
            metaTags.og = "Détecté";
        }

        // Détection des balises Twitter Cards
        const twitterTagsName = document.querySelectorAll<HTMLMetaElement>('meta[name^="twitter:"]');
        if (twitterTagsName.length > 0 ) {
            metaTags.twitter = "Détecté";
        }
        
        return metaTags;
    }

    function detectStorage(): DetectorStorageInfo {
        return {
            cookies: document.cookie.split(';').map((cookie: string) => cookie.trim()),
            localStorage: Object.keys(localStorage),
            sessionStorage: Object.keys(sessionStorage)
        };
    }

    function detectLinks(): DetectorLinksInfo {
        const links: DetectorLinksInfo = { internal: [], external: [], broken: [] };
        const anchorElements = document.querySelectorAll<HTMLAnchorElement>('a[href]');
        anchorElements.forEach((link: HTMLAnchorElement) => {
            const href: string = link.href;
            if (href.startsWith(window.location.origin)) {
                links.internal.push(href);
            } else {
                links.external.push(href);
            }
        });
        return links;
    }

    try {
        const advancedData: DetectorAdvancedData = {
            metaTags: detectMetaTags(),
            storage: detectStorage(),
            links: detectLinks()
        };

        console.log("[Kipik] Données avancées détectées:", advancedData);
        const message: DetectorAdvancedMessage = { type: 'ADVANCED_DATA', data: advancedData };
        window.postMessage(message, '*');
    } catch (error) {
        console.error("[Kipik] Erreur lors de la détection avancée:", error);
        const fallback: DetectorAdvancedMessage = {
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