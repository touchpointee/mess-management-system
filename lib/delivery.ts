export type Point = { lat: number; lng: number };

export function haversine(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function nearestNeighborTSP<T extends Point>(start: Point, stops: T[]): T[] {
  if (stops.length === 0) return [];
  const ordered: T[] = [];
  let current = start;
  const remaining = [...stops];

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let nearestDist = haversine(
      current.lat,
      current.lng,
      remaining[0].lat,
      remaining[0].lng
    );
    for (let i = 1; i < remaining.length; i++) {
      const d = haversine(
        current.lat,
        current.lng,
        remaining[i].lat,
        remaining[i].lng
      );
      if (d < nearestDist) {
        nearestDist = d;
        nearestIdx = i;
      }
    }
    const next = remaining.splice(nearestIdx, 1)[0];
    ordered.push(next);
    current = next;
  }
  return ordered;
}

export function routeDistances(
  start: Point,
  orderedStops: Point[]
): { legKm: number[]; totalKm: number } {
  const legKm: number[] = [];
  let prev = start;
  for (const stop of orderedStops) {
    legKm.push(haversine(prev.lat, prev.lng, stop.lat, stop.lng));
    prev = stop;
  }
  const totalKm = legKm.reduce((a, b) => a + b, 0);
  return { legKm, totalKm };
}
