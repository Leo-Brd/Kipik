(function() {
    console.log("[Kipik] Détecteur de stack actif");
  
    function detectFrameworks() {
      const stack = [];
      const html = document.documentElement.outerHTML;
      const scripts = Array.from(document.scripts).map(script => script.src || script.innerText);
      const metas = Array.from(document.getElementsByTagName('meta')).map(meta => meta.outerHTML.toLowerCase());
  
      // --- Frontend Frameworks ---
      if (scripts.some(src => src.includes('react')) || html.includes('data-reactroot')) {
        stack.push('React');
      }
      if (scripts.some(src => src.includes('vue')) || html.includes('data-v-app') || html.includes('__VUE_DEVTOOLS_GLOBAL_HOOK__')) {
        stack.push('Vue.js');
      }
      if (html.includes('ng-version') || scripts.some(src => src.includes('angular'))) {
        stack.push('Angular');
      }
      if (html.includes('data-svelte') || scripts.some(src => src.includes('svelte'))) {
        stack.push('Svelte');
      }
      if (scripts.some(src => src.includes('ember')) || html.includes('ember-view')) {
        stack.push('Ember.js');
      }
      if (scripts.some(src => src.includes('backbone')) || html.includes('Backbone.Model')) {
        stack.push('Backbone.js');
      }
  
      // --- Static Site Generators ---
      if (html.includes('__NEXT_DATA__') || scripts.some(src => src.includes('_next'))) {
        stack.push('Next.js');
      }
      if (html.includes('__NUXT__') || scripts.some(src => src.includes('_nuxt'))) {
        stack.push('Nuxt.js');
      }
      if (scripts.some(src => src.includes('gatsby')) || html.includes('gatsby')) {
        stack.push('Gatsby.js');
      }
      if (html.includes('eleventy') || html.includes('11ty')) {
        stack.push('Eleventy (11ty)');
      }
  
      // --- CMS / E-commerce ---
      if (metas.some(meta => meta.includes('wordpress')) || html.includes('wp-content') || html.includes('wp-includes')) {
        stack.push('WordPress');
      }
      if (metas.some(meta => meta.includes('shopify')) || scripts.some(src => src.includes('cdn.shopify'))) {
        stack.push('Shopify');
      }
      if (html.includes('data-drupal-selector') || metas.some(meta => meta.includes('drupal'))) {
        stack.push('Drupal');
      }
      if (html.includes('joomla')) {
        stack.push('Joomla');
      }
      if (html.includes('prestashop')) {
        stack.push('PrestaShop');
      }
      if (html.includes('squarespace')) {
        stack.push('Squarespace');
      }
      if (html.includes('wix.com')) {
        stack.push('Wix');
      }
  
      // --- Backend Frameworks ---
      if (html.includes('laravel') || scripts.some(src => src.includes('laravel'))) {
        stack.push('Laravel');
      }
      if (scripts.some(src => src.includes('rails')) || html.includes('csrf-param')) {
        stack.push('Ruby on Rails');
      }
      if (html.includes('django')) {
        stack.push('Django');
      }
      if (scripts.some(src => src.includes('flask'))) {
        stack.push('Flask');
      }
  
      // --- CSS Frameworks ---
      if (scripts.some(src => src.includes('bootstrap')) || (html.includes('container') && html.includes('row'))) {
        stack.push('Bootstrap');
      }
      if (scripts.some(src => src.includes('tailwind')) || html.includes('tailwind')) {
        stack.push('Tailwind CSS');
      }
      if (scripts.some(src => src.includes('foundation')) || html.includes('foundation')) {
        stack.push('Foundation');
      }
      if (scripts.some(src => src.includes('bulma')) || html.includes('bulma')) {
        stack.push('Bulma');
      }
      if (scripts.some(src => src.includes('materialize')) || html.includes('materialize')) {
        stack.push('Materialize CSS');
      }
  
      // --- JavaScript Libraries ---
      if (typeof window.jQuery !== 'undefined' || scripts.some(src => src.includes('jquery'))) {
        stack.push('jQuery');
      }
      if (scripts.some(src => src.includes('lodash'))) {
        stack.push('Lodash');
      }
      if (scripts.some(src => src.includes('moment'))) {
        stack.push('Moment.js');
      }
      if (scripts.some(src => src.includes('three'))) {
        stack.push('Three.js');
      }
  
      return stack.length ? stack : ['Aucune stack détectée'];
    }
  
    const detectedStack = detectFrameworks();
    console.log("[Kipik] Stack détectée:", detectedStack);
    console.log("[Kipik] Envoi des données de stack au content script");
    window.postMessage({ type: 'STACK_DETECTED', stack: detectedStack }, '*');
  })();
  