console.log("[Kipik] Détecteur de contenu actif");

(function() {
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
            const fontCounts = new Map();
            
            // Liste des polices système génériques à exclure
            const systemFonts = [
                'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy'
            ];
            
            // Mappage des polices système vers leurs noms d'affichage
            const systemFontNames = {
                '-apple-system': 'SF Pro',
                'system-ui': 'System UI',
                'blinkmacsystemfont': 'SF Pro',
                'segoe ui': 'Segoe UI',
                'roboto': 'Roboto',
                'helvetica neue': 'Helvetica Neue',
                'arial': 'Arial'
            };
            
            // Analyser les éléments visibles
            const elements = document.querySelectorAll('*');
            elements.forEach(element => {
                // Vérifier si l'élément est visible
                const style = window.getComputedStyle(element);
                if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
                    return;
                }

                // Vérifier si l'élément a du texte
                if (!element.textContent || element.textContent.trim() === '') {
                    return;
                }

                const fontFamily = style.fontFamily;
                if (fontFamily && fontFamily !== 'inherit') {
                    // Prendre la première police de la liste (celle qui est effectivement utilisée)
                    const font = fontFamily.split(',')[0].trim().replace(/['"]/g, '');
                    
                    // Nettoyer et normaliser le nom de la police
                    const cleanFont = font.toLowerCase();
                    
                    // Si c'est une police système connue, utiliser son nom d'affichage
                    const displayName = systemFontNames[cleanFont];
                    if (displayName) {
                        fontCounts.set(displayName, (fontCounts.get(displayName) || 0) + 1);
                    }
                    // Sinon, si ce n'est pas une police générique, l'ajouter
                    else if (!systemFonts.includes(cleanFont)) {
                        fontCounts.set(font, (fontCounts.get(font) || 0) + 1);
                    }
                }
            });

            // Trier les polices par fréquence d'utilisation
            const sortedFonts = Array.from(fontCounts.entries())
                .sort((a, b) => b[1] - a[1])
                .map(entry => entry[0]);

            // Ne garder que les 5 polices les plus utilisées
            const mainFonts = sortedFonts.slice(0, 5);
            
            console.log("[Kipik] Polices principales du site:", mainFonts);
            return mainFonts;
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

        console.log("[Kipik] Données de contenu collectées:", contentData);
        console.log("[Kipik] Envoi des données de contenu au content script");
        window.postMessage({ type: 'CONTENT_DATA', data: contentData }, '*');
    } catch (error) {
        console.error("[Kipik] Erreur générale du détecteur de contenu:", error);
        window.postMessage({ 
            type: 'CONTENT_DATA', 
            data: { language: "unknown", fonts: [] } 
        }, '*');
    }
})(); 