// Initialisation de la clé API au démarrage de l'extension
chrome.runtime.onInstalled.addListener(() => {
    console.log("Kipik est installé et prêt à scanner !");

    // Récupérer la clé API depuis le .env
    const apiKey = 'AIzaSyBsrXKab-upHyrmw1f9bP7P2VtLS_j47CI';

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
        return true; // Indique que la réponse sera envoyée de manière asynchrone
    }
});
  