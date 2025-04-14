document.addEventListener('DOMContentLoaded', () => {
    const loadButton = document.getElementById('loadButton');
    const analyzeButton = document.getElementById('analyzePageSpeed');
    const resultsDiv = document.getElementById('pageSpeedResults');
    const performanceScore = document.getElementById('performanceScore');
    const accessibilityScore = document.getElementById('accessibilityScore');
    const seoScore = document.getElementById('seoScore');
    const bestPracticesScore = document.getElementById('bestPracticesScore');

    // Gestion du bouton d'analyse standard
    loadButton.addEventListener('click', async () => {
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
        try {
            analyzeButton.disabled = true;
            analyzeButton.innerHTML = '<span class="button-icon">⏳</span> Analyse en cours...';
            resultsDiv.style.display = 'none';

            // Récupérer l'URL actuelle
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const url = tab.url;

            // Récupérer la clé API via le service worker
            console.log('Tentative de récupération de la clé API...');
            const { apiKey } = await new Promise((resolve) => {
                chrome.runtime.sendMessage({ type: 'GET_API_KEY' }, (response) => {
                    resolve(response);
                });
            });
            
            console.log('Clé API récupérée:', apiKey);
            
            if (!apiKey) {
                console.error('Clé API non trouvée');
                throw new Error('Clé API non trouvée. Veuillez configurer votre clé API.');
            }

            const apiEndpoint = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
            
            // Construire l'URL avec les paramètres
            const apiUrl = new URL(apiEndpoint);
            apiUrl.searchParams.set('url', url);
            apiUrl.searchParams.set('key', apiKey);
            apiUrl.searchParams.set('strategy', 'mobile'); // ou 'desktop'

            // Appeler l'API PageSpeed
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`Erreur HTTP! statut: ${response.status}`);
            }
            const data = await response.json();

            // Vérifier que la réponse contient les données nécessaires
            if (!data.lighthouseResult || !data.lighthouseResult.categories) {
                throw new Error('Format de réponse invalide de l\'API PageSpeed');
            }

            // Extraire les scores avec des valeurs par défaut
            const performanceScore = Math.round((data.lighthouseResult.categories.performance?.score || 0) * 100);
            const accessibilityScore = Math.round((data.lighthouseResult.categories.accessibility?.score || 0) * 100);
            const seoScore = Math.round((data.lighthouseResult.categories.seo?.score || 0) * 100);
            const bestPracticesScore = Math.round((data.lighthouseResult.categories['best-practices']?.score || 0) * 100);

            // Afficher les résultats
            document.getElementById('performanceScore').textContent = `${performanceScore}/100`;
            document.getElementById('accessibilityScore').textContent = `${accessibilityScore}/100`;
            document.getElementById('seoScore').textContent = `${seoScore}/100`;
            document.getElementById('bestPracticesScore').textContent = `${bestPracticesScore}/100`;

            // Appliquer des couleurs en fonction des scores
            const scores = [
                { element: document.getElementById('performanceScore'), value: performanceScore },
                { element: document.getElementById('accessibilityScore'), value: accessibilityScore },
                { element: document.getElementById('seoScore'), value: seoScore },
                { element: document.getElementById('bestPracticesScore'), value: bestPracticesScore }
            ];

            scores.forEach(({ element, value }) => {
                if (value >= 90) {
                    element.style.color = '#10B981'; // Vert
                } else if (value >= 50) {
                    element.style.color = '#F59E0B'; // Orange
                } else {
                    element.style.color = '#EF4444'; // Rouge
                }
            });

            // Afficher les métriques détaillées avec vérification
            const metrics = data.lighthouseResult.audits || {};
            const metricsHtml = `                <div class="metrics-section">
                    <h3>Métriques de performance</h3>
                    <ul>
                        <li>First Contentful Paint: ${metrics['first-contentful-paint']?.displayValue || 'N/A'}</li>
                        <li>Speed Index: ${metrics['speed-index']?.displayValue || 'N/A'}</li>
                        <li>Largest Contentful Paint: ${metrics['largest-contentful-paint']?.displayValue || 'N/A'}</li>
                        <li>Time to Interactive: ${metrics['interactive']?.displayValue || 'N/A'}</li>
                        <li>Total Blocking Time: ${metrics['total-blocking-time']?.displayValue || 'N/A'}</li>
                    </ul>
                </div>
            `;

            document.getElementById('siteInfo').innerHTML += metricsHtml;
            resultsDiv.style.display = 'grid';

        } catch (error) {
            console.error('Erreur lors de l\'analyse:', error);
            document.getElementById('siteInfo').innerHTML = `
                <div class="error">
                    <strong>Erreur:</strong> ${error.message}
                </div>
            `;
        } finally {
            analyzeButton.disabled = false;
            analyzeButton.innerHTML = '<span class="button-icon">📊</span> Analyser avec PageSpeed';
        }
    });
});

