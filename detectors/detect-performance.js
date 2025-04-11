(function() {
    console.log("[Kipik] Détecteur de performances injecté.");
  
    function collectPerformanceData() {
      let navigationEntry = performance.getEntriesByType('navigation')[0];
      const resources = performance.getEntriesByType('resource');
  
      let loadTime, domContentLoaded;
  
      if (navigationEntry) {
        // Utilisation de Navigation Timing Level 2
        loadTime = navigationEntry.loadEventEnd;
        domContentLoaded = navigationEntry.domContentLoadedEventEnd;
      }
  
      const data = {
        loadTime: Math.round(loadTime),
        domContentLoaded: Math.round(domContentLoaded),
        resourceCount: resources.length,
        totalResourceSizeKB: Math.round(resources.reduce((acc, res) => acc + (res.transferSize || 0), 0) / 1024)
      };
  
      return data;
    }
  
    window.addEventListener('load', () => {
      const performanceData = collectPerformanceData();
      window.postMessage({ type: 'PERFORMANCE_DATA', data: performanceData }, '*');
    });
  })();
  