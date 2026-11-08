// Read-only share link: the visited and favorite place ids, compressed into the
// URL hash (#paylas=...). Notes, ratings and photos are never included.
const PREFIX = '#paylas=';

const toBase64Url = (bytes) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromBase64Url = (s) =>
  Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

async function pipe(bytes, stream) {
  const out = new Response(new Blob([bytes]).stream().pipeThrough(stream));
  return new Uint8Array(await out.arrayBuffer());
}

export async function createShareLink(places) {
  const payload = {
    v: places.filter((p) => p.visited).map((p) => p.id),
    f: places.filter((p) => p.favorite).map((p) => p.id)
  };
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  const packed = await pipe(bytes, new CompressionStream('deflate-raw'));
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}${PREFIX}${toBase64Url(packed)}`;
}

export async function readShareFromHash() {
  const hash = window.location.hash || '';
  if (!hash.startsWith(PREFIX)) return null;
  try {
    const bytes = await pipe(fromBase64Url(hash.slice(PREFIX.length)), new DecompressionStream('deflate-raw'));
    const payload = JSON.parse(new TextDecoder().decode(bytes));
    return { visited: new Set(payload.v || []), favorite: new Set(payload.f || []) };
  } catch (e) {
    console.warn('Paylaşım linki okunamadı:', e);
    return null;
  }
}

export function leaveShareView() {
  window.location.href = `${window.location.origin}${window.location.pathname}`;
}
