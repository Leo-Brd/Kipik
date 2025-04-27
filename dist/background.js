"use strict";
chrome.runtime.onInstalled.addListener(() => {
    console.log("Kipik est installé et prêt à scanner !");
    // Récupérer la clé API depuis le .env
    const apiKey = 'AIzaSyDvFtq6uyMkcW5JC53yi_AxD13Bgi4TCw0';
    // Vérifier si la clé API existe déjà
    chrome.storage.local.get('apiKey', (result) => {
        console.log('Clé API actuelle:', result.apiKey);
        // Stocker la clé API si elle n'existe pas ou est différente
        if (!result.apiKey || result.apiKey !== apiKey) {
            chrome.storage.local.set({ apiKey }, () => {
                console.log('Nouvelle clé API stockée avec succès');
                // Vérifier que la clé a bien été stockée
                chrome.storage.local.get('apiKey', (check) => {
                    console.log('Vérification de la clé API stockée:', check.apiKey);
                });
            });
        }
        else {
            console.log('Clé API déjà présente');
        }
    });
});
// Écouter les messages du popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_API_KEY') {
        chrome.storage.local.get('apiKey', (result) => {
            sendResponse({ apiKey: result.apiKey });
        });
        return true;
    }
    if (message.type === 'ANALYZE_PAGESPEED') {
        const apiEndpoint = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
        const apiUrl = new URL(apiEndpoint);
        apiUrl.searchParams.set('url', message.url);
        apiUrl.searchParams.set('key', message.apiKey);
        apiUrl.searchParams.set('strategy', 'mobile');
        apiUrl.searchParams.append('category', 'performance');
        apiUrl.searchParams.append('category', 'accessibility');
        apiUrl.searchParams.append('category', 'seo');
        apiUrl.searchParams.append('category', 'best-practices');
        apiUrl.searchParams.set('fields', 'lighthouseResult.categories,lighthouseResult.audits');
        fetch(apiUrl)
            .then((response) => response.json())
            .then((data) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            if (!data.lighthouseResult || !data.lighthouseResult.categories) {
                throw new Error('Format de réponse invalide de l\'API PageSpeed');
            }
            const performance = Math.round((((_a = data.lighthouseResult.categories.performance) === null || _a === void 0 ? void 0 : _a.score) || 0) * 100);
            const accessibility = Math.round((((_b = data.lighthouseResult.categories.accessibility) === null || _b === void 0 ? void 0 : _b.score) || 0) * 100);
            const seo = Math.round((((_c = data.lighthouseResult.categories.seo) === null || _c === void 0 ? void 0 : _c.score) || 0) * 100);
            const bestPractices = Math.round((((_d = data.lighthouseResult.categories['best-practices']) === null || _d === void 0 ? void 0 : _d.score) || 0) * 100);
            const metrics = {
                firstContentfulPaint: ((_e = data.lighthouseResult.audits['first-contentful-paint']) === null || _e === void 0 ? void 0 : _e.displayValue) || 'N/A',
                largestContentfulPaint: ((_f = data.lighthouseResult.audits['largest-contentful-paint']) === null || _f === void 0 ? void 0 : _f.displayValue) || 'N/A',
                timeToInteractive: ((_g = data.lighthouseResult.audits['interactive']) === null || _g === void 0 ? void 0 : _g.displayValue) || 'N/A',
                totalBlockingTime: ((_h = data.lighthouseResult.audits['total-blocking-time']) === null || _h === void 0 ? void 0 : _h.displayValue) || 'N/A',
                cumulativeLayoutShift: ((_j = data.lighthouseResult.audits['cumulative-layout-shift']) === null || _j === void 0 ? void 0 : _j.displayValue) || 'N/A'
            };
            console.log('Métriques extraites:', metrics);
            sendResponse({
                performance,
                accessibility,
                seo,
                bestPractices,
                metrics
            });
        })
            .catch(error => {
            sendResponse({ error: error.message });
        });
        return true;
    }
});
