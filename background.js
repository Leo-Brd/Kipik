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
        apiUrl.searchParams.append('category', 'performance');
        apiUrl.searchParams.append('category', 'accessibility');
        apiUrl.searchParams.append('category', 'seo');
        apiUrl.searchParams.append('category', 'best-practices');
        apiUrl.searchParams.set('fields', 'lighthouseResult.categories');

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                console.log('Données brutes reçues de PageSpeed :', JSON.stringify(data, null, 2));
                if (!data.lighthouseResult || !data.lighthouseResult.categories) {
                    throw new Error('Format de réponse invalide de l\'API PageSpeed');
                }

                const performance = Math.round((data.lighthouseResult.categories.performance?.score || 0) * 100);
                const accessibility = Math.round((data.lighthouseResult.categories.accessibility?.score || 0) * 100);
                const seo = Math.round((data.lighthouseResult.categories.seo?.score || 0) * 100);
                const bestPractices = Math.round((data.lighthouseResult.categories['best-practices']?.score || 0) * 100);

                sendResponse({
                    performance,
                    accessibility,
                    seo,
                    bestPractices
                });
            })
            .catch(error => {
                sendResponse({ error: error.message });
            });

        return true;
    }

    if (message.type === 'GET_VIDEOS') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_VIDEOS' }, (response) => {
                    if (chrome.runtime.lastError) {
                        sendResponse({ error: chrome.runtime.lastError.message });
                    } else {
                        sendResponse(response);
                    }
                });
            } else {
                sendResponse({ error: 'Aucun onglet actif trouvé' });
            }
        });
        return true;
    }
});