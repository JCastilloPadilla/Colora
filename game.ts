export type Painted = Record<string, number>;
export function paintRegion(painted: Painted, id: string, required: number, selected: number): Painted {
  if (required !== selected || painted[id]) return painted;
  return { ...painted, [id]: required };
}
export function progress(painted: Painted, total: number): number {
  return total ? Math.round(Object.keys(painted).length / total * 100) : 0;
}
export function availableColors(regions: ReadonlyArray<{id: string; n: number}>, painted: Painted): number[] {
  return [...new Set(regions.filter(region => !painted[region.id]).map(region => region.n))].sort((a, b) => a - b);
}
