// Backup of everything the user added: visits, favourites, ratings, notes, checklists, own photos,
// own places and the trip plan. The guide text itself is not included (it comes with the site),
// so the file stays small and a restore never overwrites newer guide content.
const FORMAT = 'gezginogi-yedek';

export function buildBackup(places, trip) {
  const state = {};
  const custom = [];
  places.forEach((p) => {
    if (p.isCustom) custom.push(p);
    const has =
      p.visited || p.favorite || p.userRating > 0 || (p.userNotes && p.userNotes.trim()) ||
      (p.userPhotos && p.userPhotos.length) || (p.checklist && p.checklist.some((c) => c.done));
    if (has && !p.isCustom) {
      state[p.id] = {
        visited: !!p.visited,
        visitedDate: p.visitedDate || '',
        favorite: !!p.favorite,
        userRating: p.userRating || 0,
        userNotes: p.userNotes || '',
        checklist: p.checklist || [],
        userPhotos: p.userPhotos || []
      };
    }
  });
  return { format: FORMAT, version: 2, date: new Date().toISOString(), state, custom, trip: trip || null };
}

export function downloadBackup(backup) {
  const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gezginogi-yedek-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export function parseBackup(text) {
  const data = JSON.parse(text);
  if (!data || data.format !== FORMAT || typeof data.state !== 'object') {
    throw new Error('Bu bir GezginOgi yedek dosyası değil.');
  }
  return data;
}

// Counts for the confirmation question
export function summarizeBackup(b) {
  const list = Object.values(b.state);
  return {
    places: list.length,
    photos: list.reduce((s, v) => s + (v.userPhotos ? v.userPhotos.length : 0), 0),
    custom: (b.custom || []).length
  };
}

// Merges a backup into the current places: places in the backup take its values, the rest stay as they are
export function applyBackup(places, b) {
  const merged = places.map((p) => (b.state[p.id] ? { ...p, ...b.state[p.id] } : p));
  const have = new Set(merged.map((p) => p.id));
  (b.custom || []).forEach((c) => {
    if (c && c.id && !have.has(c.id)) merged.push(c);
  });
  return merged;
}
