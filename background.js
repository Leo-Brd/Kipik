// Initialisation de la clé API au démarrage de l'extension
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
        } else {
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
        apiUrl.searchParams.set('category', 'performance');
        apiUrl.searchParams.set('category', 'accessibility');
        apiUrl.searchParams.set('category', 'seo');
        apiUrl.searchParams.set('category', 'best-practices');
        apiUrl.searchParams.set('fields', 'lighthouseResult.categories');

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (!data.lighthouseResult?.categories) {
                    throw new Error('Format de réponse invalide de l\'API PageSpeed');
                }

                const scores = {
                    performance: Math.round((data.lighthouseResult.categories.performance?.score || 0) * 100),
                    accessibility: Math.round((data.lighthouseResult.categories.accessibility?.score || 0) * 100),
                    seo: Math.round((data.lighthouseResult.categories.seo?.score || 0) * 100),
                    bestPractices: Math.round((data.lighthouseResult.categories['best-practices']?.score || 0) * 100)
                };

                sendResponse(scores);
            })
            .catch(error => {
                sendResponse({ error: error.message });
            });

        return true;
    }
});