// Straight-line distance in km between two [lat, lng] points
export function distanceKm(a, b) {
  if (!a || !b) return 0;
  const R = 6371;
  const t = Math.PI / 180;
  const dLat = (b[0] - a[0]) * t;
  const dLon = (b[1] - a[1]) * t;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * t) * Math.cos(b[0] * t) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Sum of straight-line legs along an ordered list of places
export function routeKm(placesInOrder) {
  let total = 0;
  for (let i = 1; i < placesInOrder.length; i++) {
    total += distanceKm(placesInOrder[i - 1].coords, placesInOrder[i].coords);
  }
  return total;
}

// Roads are rarely straight: a common rule of thumb is ~1.3x the straight-line distance
export const ROAD_FACTOR = 1.3;

export function formatKm(km) {
  return km >= 100 ? `${Math.round(km)} km` : `${km.toFixed(1)} km`;
}

// Shortest visiting order found for a handful of stops: nearest-neighbour from every start,
// improved with 2-opt (an open path, so the trip may end anywhere). Stops without coordinates go last.
export function optimizeOrder(stops) {
  const pts = stops.filter((p) => p.coords && p.coords.length === 2);
  const rest = stops.filter((p) => !(p.coords && p.coords.length === 2));
  if (pts.length < 3) return [...pts, ...rest];
  const n = pts.length;
  const d = pts.map((a) => pts.map((b) => distanceKm(a.coords, b.coords)));
  const len = (o) => o.slice(1).reduce((s, v, i) => s + d[o[i]][v], 0);
  let best = null;
  for (let start = 0; start < n; start++) {
    const order = [start];
    const left = new Set(pts.keys());
    left.delete(start);
    while (left.size) {
      const last = order[order.length - 1];
      let next = -1;
      left.forEach((j) => {
        if (next < 0 || d[last][j] < d[last][next]) next = j;
      });
      order.push(next);
      left.delete(next);
    }
    let improved = true;
    while (improved) {
      improved = false;
      for (let i = 0; i < n - 1; i++) {
        for (let k = i + 1; k < n; k++) {
          const before = (i > 0 ? d[order[i - 1]][order[i]] : 0) + (k < n - 1 ? d[order[k]][order[k + 1]] : 0);
          const after = (i > 0 ? d[order[i - 1]][order[k]] : 0) + (k < n - 1 ? d[order[i]][order[k + 1]] : 0);
          if (after < before - 1e-9) {
            const seg = order.slice(i, k + 1).reverse();
            order.splice(i, seg.length, ...seg);
            improved = true;
          }
        }
      }
    }
    if (!best || len(order) < len(best)) best = order;
  }
  return [...best.map((i) => pts[i]), ...rest];
}

// Splits an ordered route into `dayCount` consecutive days, keeping each day short on the road
// and the number of stops per day close to even. Returns the day number (1-based) of each stop.
export function splitIntoDays(ordered, dayCount) {
  const n = ordered.length;
  const days = Math.max(1, Math.min(dayCount, n));
  if (n === 0) return [];
  const leg = (i) => (ordered[i].coords && ordered[i - 1].coords ? distanceKm(ordered[i - 1].coords, ordered[i].coords) : 0);
  const prefix = [0];
  for (let i = 1; i < n; i++) prefix.push(prefix[i - 1] + leg(i));
  const avgLeg = n > 1 ? prefix[n - 1] / (n - 1) : 0;
  const target = n / days;
  // Cost of one day covering stops a..b: road within the day plus a penalty for uneven days
  const cost = (a, b) => prefix[b] - prefix[a] + (avgLeg || 1) * (b - a + 1 - target) ** 2;
  const memo = Array.from({ length: days + 1 }, () => new Array(n + 1).fill(null));
  const solve = (k, start) => {
    if (k === 1) return { c: cost(start, n - 1), cuts: [] };
    if (memo[k][start]) return memo[k][start];
    let best = null;
    for (let end = start; end <= n - k; end++) {
      const r = solve(k - 1, end + 1);
      const c = cost(start, end) + r.c;
      if (!best || c < best.c) best = { c, cuts: [end + 1, ...r.cuts] };
    }
    memo[k][start] = best;
    return best;
  };
  const { cuts } = solve(days, 0);
  const result = [];
  let day = 1;
  for (let i = 0; i < n; i++) {
    if (cuts.includes(i)) day++;
    result.push(day);
  }
  return result;
}
