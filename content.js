console.log("Kipik est actif sur cette page!");

// Fonction pour détecter la stack utilisée
function detectStack() {
  const stack = [];

  // FRAMEWORK STACKS
  // React
  if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined') {
    stack.push('React');
  }

  // Vue.js
  if (typeof window.Vue !== 'undefined') {
    stack.push('Vue.js');
  }

  // Angular
  if (typeof window.angular !== 'undefined') {
    stack.push('Angular');
  }

  // Svelte
  if (typeof window.Svelte !== 'undefined') {
    stack.push('Svelte');
  }

  // Ember.js
  if (typeof window.Ember !== 'undefined') {
    stack.push('Ember.js');
  }

  // CMS STACKS
  // WordPress
  if (typeof window.wp !== 'undefined') {
    stack.push('WordPress');
  }

  // Shopify
  if (typeof window.Shopify !== 'undefined') {
    stack.push('Shopify');
  }

  // FRAMEWORKS CSS STACKS
  // Bootstrap
  if (typeof window.bootstrap !== 'undefined') {
    stack.push('Bootstrap');
  }

  // SERVER SIDE FRAMEWORKS STACKS
  // Next.js
  if (typeof window.__NEXT_DATA__ !== 'undefined' && window.__NEXT_DATA__.props) {
    stack.push('Next.js');
  }

  // Nuxt.js
  if (typeof window.__NUXT__ !== 'undefined' && window.__NUXT__.state) {
    stack.push('Nuxt.js');
  }
  
  return stack.length > 0 ? stack : ['Aucune stack détectée'];
}

// Quand on reçoit un message depuis la popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_PAGE_INFO") {
    const pageInfo = {
      title: document.title,
      url: window.location.href,
      stack: detectStack()
    };

    sendResponse(pageInfo);
  }
});