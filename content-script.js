console.log("Kipik est actif sur cette page!");

const pageInfo = {
  title: document.title,
  url: window.location.href,
  stack: []
};

chrome.runtime.sendMessage({ type: "PAGE_INFO", data: pageInfo });
