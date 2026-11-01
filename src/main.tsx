import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { applyStroke, undoStroke, progress, availableColors, newlyCompletedColor, type Painted } from '../game';
import './style.css';
import SunflowerCanvas from './SunflowerCanvas';
import sunflowerRegions from './sunflower-regions.json';
import roseRegions from './rose-solo-regions.json';

const sunflowerColors = ['#eab744','#f3ce68','#94623c','#79a761','#a8d5dc','#e5edf0','#a6bc78','#557f50','#8fae75','#c5cf91'];
const roseColors = ['#bf3d45','#d7585c','#e8807b','#79a761','#a8d5dc','#e5edf0','#a6bc78','#557f50','#8fae75','#c5cf91'];
function Game({type}:{type:'sunflower'|'rose'}){
 const isSunflower=type==='sunflower';
 const regions=isSunflower?sunflowerRegions:roseRegions;
 const colors=isSunflower?sunflowerColors:roseColors;
 const [selected,setSelected]=useState<number | null>(1);
 const [game,setGame]=useState<{painted: Painted; history: Painted[]; celebration: number | null}>({painted:{},history:[],celebration:null});
 const {painted,history,celebration}=game;
 const percent=progress(painted,regions.length);
 const available=availableColors(regions,painted);
 const activeColor=selected === null ? null : available.includes(selected) ? selected : available[0];
 function paint(id:string){
  setGame(current=>{
   if (activeColor === undefined || (current.painted[id] ?? null) === activeColor) return current;
   const next=applyStroke(current.painted,id,activeColor);
   return {painted:next,history:[...current.history,current.painted],celebration:newlyCompletedColor(regions,current.painted,next,activeColor)};
  });
 }
 function undo(){setGame(current=>{const previous=undoStroke(current.history); return previous ? {...previous,celebration:null} : current})}
 return <><header><div className="brand">pausa<span>.</span></div><div className="tag">Un pequeño espacio para crear</div></header><main><div className="intro"><div><h1>Un momento de color</h1><p>Elige un color y descubre la ilustración, pieza por pieza.</p></div><div className="counter">{Object.keys(painted).length} de {regions.length} piezas coloreadas</div></div><div className="workspace"><section className="canvas" aria-label="Ilustración para colorear"><SunflowerCanvas painted={painted} colors={colors} celebration={celebration} onPaint={paint} regions={regions} artSrc={isSunflower?"girasol-simplificado.png":"rosa-sin-fondo.png"} mapSrc={isSunflower?"girasol-regiones.png":"rosa-sin-fondo-regiones.png"} name={isSunflower?"Girasol":"Rosa"} isSunflower={isSunflower}/><div className="palette" aria-label="Selector de colores">{colors.map((color,i)=>regions.some(r=>r.n===i+1)&&<button key={color} className="swatch" aria-label={`Color ${i+1}${available.includes(i+1) ? "" : ", completado"}`} disabled={!available.includes(i+1)} aria-pressed={activeColor===i+1} onClick={()=>setSelected(i+1)}><span style={{background:color}}>{i+1}</span></button>)}<button className="tool" aria-label="Deshacer última acción" title="Deshacer" disabled={!history.length} onClick={undo}>↶</button><button className="tool" aria-label="Borrador" title="Borrador" aria-pressed={activeColor===null} onClick={()=>setSelected(null)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 14 8-8a2 2 0 0 1 3 0l4 4a2 2 0 0 1 0 3l-6 6H8l-4-4a1 1 0 0 1 0-1Zm4 5h12M9 9l7 7"/></svg></button></div></section><aside className="side"><h2>Tu paleta</h2><p>Selecciona un color y toca cualquier pieza para pintarla.</p><div className="hint"><strong>Cómo jugar</strong>Completa las piezas de cada número para bloquear su color. Si te equivocas, usa el borrador o deshaz el último cambio.</div><div className="message" aria-live="polite">{available.length===0?'¡Terminaste! Completaste todos los colores.':celebration!==null?`¡Completaste el color ${celebration}!`:''}</div><div className="bottom"><div className="progress-label"><span>Tu progreso</span><span>{percent}%</span></div><div className="progress"><span style={{width:`${percent}%`}}/></div><button className="reset" onClick={()=>{setGame({painted:{},history:[],celebration:null});setSelected(1)}}>Empezar de nuevo</button></div></aside></div><p className="foot">Una pieza a la vez. No hay prisa.</p></main></>;
}
function App(){
 const [drawing,setDrawing]=useState<'sunflower'|'rose'>('sunflower');
 return <><div className="drawing-menu"><label htmlFor="drawing">Ilustración</label><select id="drawing" value={drawing} onChange={e=>setDrawing(e.target.value as 'sunflower'|'rose')}><option value="sunflower">Girasol</option><option value="rose">Rosa roja</option></select></div><div hidden={drawing!=='sunflower'}><Game type="sunflower"/></div><div hidden={drawing!=='rose'}><Game type="rose"/></div></>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);

