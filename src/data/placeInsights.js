// Quick interest helpers derived from the guide text

// Places that are, or include, a museum or art gallery (Louvre, Prado, Anadolu Medeniyetleri…)
const MUSEUM_RE = /m[üu]ze|museum|museo|mus[ée]e|louvre|gallery|galerie|hermitage|prado|uffizi|pinakothek/i;
export function isMuseum(place) {
  return MUSEUM_RE.test(place?.name || '');
}

// Dish names the guide highlights in bold (**Carbonara**) in a place's food tips
export function dishesOf(place) {
  return [...(place?.localSpecialties || '').matchAll(/\*\*([^*]+)\*\*/g)].map((m) => m[1].trim()).filter(Boolean);
}

// city -> up to 14 distinct dishes highlighted anywhere in that city's places
export function dishesByCity(places) {
  const byCity = {};
  places.forEach((p) => {
    if (!p.city) return;
    const list = dishesOf(p);
    if (!list.length) return;
    const set = byCity[p.city] || (byCity[p.city] = new Map());
    list.forEach((d) => {
      const key = d.toLocaleLowerCase('tr');
      if (!set.has(key) && set.size < 14) set.set(key, d);
    });
  });
  const out = {};
  Object.entries(byCity).forEach(([city, m]) => {
    out[city] = [...m.values()];
  });
  return out;
}
