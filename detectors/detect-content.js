(function() {
    console.log("[Kipik] Détecteur de contenu injecté.");

    function detectLanguage() {
        try {
            // 1. Vérifier l'attribut lang de l'élément html
            const htmlLang = document.documentElement.lang;
            console.log("[Kipik] Langue HTML détectée:", htmlLang);
            
            // 2. Analyser le contenu textuel pour détecter la langue
            const textContent = document.body ? document.body.innerText : '';
            const commonWords = {
                'fr': ['le', 'la', 'les', 'un', 'une', 'des', 'est', 'sont', 'dans', 'pour'],
                'en': ['the', 'a', 'an', 'is', 'are', 'in', 'on', 'at', 'to', 'for'],
                'es': ['el', 'la', 'los', 'las', 'un', 'una', 'es', 'son', 'en', 'por'],
                'de': ['der', 'die', 'das', 'ein', 'eine', 'ist', 'sind', 'in', 'für', 'zu']
            };

            let detectedLang = htmlLang || 'unknown';
            let maxMatches = 0;

            // Si pas de lang défini, analyser le contenu
            if (!htmlLang && textContent) {
                console.log("[Kipik] Analyse du contenu pour détecter la langue...");
                for (const [lang, words] of Object.entries(commonWords)) {
                    const matches = words.filter(word => 
                        textContent.toLowerCase().includes(word)
                    ).length;
                    
                    if (matches > maxMatches) {
                        maxMatches = matches;
                        detectedLang = lang;
                    }
                }
                console.log("[Kipik] Langue détectée par analyse:", detectedLang);
            }

            return detectedLang;
        } catch (error) {
            console.error("[Kipik] Erreur lors de la détection de la langue:", error);
            return "unknown";
        }
    }

    function detectFonts() {
        try {
            const fonts = new Set();
            
            // 1. Analyser les styles inline
            const elements = document.querySelectorAll('*');
            elements.forEach(element => {
                const style = window.getComputedStyle(element);
                const fontFamily = style.fontFamily;
                if (fontFamily && fontFamily !== 'inherit') {
                    // Nettoyer et séparer les polices
                    fontFamily.split(',').forEach(font => {
                        font = font.trim().replace(/['"]/g, '');
                        if (font && font !== 'serif' && font !== 'sans-serif' && font !== 'monospace') {
                            fonts.add(font);
                        }
                    });
                }
            });

            // 2. Analyser les @font-face
            const styleSheets = document.styleSheets;
            for (let i = 0; i < styleSheets.length; i++) {
                try {
                    const rules = styleSheets[i].cssRules;
                    for (let j = 0; j < rules.length; j++) {
                        if (rules[j].type === CSSRule.FONT_FACE_RULE) {
                            const fontFamily = rules[j].style.fontFamily;
                            if (fontFamily) {
                                fonts.add(fontFamily.replace(/['"]/g, ''));
                            }
                        }
                    }
                } catch (e) {
                    // Ignorer les erreurs de CORS
                    console.log("[Kipik] Impossible d'accéder à certaines feuilles de style:", e);
                }
            }

            const fontsArray = Array.from(fonts);
            console.log("[Kipik] Polices détectées:", fontsArray);
            return fontsArray;
        } catch (error) {
            console.error("[Kipik] Erreur lors de la détection des polices:", error);
            return [];
        }
    }

    try {
        const contentData = {
            language: detectLanguage(),
            fonts: detectFonts()
        };

        console.log("[Kipik] Données de contenu complètes:", contentData);
        window.postMessage({ type: 'CONTENT_DATA', data: contentData }, '*');
    } catch (error) {
        console.error("[Kipik] Erreur générale du détecteur de contenu:", error);
        window.postMessage({ 
            type: 'CONTENT_DATA', 
            data: { language: "unknown", fonts: [] } 
        }, '*');
    }
})(); 