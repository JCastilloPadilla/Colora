import { describe, expect, it } from 'vitest';
import { paintRegion, progress } from './game';
describe('reglas del juego', () => {
  it('solo colorea una región cuando coincide el color', () => {
    expect(paintRegion({}, 'a', 2, 1)).toEqual({});
    expect(paintRegion({}, 'a', 2, 2)).toEqual({ a: 2 });
  });
  it('calcula el progreso sin contar piezas duplicadas', () => {
    expect(progress({ a: 1, b: 2 }, 4)).toBe(50);
    expect(progress({}, 0)).toBe(0);
  });
});

import { availableColors } from './game';
it('desactiva un color solo cuando todas sus piezas están completas', () => {
  const pieces = [{id:'a', n:1}, {id:'b', n:1}, {id:'c', n:2}];
  expect(availableColors(pieces, {a:1})).toEqual([1,2]);
  expect(availableColors(pieces, {a:1,b:1})).toEqual([2]);
  expect(availableColors(pieces, {a:1,b:1,c:2})).toEqual([]);
});
