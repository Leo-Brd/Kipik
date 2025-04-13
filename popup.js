document.getElementById('loadButton').addEventListener('click', async () => {
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
                <h2>Médias</h2>
                <p><strong>Images:</strong> ${advanced.media.images.length}</p>
                <p><strong>Vidéos:</strong> ${advanced.media.videos.length}</p>
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
                <h2>Ressources</h2>
                <p><strong>Scripts internes:</strong> ${advanced.resources.scripts.length}</p>
                <p><strong>Scripts externes:</strong> ${advanced.resources.externalScripts.length}</p>
                <p><strong>Styles internes:</strong> ${advanced.resources.styles.length}</p>
                <p><strong>Styles externes:</strong> ${advanced.resources.externalStyles.length}</p>
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
