(function() {
    console.log("[Kipik] Détecteur avancé injecté.");

    function detectMetaTags() {
        const metaTags = {
            description: document.querySelector('meta[name="description"]')?.content,
            keywords: document.querySelector('meta[name="keywords"]')?.content,
            viewport: document.querySelector('meta[name="viewport"]')?.content,
            robots: document.querySelector('meta[name="robots"]')?.content,
            og: {}
        };
        
        // Détection des tags Open Graph
        document.querySelectorAll('meta[property^="og:"]').forEach(tag => {
            const property = tag.getAttribute('property').replace('og:', '');
            metaTags.og[property] = tag.content;
        });
        
        return metaTags;
    }

    function detectStorage() {
        return {
            cookies: document.cookie.split(';').map(cookie => cookie.trim()),
            localStorage: Object.keys(localStorage),
            sessionStorage: Object.keys(sessionStorage)
        };
    }

    function detectLinks() {
        const links = {
            internal: [],
            external: [],
            broken: []
        };
        
        document.querySelectorAll('a[href]').forEach(link => {
            const href = link.href;
            if (href.startsWith(window.location.origin)) {
                links.internal.push(href);
            } else {
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
        window.postMessage({ type: 'ADVANCED_DATA', data: advancedData }, '*');
    } catch (error) {
        console.error("[Kipik] Erreur lors de la détection avancée:", error);
        window.postMessage({ 
            type: 'ADVANCED_DATA', 
            data: {
                metaTags: {},
                storage: { cookies: [], localStorage: [], sessionStorage: [] },
                links: { internal: [], external: [], broken: [] }
            }
        }, '*');
    }
})(); 