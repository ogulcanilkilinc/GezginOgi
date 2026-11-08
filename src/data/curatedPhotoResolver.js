// src/data/curatedPhotoResolver.js
// Photo URLs are NOT hand-built here. They are resolved at build time by
// scripts/resolve-photos.mjs via Wikidata (P18) + Commons imageinfo API (iiurlwidth=960),
// which returns the canonical thumbnail path (hash folder computed by Commons itself)
// and verifies each URL returns an image. Unresolved places keep coverImage: ''.

/**
 * Returns the URL as provided by the Commons API. Only downsizes standard
 * Wikimedia /960px- thumbnails to /500px- for small list thumbnails.
 */
export function getOptimizedImageUrl(url, width = 960) {
  if (!url) return '';
  if (width <= 500 && url.includes('upload.wikimedia.org') && url.includes('/960px-')) {
    return url.replace('/960px-', '/500px-');
  }
  return url;
}
