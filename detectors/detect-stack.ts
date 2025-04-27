// Types pour la communication
interface StackMessage {
    type: 'STACK_DETECTED';
    stack: string[];
}

(function() {
    console.log("[Kipik] Détecteur de stack actif");
  
    function detectFrameworks(): string[] {
      const stack: string[] = [];
      const html: string = document.documentElement.outerHTML;
      const scripts: string[] = Array.from(document.scripts).map((script: HTMLScriptElement) => script.src || script.innerText);
      const metas: string[] = Array.from(document.getElementsByTagName('meta')).map((meta: HTMLMetaElement) => meta.outerHTML.toLowerCase());
  
      // --- Frontend Frameworks ---
      if (typeof (window as any).React !== 'undefined' || 
          scripts.some(src => src.includes('react') || src.includes('react-dom')) || 
          html.includes('data-reactroot') || 
          document.querySelector('[data-reactroot]')) {
        stack.push('React');
      }
      
      if (typeof (window as any).Vue !== 'undefined' || 
          scripts.some(src => src.includes('vue')) || 
          html.includes('data-v-app') || 
          document.querySelector('[data-v-app]')) {
        stack.push('Vue.js');
      }
      
      if (typeof (window as any).angular !== 'undefined' || 
          scripts.some(src => src.includes('angular')) || 
          html.includes('ng-version') || 
          document.querySelector('[ng-version]')) {
        stack.push('Angular');
      }
      
      if (typeof (window as any).svelte !== 'undefined' || 
          scripts.some(src => src.includes('svelte')) || 
          html.includes('data-svelte') || 
          document.querySelector('[data-svelte]')) {
        stack.push('Svelte');
      }
      
      if (typeof (window as any).Ember !== 'undefined' || 
          scripts.some(src => src.includes('ember')) || 
          html.includes('ember-view') || 
          document.querySelector('[data-ember]')) {
        stack.push('Ember.js');
      }
      
      if (typeof (window as any).Backbone !== 'undefined' || 
          scripts.some(src => src.includes('backbone')) || 
          html.includes('Backbone.Model') || 
          document.querySelector('[data-backbone]')) {
        stack.push('Backbone.js');
      }
  
      // --- Static Site Generators ---
      if (scripts.some(src => src.includes('/_next/') || src.includes('_next')) || 
          html.includes('__NEXT_DATA__') || 
          document.querySelector('[data-nextjs]')) {
        stack.push('Next.js');
      }
      
      if (scripts.some(src => src.includes('/_nuxt/') || src.includes('_nuxt')) || 
          html.includes('__NUXT__') || 
          document.querySelector('[data-nuxt]')) {
        stack.push('Nuxt.js');
      }
      
      if (scripts.some(src => src.includes('gatsby')) || 
          html.includes('gatsby') || 
          document.querySelector('[data-gatsby]')) {
        stack.push('Gatsby.js');
      }
      
      if (html.includes('eleventy') || 
          html.includes('11ty') || 
          document.querySelector('[data-eleventy]')) {
        stack.push('Eleventy (11ty)');
      }
  
      // --- CMS / E-commerce ---
      if (metas.some(meta => meta.includes('wordpress')) || 
          html.includes('wp-content') || 
          html.includes('wp-includes') || 
          scripts.some(src => src.includes('wp-content'))) {
        stack.push('WordPress');
      }
      
      if (metas.some(meta => meta.includes('shopify')) || 
          scripts.some(src => src.includes('cdn.shopify')) || 
          document.querySelector('[data-shopify]')) {
        stack.push('Shopify');
      }
      
      if (html.includes('data-drupal-selector') || 
          metas.some(meta => meta.includes('drupal')) || 
          scripts.some(src => src.includes('drupal'))) {
        stack.push('Drupal');
      }
      
      if (html.includes('joomla') || 
          metas.some(meta => meta.includes('joomla')) || 
          scripts.some(src => src.includes('joomla'))) {
        stack.push('Joomla');
      }
      
      if (html.includes('prestashop') || 
          scripts.some(src => src.includes('prestashop')) || 
          document.querySelector('[data-prestashop]')) {
        stack.push('PrestaShop');
      }
      
      if (html.includes('squarespace') || 
          scripts.some(src => src.includes('squarespace')) || 
          document.querySelector('[data-squarespace]')) {
        stack.push('Squarespace');
      }
      
      if (html.includes('wix.com') || 
          scripts.some(src => src.includes('wix')) || 
          document.querySelector('[data-wix]')) {
        stack.push('Wix');
      }
  
      // --- Backend Frameworks ---
      if (html.includes('laravel') || 
          scripts.some(src => src.includes('laravel')) || 
          document.querySelector('meta[name="csrf-token"]')) {
        stack.push('Laravel');
      }
      
      if (scripts.some(src => src.includes('rails')) || 
          html.includes('csrf-param') || 
          document.querySelector('meta[name="csrf-param"]')) {
        stack.push('Ruby on Rails');
      }
      
      if (html.includes('django') || 
          scripts.some(src => src.includes('django')) || 
          document.querySelector('[data-django]')) {
        stack.push('Django');
      }
      
      if (scripts.some(src => src.includes('flask')) || 
          document.querySelector('[data-flask]')) {
        stack.push('Flask');
      }
  
      // --- CSS Frameworks ---
      if ((scripts.some(src => src.includes('bootstrap') && src.includes('.min.js'))) || 
          (document.querySelector('.container') && 
           document.querySelector('.row') && 
           document.querySelector('.col') &&
           document.querySelector('.btn') &&
           document.querySelector('.navbar'))) {
        stack.push('Bootstrap');
      }
      
      if (scripts.some(src => src.includes('tailwind')) || 
          html.includes('tailwind') || 
          document.querySelector('[class*="tw-"]')) {
        stack.push('Tailwind CSS');
      }
      
      if (scripts.some(src => src.includes('foundation')) || 
          html.includes('foundation') || 
          document.querySelector('.foundation')) {
        stack.push('Foundation');
      }
      
      if (scripts.some(src => src.includes('bulma')) || 
          html.includes('bulma') || 
          document.querySelector('.bulma')) {
        stack.push('Bulma');
      }
      
      if (scripts.some(src => src.includes('materialize')) || 
          html.includes('materialize') || 
          document.querySelector('.materialize')) {
        stack.push('Materialize CSS');
      }
  
      // --- JavaScript Libraries ---
      if (typeof (window as any).jQuery !== 'undefined' || 
          scripts.some(src => src.includes('jquery')) || 
          typeof (window as any).$ !== 'undefined') {
        stack.push('jQuery');
      }
      
      if (typeof (window as any)._ !== 'undefined' || 
          scripts.some(src => src.includes('lodash'))) {
        stack.push('Lodash');
      }
      
      if (typeof (window as any).moment !== 'undefined' || 
          scripts.some(src => src.includes('moment'))) {
        stack.push('Moment.js');
      }
      
      if (typeof (window as any).THREE !== 'undefined' || 
          scripts.some(src => src.includes('three'))) {
        stack.push('Three.js');
      }
  
      return stack.length ? stack : ['Aucune stack détectée'];
    }
  
    const detectedStack: string[] = detectFrameworks();
    console.log("[Kipik] Stack détectée:", detectedStack);
    console.log("[Kipik] Envoi des données de stack au content script");
    const message: StackMessage = { type: 'STACK_DETECTED', stack: detectedStack };
    window.postMessage(message, '*');
  })();
  