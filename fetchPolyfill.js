// Minimal fetch polyfill placeholder
// If you intend to support very old browsers, replace this with a real polyfill (e.g., github/fetch polyfill)
if (typeof window.fetch !== 'function') {
  // very naive fallback - developer should substitute a full polyfill
  window.fetch = function() {
    return Promise.reject(new Error('Fetch not available - please include a polyfill'));
  };
}
