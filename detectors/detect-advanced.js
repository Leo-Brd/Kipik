(function() {
    console.log("[Kipik] Détecteur avancé injecté.");

    function detectMedia() {
        const videos = [];
        const images = [];

        // Détection des images (y compris lazy loading)
        document.querySelectorAll('img').forEach(img => {
            try {
                // Vérifie les différentes sources possibles pour le lazy loading
                const src = img.src || 
                           img.dataset.src || 
                           img.getAttribute('data-src') ||
                           img.getAttribute('data-lazy-src') ||
                           img.getAttribute('data-original');
                
                if (src) {
                    images.push(src);
                }
            } catch (error) {
                console.error("[Kipik] Erreur lors de la détection d'une image:", error);
            }
        });

        // Détection des vidéos (y compris lazy loading)
        document.querySelectorAll('video').forEach(video => {
            try {
                // Vérifie la source principale
                if (video.src) {
                    videos.push(video.src);
                }
                
                // Vérifie les sources dans les balises source (pour le lazy loading)
                video.querySelectorAll('source').forEach(source => {
                    if (source.src) {
                        videos.push(source.src);
                    }
                });
            } catch (error) {
                console.error("[Kipik] Erreur lors de la détection d'une vidéo:", error);
            }
        });

        // Détection dans les shadow DOMs
        function detectInShadowDOM(root) {
            try {
                // Images
                root.querySelectorAll('img').forEach(img => {
                    try {
                        const src = img.src || 
                                   img.dataset.src || 
                                   img.getAttribute('data-src') ||
                                   img.getAttribute('data-lazy-src') ||
                                   img.getAttribute('data-original');
                        
                        if (src) {
                            images.push(src);
                        }
                    } catch (error) {
                        console.error("[Kipik] Erreur lors de la détection d'une image dans le shadow DOM:", error);
                    }
                });

                // Vidéos
                root.querySelectorAll('video').forEach(video => {
                    try {
                        if (video.src) {
                            videos.push(video.src);
                        }
                        
                        video.querySelectorAll('source').forEach(source => {
                            if (source.src) {
                                videos.push(source.src);
                            }
                        });
                    } catch (error) {
                        console.error("[Kipik] Erreur lors de la détection d'une vidéo dans le shadow DOM:", error);
                    }
                });
                
                root.querySelectorAll('*').forEach(element => {
                    if (element.shadowRoot) {
                        detectInShadowDOM(element.shadowRoot);
                    }
                });
            } catch (error) {
                console.error("[Kipik] Erreur lors de la détection dans le shadow DOM:", error);
            }
        }

        detectInShadowDOM(document);

        console.log("[Kipik] Médias détectés:", { videos, images });
        return {
            videos,
            images
        };
    }

    function detectMetaTags() {
        const metaTags = {
            description: document.querySelector('meta[name="description"]')?.content,
            keywords: document.querySelector('meta[name="keywords"]')?.content,
            viewport: document.querySelector('meta[name="viewport"]')?.content,
            robots: document.querySelector('meta[name="robots"]')?.content,
            ogTags: {}
        };
        
        // Détection des tags Open Graph
        document.querySelectorAll('meta[property^="og:"]').forEach(tag => {
            const property = tag.getAttribute('property').replace('og:', '');
            metaTags.ogTags[property] = tag.content;
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

    function detectResources() {
        const resources = {
            scripts: [],
            styles: [],
            externalScripts: [],
            externalStyles: []
        };
        
        // Détection des scripts
        document.querySelectorAll('script[src]').forEach(script => {
            resources.scripts.push(script.src);
            if (!script.src.startsWith(window.location.origin)) {
                resources.externalScripts.push(script.src);
            }
        });
        
        // Détection des styles
        document.querySelectorAll('link[rel="stylesheet"]').forEach(style => {
            resources.styles.push(style.href);
            if (!style.href.startsWith(window.location.origin)) {
                resources.externalStyles.push(style.href);
            }
        });
        
        return resources;
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
            media: detectMedia(),
            metaTags: detectMetaTags(),
            storage: detectStorage(),
            resources: detectResources(),
            links: detectLinks()
        };

        console.log("[Kipik] Données avancées détectées:", advancedData);
        window.postMessage({ type: 'ADVANCED_DATA', data: advancedData }, '*');
    } catch (error) {
        console.error("[Kipik] Erreur lors de la détection avancée:", error);
        window.postMessage({ 
            type: 'ADVANCED_DATA', 
            data: {
                media: { videos: [], images: [] },
                metaTags: {},
                storage: { cookies: [], localStorage: [], sessionStorage: [] },
                resources: { scripts: [], styles: [], externalScripts: [], externalStyles: [] },
                links: { internal: [], external: [], broken: [] }
            }
        }, '*');
    }
})(); 