chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  chrome.tabs.sendMessage(tabs[0].id, { type: "GET_PAGE_INFO" }, (response) => {
    if (chrome.runtime.lastError) {
      document.getElementById("site-info").innerText = "Impossible d'obtenir les infos.";
      return;
    }

    if (response) {
      const { title, url, stack } = response;
      document.getElementById("site-info").innerHTML = `
        <strong>Titre :</strong> ${title} <br>
        <strong>URL :</strong> <a href="${url}" target="_blank">${url}</a> <br>
        <strong>Stack :</strong> ${stack.join(', ')}
      `;
    }
  });
});