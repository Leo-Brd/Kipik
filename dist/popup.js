"use strict";
console.log('=== INITIALISATION POPUP.JS ===');
console.log('DOM Content Loaded ?', document.readyState);
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== DOM CONTENT LOADED ===');
    const loadButton = document.getElementById('loadButton');
    const analyzeButton = document.getElementById('analyzePageSpeed');
    const resultsDiv = document.getElementById('pageSpeedResults');
    const siteInfo = document.getElementById('siteInfo');
    console.log('Éléments trouvés:', {
        loadButton: !!loadButton,
        analyzeButton: !!analyzeButton,
        resultsDiv: !!resultsDiv
    });
    // Fonction pour basculer l'affichage des contenus
    const toggleContent = (showElement, hideElement) => {
        showElement.style.display = 'block';
        hideElement.style.display = 'none';
    };
    // Mappage langue -> drapeau (flag-icons)
    function mapLanguageToFlagClass(lang) {
        const map = { en: 'gb', zh: 'cn', ja: 'jp' };
        const code = (lang !== null && lang !== void 0 ? lang : '').toLowerCase().split('-')[0];
        const country = map[code] || code;
        return `fi fi-${country}`;
    }
    // Gestion du bouton d'analyse standard
    loadButton.addEventListener('click', async () => {
        console.log('Bouton d\'analyse standard cliqué');
        loadButton.disabled = true;
        loadButton.innerHTML = '<img src="assets/sablier.png" alt="Logo sablier" class="button-icon" /> Analyse en cours...';
        const [tab] = (await chrome.tabs.query({ active: true, currentWindow: true }));
        chrome.tabs.sendMessage(tab.id, { type: "GET_PAGE_INFO" }, (response) => {
            if (chrome.runtime.lastError) {
                siteInfo.innerHTML = `
                    <div class="error">
                        <strong>Erreur:</strong> ${chrome.runtime.lastError.message}
                    </div>
                `;
                loadButton.disabled = false;
                loadButton.innerHTML = '<span class="button-icon">��</span> Réessayer';
                return;
            }
            const { title, url, stack, performance, content, advanced } = response;
            toggleContent(siteInfo, resultsDiv);
            let html = `
                <div class="info-section">
                    <h2>Informations de base</h2>
                    <p><strong>Titre:</strong> ${title}</p>
                    <p><strong>URL:</strong> ${url}</p>
                    <p><strong>Langue:</strong>
                        ${(Array.isArray(content.language) ? content.language : [content.language])
                .map((lang) => `<span class="${mapLanguageToFlagClass(lang)}"></span>`)
                .join('')}
                    </p>
                </div>

                <div class="info-section">
                    <h2>Stack technique</h2>
                    <div class="tech-stack">
                        ${stack.map((tech) => `
                            <div class="tech-item">
                                <img src="assets/tech-logos/${tech}.svg" alt="${tech}" class="tech-logo" />
                                <span class="tech-name">${tech}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="info-section">
                    <h2>Performance</h2>
                    <p><strong>Temps de chargement:</strong> ${performance.loadTime}ms</p>
                    <p><strong>DOM Content Loaded:</strong> ${performance.domContentLoaded}ms</p>
                    <p><strong>Nombre de ressources:</strong> ${performance.resourceCount}</p>
                    <p><strong>Taille totale:</strong> ${performance.totalResourceSizeKB}KB</p>
                </div>

                <div class="info-section">
                    <h2>Polices détectées</h2>
                    <ul id="fontsList">
                        ${content.fonts.map((font) => `<li>${font}</li>`).join('')}
                    </ul>
                </div>

                <div class="info-section">
                    <h2>Meta Tags</h2>
                    <p><strong>Description:</strong> ${advanced.metaTags.description || 'Non définie'}</p>
                    <p><strong>Mots-clés:</strong> ${advanced.metaTags.keywords || 'Non définis'}</p>
                </div>

                <div class="info-section">
                    <h2>Stockage</h2>
                    <p><strong>🍪 Cookies:</strong> ${advanced.storage.cookies.length}</p>
                    <p><strong>🔗 Local Storage:</strong> ${advanced.storage.localStorage.length}</p>
                    <p><strong>🔑 Session Storage:</strong> ${advanced.storage.sessionStorage.length}</p>
                </div>

                <div class="info-section">
                    <h2>Liens</h2>
                    <div class="chart-container">
                        <canvas id="linksChart" width="200" height="200"></canvas>
                    </div>
                </div>
            `;
            siteInfo.innerHTML = html;
            // Afficher les polices utilisées
            const fontsList = document.getElementById('fontsList');
            if (content.fonts && content.fonts.length > 0) {
                const sampleText = "Keep Peek";
                // Liste des polices système courantes à exclure
                const systemFonts = ['system-ui', 'ui-sans-serif', 'ui-serif', 'ui-monospace', 'ui-rounded', 'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy'];
                // Liste des polices CSS par défaut
                const defaultFonts = [
                    'Arial', 'Helvetica', 'Times New Roman', 'Times', 'Courier New', 'Courier',
                    'Verdana', 'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS',
                    'Trebuchet MS', 'Arial Black', 'Impact'
                ];
                // Filtrer les polices système
                const customFonts = content.fonts.filter((font) => systemFonts.indexOf(font.toLowerCase()) === -1);
                // Fonction pour vérifier et afficher une police
                const checkAndDisplayFont = async (font) => {
                    const fontName = font.replace(/\s+/g, '+');
                    const fontUrl = `https://fonts.googleapis.com/css2?family=${fontName}:wght@400&display=swap`;
                    // Vérifier si c'est une police CSS par défaut
                    if (defaultFonts.some(defaultFont => defaultFont.toLowerCase() === font.toLowerCase())) {
                        return `
                            <li class="font-example">
                                <span class="font-name">${font}</span>
                                <span class="font-sample" style="font-family: '${font}'">
                                    ${sampleText}
                                </span>
                            </li>
                        `;
                    }
                    try {
                        const response = await fetch(fontUrl);
                        if (response.ok) {
                            // Charger la police depuis Google Fonts
                            const linkElement = document.createElement('link');
                            linkElement.rel = 'stylesheet';
                            linkElement.href = fontUrl;
                            document.head.appendChild(linkElement);
                            return `
                                <li class="font-example">
                                    <span class="font-name">${font}</span>
                                    <span class="font-sample" style="font-family: '${font}'">
                                        ${sampleText}
                                    </span>
                                </li>
                            `;
                        }
                    }
                    catch (error) {
                        console.log(`La police ${font} n'est pas disponible sur Google Fonts`);
                    }
                    // Pour les autres polices, n'afficher que le nom
                    return `
                        <li class="font-example">
                            <span class="font-name">${font}</span>
                        </li>
                    `;
                };
                // Vérifier et afficher toutes les polices
                const fontPromises = customFonts.map(checkAndDisplayFont);
                Promise.all(fontPromises).then(fontElements => {
                    fontsList.innerHTML = fontElements.join('');
                    // Générer un camembert pour les liens internes vs externes
                    const ctxLinks = document.getElementById('linksChart').getContext('2d');
                    new Chart(ctxLinks, {
                        type: 'pie',
                        data: {
                            labels: ['Liens internes', 'Liens externes'],
                            datasets: [{
                                    data: [advanced.links.internal.length, advanced.links.external.length],
                                    backgroundColor: ['#4a6bff', '#dc3545']
                                }]
                        },
                        options: {
                            responsive: false, // utilisation de la taille fixe du canvas
                            plugins: { legend: { position: 'bottom' } }
                        }
                    });
                });
            }
            else {
                fontsList.innerHTML = '<li>Aucune police détectée</li>';
            }
            loadButton.disabled = false;
            loadButton.innerHTML = '<img src="assets/refresh.png" alt="Logo Refresh" class="button-icon" /> Analyser à nouveau';
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
            analyzeButton.innerHTML = '<img src="assets/sablier.png" alt="Logo sablier" class="button-icon" /> Analyse en cours...';
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
                    }
                    else {
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
                if (chrome.runtime.lastError) {
                    throw new Error(chrome.runtime.lastError.message);
                }
                if (response.error) {
                    throw new Error(response.error);
                }
                const { performance, accessibility, seo, bestPractices, metrics } = response;
                console.log('Métriques reçues:', metrics);
                // Afficher d'abord les scores principaux
                const scores = [
                    { element: document.getElementById('performanceScore'), value: performance },
                    { element: document.getElementById('accessibilityScore'), value: accessibility },
                    { element: document.getElementById('seoScore'), value: seo },
                    { element: document.getElementById('bestPracticesScore'), value: bestPractices }
                ];
                scores.forEach(({ element, value }) => {
                    element.textContent = `${value}/100`;
                    if (value >= 90) {
                        element.style.color = '#10B981';
                    }
                    else if (value >= 50) {
                        element.style.color = '#F59E0B';
                    }
                    else {
                        element.style.color = '#EF4444';
                    }
                });
                // Afficher les métriques
                const fcpElement = document.getElementById('fcp');
                const lcpElement = document.getElementById('lcp');
                const ttiElement = document.getElementById('tti');
                const tbtElement = document.getElementById('tbt');
                const clsElement = document.getElementById('cls');
                if (fcpElement)
                    fcpElement.textContent = metrics.firstContentfulPaint;
                if (lcpElement)
                    lcpElement.textContent = metrics.largestContentfulPaint;
                if (ttiElement)
                    ttiElement.textContent = metrics.timeToInteractive;
                if (tbtElement)
                    tbtElement.textContent = metrics.totalBlockingTime;
                if (clsElement)
                    clsElement.textContent = metrics.cumulativeLayoutShift;
                // Maintenant, basculer l'affichage
                toggleContent(resultsDiv, siteInfo);
                // Réinitialiser le bouton
                analyzeButton.disabled = false;
                analyzeButton.innerHTML = '<img src="assets/refresh.png" alt="Logo Refresh" class="button-icon" /> Analyser avec PageSpeed';
            });
        }
        catch (error) {
            console.error('Erreur détaillée:', error);
            siteInfo.innerHTML = `
                <div class="error">
                    <strong>Erreur:</strong> ${error.message}
                </div>
            `;
            // Réinitialiser le bouton en cas d'erreur
            analyzeButton.disabled = false;
            analyzeButton.innerHTML = '<img src="assets/refresh.png" alt="Logo Refresh" class="button-icon" /> Analyser avec PageSpeed';
        }
    });
});
