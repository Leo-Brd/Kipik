console.log('=== INITIALISATION POPUP.JS ===');
console.log('DOM Content Loaded ?', document.readyState);

document.addEventListener('DOMContentLoaded', () => {
    console.log('=== DOM CONTENT LOADED ===');
    
    const loadButton = document.getElementById('loadButton');
    const analyzeButton = document.getElementById('analyzePageSpeed');
    const resultsDiv = document.getElementById('pageSpeedResults');

    console.log('Éléments trouvés:', {
        loadButton: !!loadButton,
        analyzeButton: !!analyzeButton,
        resultsDiv: !!resultsDiv
    });

    // Gestion du bouton d'analyse standard
    loadButton.addEventListener('click', async () => {
        console.log('Bouton d\'analyse standard cliqué');
        const button = document.getElementById('loadButton');
        button.disabled = true;
        button.innerHTML = '<span class="button-icon">⏳</span> Analyse en cours...';

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        chrome.tabs.sendMessage(tab.id, { type: "GET_PAGE_INFO" }, (response) => {
            if (chrome.runtime.lastError) {
                document.getElementById('siteInfo').innerHTML = `
                    <div class="error">
                        <strong>Erreur:</strong> ${chrome.runtime.lastError.message}
                    </div>
                `;
                button.disabled = false;
                button.innerHTML = '<span class="button-icon">🔍</span> Réessayer';
                return;
            }

            const { title, url, stack, performance, content, advanced } = response;
            
            let html = `
                <div class="info-section">
                    <h2>Informations de base</h2>
                    <p><strong>Titre:</strong> ${title}</p>
                    <p><strong>URL:</strong> ${url}</p>
                    <p><strong>Langue:</strong> ${content.language}</p>
                </div>

                <div class="info-section">
                    <h2>Stack technique</h2>
                    <ul>
                        ${stack.map(tech => `<li>${tech}</li>`).join('')}
                    </ul>
                </div>

                <div class="info-section">
                    <h2>Performance</h2>
                    <p><strong>Temps de chargement:</strong> ${performance.loadTime}ms</p>
                    <p><strong>DOM Content Loaded:</strong> ${performance.domContentLoaded}ms</p>
                    <p><strong>Nombre de ressources:</strong> ${performance.resourceCount}</p>
                    <p><strong>Taille totale:</strong> ${performance.totalResourceSizeKB}KB</p>
                </div>

                <div class="info-section">
                    <h2>Polices utilisées</h2>
                    <ul>
                        ${content.fonts.map(font => `<li>${font}</li>`).join('')}
                    </ul>
                </div>

                <div class="info-section">
                    <h2>Meta Tags</h2>
                    <p><strong>Description:</strong> ${advanced.metaTags.description || 'Non définie'}</p>
                    <p><strong>Mots-clés:</strong> ${advanced.metaTags.keywords || 'Non définis'}</p>
                    <p><strong>Viewport:</strong> ${advanced.metaTags.viewport || 'Non défini'}</p>
                </div>

                <div class="info-section">
                    <h2>Stockage</h2>
                    <p><strong>Cookies:</strong> ${advanced.storage.cookies.length}</p>
                    <p><strong>Local Storage:</strong> ${advanced.storage.localStorage.length}</p>
                    <p><strong>Session Storage:</strong> ${advanced.storage.sessionStorage.length}</p>
                </div>

                <div class="info-section">
                    <h2>Liens</h2>
                    <p><strong>Liens internes:</strong> ${advanced.links.internal.length}</p>
                    <p><strong>Liens externes:</strong> ${advanced.links.external.length}</p>
                </div>
            `;

            document.getElementById('siteInfo').innerHTML = html;
            button.disabled = false;
            button.innerHTML = '<span class="button-icon">🔄</span> Analyser à nouveau';
        });
    });

    // Gestion du bouton PageSpeed
    analyzeButton.addEventListener('click', async () => {
        console.log('=== DÉBUT ANALYSE PAGESPEED ===');
        console.log('Bouton trouvé:', !!analyzeButton);
        console.log('Bouton cliqué !');
        
        try {
            console.log('Désactivation du bouton...');
            analyzeButton.disabled = true;
            analyzeButton.innerHTML = '<span class="button-icon">⏳</span> Analyse en cours...';
            resultsDiv.style.display = 'none';
            
            // Récupérer l'URL actuelle
            console.log('Récupération de l\'onglet actif...');
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            console.log('Onglet actif:', tab);
            
            if (!tab) {
                throw new Error('Aucun onglet actif trouvé');
            }

            const url = tab.url;
            console.log('URL à analyser:', url);
            
            // Récupérer la clé API
            console.log('Récupération de la clé API...');
            const apiKey = await new Promise((resolve, reject) => {
                chrome.storage.local.get(['apiKey'], (result) => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        console.log('Clé API récupérée:', result.apiKey);
                        resolve(result.apiKey);
                    }
                });
            });
            
            if (!apiKey) {
                throw new Error('Clé API non trouvée. Veuillez configurer votre clé API.');
            }

            // Envoyer le message au background script
            console.log('Envoi du message au background script...');
            chrome.runtime.sendMessage({
                type: 'ANALYZE_PAGESPEED',
                url: url,
                apiKey: apiKey
            }, (response) => {
                console.log('Réponse reçue du background script:', response);
                
                if (chrome.runtime.lastError) {
                    console.error('Erreur Chrome:', chrome.runtime.lastError);
                    throw new Error(chrome.runtime.lastError.message);
                }

                if (response.error) {
                    console.error('Erreur de l\'API:', response.error);
                    throw new Error(response.error);
                }

                const { performance, accessibility, seo, bestPractices } = response;
                console.log('Scores reçus:', { performance, accessibility, seo, bestPractices });

                // Afficher les résultats
                document.getElementById('performanceScore').textContent = `${performance}/100`;
                document.getElementById('accessibilityScore').textContent = `${accessibility}/100`;
                document.getElementById('seoScore').textContent = `${seo}/100`;
                document.getElementById('bestPracticesScore').textContent = `${bestPractices}/100`;

                // Appliquer des couleurs
                const scores = [
                    { element: document.getElementById('performanceScore'), value: performance },
                    { element: document.getElementById('accessibilityScore'), value: accessibility },
                    { element: document.getElementById('seoScore'), value: seo },
                    { element: document.getElementById('bestPracticesScore'), value: bestPractices }
                ];

                scores.forEach(({ element, value }) => {
                    if (value >= 90) {
                        element.style.color = '#10B981';
                    } else if (value >= 50) {
                        element.style.color = '#F59E0B';
                    } else {
                        element.style.color = '#EF4444';
                    }
                });

                resultsDiv.style.display = 'grid';
                analyzeButton.disabled = false;
                analyzeButton.innerHTML = '<span class="button-icon">📊</span> Analyser avec PageSpeed';
            });

        } catch (error) {
            console.error('Erreur détaillée:', error);
            document.getElementById('siteInfo').innerHTML = `
                <div class="error">
                    <strong>Erreur:</strong> ${error.message}
                </div>
            `;
            analyzeButton.disabled = false;
            analyzeButton.innerHTML = '<span class="button-icon">📊</span> Analyser avec PageSpeed';
        }
    });
});

