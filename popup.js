document.getElementById("loadButton").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: "GET_PAGE_INFO" }, (response) => {
      if (chrome.runtime.lastError) {
        document.getElementById("site-info").innerText = "Impossible d'obtenir les infos.";
        return;
      }

      if (response) {
        const { title, url, stack, performance } = response;
        const siteInfoElement = document.getElementById("site-info");

        siteInfoElement.innerHTML = `
          <div class="info-block">
            <strong>Titre :</strong> ${title} <br>
            <strong>URL :</strong> <a href="${url}" target="_blank">${url}</a> <br>
            <strong>Stack :</strong> ${stack.join(', ')}
          </div>
          <div class="performance-block">
            <h2>Performance</h2>
            <ul>
              <li><strong>Temps de chargement :</strong> ${performance.loadTime} ms</li>
              <li><strong>DOM Content Loaded :</strong> ${performance.domContentLoaded} ms</li>
              <li><strong>Nombre de ressources :</strong> ${performance.resourceCount}</li>
              <li><strong>Taille totale :</strong> ${performance.totalResourceSizeKB} Ko</li>
            </ul>
          </div>
        `;
      }
    });
  });
});
