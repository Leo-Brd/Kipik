// Types pour la communication
interface ContentData { language: string[]; fonts: string[]; }
interface ContentMessage { type: 'CONTENT_DATA'; data: ContentData; }
console.log("[Kipik] Détecteur de contenu actif");

(function() {
    function detectAvailableLanguages(): string[] {
        try {
            const normalize = (lang: string): string => lang.toLowerCase().split('-')[0];
            // 1) Langue de la balise <html lang>
            const htmlLang = normalize(document.documentElement.lang);
            if (htmlLang) {
                return [htmlLang];
            }
            // 2) Fallback: recherche de quelques mots-clés dans le contenu
            const text = (document.body?.innerText + '').toLowerCase();
            const commonWordsOrig: Record<string, string[]> = {
                fr: [' le ', ' la ', ' les ', ' un ', ' une '],
                en: [' the ', ' a ', ' an ', ' is '],
                es: [' el ', ' la ', ' los ', ' las '],
                de: [' der ', ' die ', ' das ', ' ein ']
            };
            let detected: string | null = null;
            let maxMatches = 0;
            const commonWords: Record<string, string[]> = commonWordsOrig;
            for (const langCode in commonWords) {
                const words: string[] = commonWords[langCode];
                const count: number = words.reduce((acc: number, w: string) => acc + (text.includes(w) ? 1 : 0), 0);
                if (count > maxMatches) {
                    maxMatches = count;
                    detected = langCode;
                }
            }
            return detected ? [detected] : [];
        } catch (e) {
            console.error("[Kipik] Erreur dans detectAvailableLanguages:", e);
            return [];
        }
    }
    
    
    

    function detectFonts(): string[] {
        try {
            const fontCounts: Map<string, number> = new Map<string, number>();
            
            // Liste des polices système génériques à exclure
            const systemFonts: string[] = [
                'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy'
            ];
            
            // Mappage des polices système vers leurs noms d'affichage
            const systemFontNames: Record<string, string> = {
                '-apple-system': 'SF Pro',
                'system-ui': 'System UI',
                'blinkmacsystemfont': 'SF Pro',
                'segoe ui': 'Segoe UI',
                'roboto': 'Roboto',
                'helvetica neue': 'Helvetica Neue',
                'arial': 'Arial'
            };
            
            // Analyser les éléments visibles
            const elements: NodeListOf<HTMLElement> = document.querySelectorAll('*');
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
                    const cleanFont: string = font.toLowerCase();
                    
                    // Si c'est une police système connue, utiliser son nom d'affichage
                    const displayName: string | undefined = systemFontNames[cleanFont];
                    if (displayName) {
                        fontCounts.set(displayName, (fontCounts.get(displayName) || 0) + 1);
                    }
                    // Sinon, si ce n'est pas une police générique, l'ajouter
                    else if (systemFonts.indexOf(cleanFont) === -1) {
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

    // Envoi des données après détection asynchrone
    (async () => {
        try {
            const languages = await detectAvailableLanguages();
            const fonts = detectFonts();
            const contentData: ContentData = { language: languages, fonts: fonts };
            console.log("[Kipik] Données de contenu collectées:", contentData);
            const message: ContentMessage = { type: 'CONTENT_DATA', data: contentData };
            window.postMessage(message, '*');
        } catch (error) {
            console.error("[Kipik] Erreur générale du détecteur de contenu:", error);
            const fallback: ContentMessage = { type: 'CONTENT_DATA', data: { language: [], fonts: [] } };
            window.postMessage(fallback, '*');
        }
    })();
})(); 