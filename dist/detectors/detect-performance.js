"use strict";
(function () {
    console.log("[Kipik] Détecteur de performance actif");
    function collectPerformanceData() {
        try {
            // Utilisation de l'API Performance Timeline
            const navigationEntries = performance.getEntriesByType('navigation');
            const navigationEntry = navigationEntries[0];
            const resources = performance.getEntriesByType('resource');
            let loadTime = 0;
            let domContentLoaded = 0;
            if (navigationEntry) {
                // Calcul des temps relatifs
                loadTime = navigationEntry.loadEventEnd - navigationEntry.startTime;
                domContentLoaded = navigationEntry.domContentLoadedEventEnd - navigationEntry.startTime;
            }
            // Calcul de la taille totale des ressources
            const totalResourceSize = resources.reduce((acc, res) => {
                return acc + (res.transferSize || res.encodedBodySize || 0);
            }, 0);
            const data = {
                loadTime: Math.max(0, Math.round(loadTime)),
                domContentLoaded: Math.max(0, Math.round(domContentLoaded)),
                resourceCount: resources.length,
                totalResourceSizeKB: Math.round(totalResourceSize / 1024)
            };
            console.log("[Kipik] Données de performance collectées:", data);
            return data;
        }
        catch (error) {
            console.error("[Kipik] Erreur lors de la collecte des données de performance:", error);
            return {
                loadTime: 0,
                domContentLoaded: 0,
                resourceCount: 0,
                totalResourceSizeKB: 0
            };
        }
    }
    // Création d'un observateur pour les entrées de performance
    const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const entry of entries) {
            if (entry.entryType === 'navigation') {
                const performanceData = collectPerformanceData();
                console.log("[Kipik] Envoi des données de performance au content script", performanceData);
                const message = { type: 'PERFORMANCE_DATA', data: performanceData };
                window.postMessage(message, '*');
            }
        }
    });
    // Configuration de l'observateur pour surveiller les entrées de navigation
    observer.observe({ entryTypes: ['navigation'] });
    // Collecte initiale
    const initialData = collectPerformanceData();
    if (initialData.loadTime > 0) {
        const messageInit = { type: 'PERFORMANCE_DATA', data: initialData };
        window.postMessage(messageInit, '*');
    }
})();
