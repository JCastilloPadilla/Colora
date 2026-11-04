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

it('incluye el fondo de la rosa como una pieza para colorear de negro', () => {
  expect(roseRegions.some(region => region.n === 9 && region.x === 100 && region.y === 100)).toBe(true);
});

import { normalizeArtistName } from './game';
it('prepara un nombre legible y rechaza entradas vacías', () => {
  expect(normalizeArtistName('  Ana   María  ')).toBe('Ana María');
  expect(normalizeArtistName('   ')).toBe('');
});

import { makeSignature } from './src/signature-paths';
it('prepara trazos reales para nombres con espacios y acentos', () => {
  const result=makeSignature('José Ávila');
  expect(result).not.toBeNull();
  expect(result!.strokes.length).toBeGreaterThan(9);
  expect(result!.width).toBeGreaterThan(0);
  expect(makeSignature('李')).toBeNull();
});

import { numberOpacity } from './game';
it('desvanece los números y los recupera al volver a editar', () => {
  expect(numberOpacity(false, 500)).toBe(1);
  expect(numberOpacity(true, 0)).toBe(1);
  expect(numberOpacity(true, 650)).toBeCloseTo(.5);
  expect(numberOpacity(true, 1300)).toBe(0);
  expect(numberOpacity(true, 100, true)).toBe(0);
});

import capybaraRegions from './src/capybara-regions.json';
it('prepara el capibara con más piezas, números válidos e identificadores consecutivos', () => {
  expect(capybaraRegions.length).toBeGreaterThan(regions.length);
  expect(capybaraRegions.every((r,i)=>r.id===String(i+1)&&r.x>=20&&r.x<=1234&&r.y>=20&&r.y<=1234&&r.n>=1&&r.n<=15)).toBe(true);
});

it('distingue la lengua del capibara de la nieve', () => {
  expect(capybaraRegions.find(region=>region.id==='89')?.n).toBe(3);
  expect(capybaraRegions.find(region=>region.id==='91')?.n).toBe(13);
});

it('asigna los colores revisados al cielo, letrero, muebles y lámpara', () => {
  const color=(id:string)=>capybaraRegions.find(region=>region.id===id)?.n;
  expect([color('22'),color('18'),color('153'),color('166'),color('210')]).toEqual([7,13,10,10,15]);
  expect([color('128'),color('133'),color('211'),color('212'),color('213')]).toEqual([9,5,2,9,11]);
});

import catRegions from './src/cat-regions.json';
it('prepara el gato con dificultad intermedia y colores válidos', () => {
  expect(catRegions.length).toBeGreaterThan(regions.length);
  expect(catRegions.length).toBeLessThan(capybaraRegions.length);
  expect(catRegions.every((region,index)=>region.id===String(index+1)&&region.n>=1&&region.n<=15&&region.x>=20&&region.x<=1234&&region.y>=20&&region.y<=1234)).toBe(true);
});

import tulipRegions from './src/tulip-regions.json';
it('prepara el tulipán con regiones consecutivas y colores válidos', () => {
  expect(tulipRegions.length).toBeGreaterThan(roseRegions.length);
  expect(tulipRegions.every((r,i)=>r.id===String(i+1)&&r.n>=1&&r.n<=8&&r.x>=20&&r.x<=1234&&r.y>=20&&r.y<=1234)).toBe(true);
});
