import { describe, expect, it } from 'vitest';
import { applyStroke, undoStroke, progress } from './game';
describe('reglas del juego', () => {
  it('permite colorear y cambiar el color de cualquier pieza', () => {
    expect(applyStroke({}, 'a', 3)).toEqual({a: 3});
    expect(applyStroke({a: 3}, 'a', 1)).toEqual({a: 1});
  });
  it('borra una pieza sin afectar a las demás', () => {
    expect(applyStroke({a: 3, b: 2}, 'a', null)).toEqual({b: 2});
  });
  it('deshace el último cambio, incluido un borrado', () => {
    expect(undoStroke([{a: 1}, {}])).toEqual({painted: {}, history: [{a: 1}]});
    expect(undoStroke([])).toBeNull();
  });
  it('calcula el progreso de las piezas coloreadas', () => {
    expect(progress({a: 1, b: 2}, 4)).toBe(50);
    expect(progress({}, 0)).toBe(0);
  });
});

import { availableColors } from './game';
it('bloquea solo colores cuyas piezas correspondientes tienen el color correcto', () => {
  const regions = [{id:'a', n:1}, {id:'b', n:1}, {id:'c', n:2}];
  expect(availableColors(regions, {a:1, b:2, c:2})).toEqual([1]);
  expect(availableColors(regions, {a:1, b:1, c:2})).toEqual([]);
  expect(availableColors(regions, {a:1, c:2})).toEqual([1]);
});

import { newlyCompletedColor } from './game';
it('detecta únicamente cuando se completa un color con una jugada', () => {
  const regions = [{id:'a',n:1},{id:'b',n:1},{id:'c',n:2}];
  expect(newlyCompletedColor(regions, {a:1}, {a:1,b:1}, 1)).toBe(1);
  expect(newlyCompletedColor(regions, {a:1,b:1}, {a:1,b:1,c:1}, 1)).toBeNull();
  expect(newlyCompletedColor(regions, {a:1,b:1}, {a:1}, null)).toBeNull();
});

import regions from './src/sunflower-regions.json';
it('mantiene los números dentro de la ilustración y usa todos los colores', () => {
  expect(regions.every(r => r.x >= 20 && r.x <= 1234 && r.y >= 20 && r.y <= 1234)).toBe(true);
  expect([...new Set(regions.map(r => r.n))].sort((a,b)=>a-b)).toEqual([1,2,3,4,5,6,7,8,9,10]);
});

import roseRegions from './src/rose-solo-regions.json';
it('prepara la rosa con identificadores únicos y números dentro del lienzo', () => {
  expect(new Set(roseRegions.map(r=>r.id)).size).toBe(roseRegions.length);
  expect(roseRegions.every(r=>r.x >= 20 && r.x <= 1234 && r.y >= 20 && r.y <= 1234 && r.n >= 1 && r.n <= 10)).toBe(true);
});
