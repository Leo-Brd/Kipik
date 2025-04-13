document.getElementById("loadButton").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: "GET_PAGE_INFO" }, (response) => {
      if (chrome.runtime.lastError) {
        document.getElementById("site-info").innerHTML = "<p>Impossible d'obtenir les infos.</p>";
        return;
      }

      if (response) {
        const { title, url, stack, performance, content } = response;
        const siteInfoElement = document.getElementById("site-info");

        siteInfoElement.innerHTML = `
          <div class="info-block">
            <h2>Informations de base</h2>
            <p><strong>Titre :</strong> ${title}</p>
            <p><strong>URL :</strong> <a href="${url}" target="_blank">${url}</a></p>
            <p><strong>Langue :</strong> ${content.language.toUpperCase()}</p>
          </div>

          <div class="info-block">
            <h2>Stack technique</h2>
            <ul>
              ${stack.map(tech => `<li>${tech}</li>`).join('')}
            </ul>
          </div>

          <div class="info-block">
            <h2>Performance</h2>
            <ul>
              <li><strong>Temps de chargement :</strong> ${performance.loadTime} ms</li>
              <li><strong>DOM Content Loaded :</strong> ${performance.domContentLoaded} ms</li>
              <li><strong>Nombre de ressources :</strong> ${performance.resourceCount}</li>
              <li><strong>Taille totale :</strong> ${performance.totalResourceSizeKB} Ko</li>
            </ul>
          </div>

          <div class="info-block">
            <h2>Polices utilisées</h2>
            <ul>
              ${content.fonts.length > 0 
                ? content.fonts.map(font => `<li>${font}</li>`).join('')
                : '<li>Aucune police personnalisée détectée</li>'
              }
            </ul>
          </div>
        `;
      }
    });
  });
});
