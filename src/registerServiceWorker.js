// Test installation/offline behavior with npm run build + npm run preview.
export function registerServiceWorker() {
  if (import.meta.env.PROD && 'serviceWorker' in navigator && window.isSecureContext) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, {
        scope: import.meta.env.BASE_URL,
        updateViaCache: 'none',
      }).catch((error) => console.error('StreamList offline support could not start:', error));
    });
  }
}
