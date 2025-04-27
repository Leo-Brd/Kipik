// Initialisation de la clé API au démarrage de l'extension
// Types pour les messages et les réponses
interface GetApiKeyMessage {
    type: 'GET_API_KEY';
}
interface AnalyzePagespeedMessage {
    type: 'ANALYZE_PAGESPEED';
    url: string;
    apiKey: string;
}
type Message = GetApiKeyMessage | AnalyzePagespeedMessage;

interface GetApiKeyResponse {
    apiKey: string;
}
interface PageSpeedScores {
    performance: number;
    accessibility: number;
    seo: number;
    bestPractices: number;
    metrics: {
        firstContentfulPaint: string;
        largestContentfulPaint: string;
        timeToInteractive: string;
        totalBlockingTime: string;
        cumulativeLayoutShift: string;
    };
}

interface Audit {
    id: string;
    title: string;
    description: string;
    score: number | null;
    displayValue?: string;
}

interface PageSpeedApiResponse {
    lighthouseResult: {
        categories: {
            performance?: { score: number };
            accessibility?: { score: number };
            seo?: { score: number };
            'best-practices'?: { score: number };
        };
        audits: {
            [key: string]: Audit;
        };
        runWarnings: string[];
        configSettings: {
            formFactor: string;
            locale: string;
        };
    };
}

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
chrome.runtime.onMessage.addListener((message: Message, sender: chrome.runtime.MessageSender, sendResponse: (response: GetApiKeyResponse | PageSpeedScores | { error: string }) => void) => {
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
            .then((data: PageSpeedApiResponse) => {
                if (!data.lighthouseResult || !data.lighthouseResult.categories) {
                    throw new Error('Format de réponse invalide de l\'API PageSpeed');
                }

                const performance = Math.round((data.lighthouseResult.categories.performance?.score || 0) * 100);
                const accessibility = Math.round((data.lighthouseResult.categories.accessibility?.score || 0) * 100);
                const seo = Math.round((data.lighthouseResult.categories.seo?.score || 0) * 100);
                const bestPractices = Math.round((data.lighthouseResult.categories['best-practices']?.score || 0) * 100);

                const metrics = {
                    firstContentfulPaint: data.lighthouseResult.audits['first-contentful-paint']?.displayValue || 'N/A',
                    largestContentfulPaint: data.lighthouseResult.audits['largest-contentful-paint']?.displayValue || 'N/A',
                    timeToInteractive: data.lighthouseResult.audits['interactive']?.displayValue || 'N/A',
                    totalBlockingTime: data.lighthouseResult.audits['total-blocking-time']?.displayValue || 'N/A',
                    cumulativeLayoutShift: data.lighthouseResult.audits['cumulative-layout-shift']?.displayValue || 'N/A'
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