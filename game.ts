export type Painted = Record<string, number>;
export function applyStroke(painted: Painted, id: string, color: number | null): Painted {
  if (color === null) { const next = {...painted}; delete next[id]; return next; }
  return {...painted, [id]: color};
}
export function undoStroke(history: Painted[]): {painted: Painted; history: Painted[]} | null {
  if (!history.length) return null;
  return {painted: history[history.length - 1], history: history.slice(0, -1)};
}
export function progress(painted: Painted, total: number): number {
  return total ? Math.round(Object.keys(painted).length / total * 100) : 0;
}
export function availableColors(regions: ReadonlyArray<{id:string; n:number}>, painted: Painted): number[] {
  return [...new Set(regions.filter(region => painted[region.id] !== region.n).map(region => region.n))].sort((a,b)=>a-b);
}
export function newlyCompletedColor(regions: ReadonlyArray<{id:string; n:number}>, before: Painted, after: Painted, color: number | null): number | null {
  if (color === null) return null;
  return availableColors(regions, before).includes(color) && !availableColors(regions, after).includes(color) ? color : null;
}
