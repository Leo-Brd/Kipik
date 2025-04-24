"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
console.log("[Kipik] Détecteur de contenu actif");
(function () {
    function detectAvailableLanguages() {
        var _a;
        try {
            const normalize = (lang) => lang.toLowerCase().split('-')[0];
            // 1) Langue de la balise <html lang>
            const htmlLang = normalize(document.documentElement.lang);
            if (htmlLang) {
                return [htmlLang];
            }
            // 2) Fallback: recherche de quelques mots-clés dans le contenu
            const text = (((_a = document.body) === null || _a === void 0 ? void 0 : _a.innerText) + '').toLowerCase();
            const commonWordsOrig = {
                fr: [' le ', ' la ', ' les ', ' un ', ' une '],
                en: [' the ', ' a ', ' an ', ' is '],
                es: [' el ', ' la ', ' los ', ' las '],
                de: [' der ', ' die ', ' das ', ' ein ']
            };
            let detected = null;
            let maxMatches = 0;
            const commonWords = commonWordsOrig;
            for (const langCode in commonWords) {
                const words = commonWords[langCode];
                const count = words.reduce((acc, w) => acc + (text.includes(w) ? 1 : 0), 0);
                if (count > maxMatches) {
                    maxMatches = count;
                    detected = langCode;
                }
            }
            return detected ? [detected] : [];
        }
        catch (e) {
            console.error("[Kipik] Erreur dans detectAvailableLanguages:", e);
            return [];
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
        }
        catch (error) {
            console.error("[Kipik] Erreur lors de la détection des polices:", error);
            return [];
        }
    }
    // Envoi des données après détection asynchrone
    (() => __awaiter(this, void 0, void 0, function* () {
        try {
            const languages = yield detectAvailableLanguages();
            const fonts = detectFonts();
            const contentData = { language: languages, fonts: fonts };
            console.log("[Kipik] Données de contenu collectées:", contentData);
            const message = { type: 'CONTENT_DATA', data: contentData };
            window.postMessage(message, '*');
        }
        catch (error) {
            console.error("[Kipik] Erreur générale du détecteur de contenu:", error);
            const fallback = { type: 'CONTENT_DATA', data: { language: [], fonts: [] } };
            window.postMessage(fallback, '*');
        }
    }))();
})();
