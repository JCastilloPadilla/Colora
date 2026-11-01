import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { applyStroke, undoStroke, progress, availableColors, newlyCompletedColor, type Painted } from '../game';
import './style.css';
import SunflowerCanvas from './SunflowerCanvas';
import sunflowerRegions from './sunflower-regions.json';
import roseRegions from './rose-solo-regions.json';
import beachRegions from './beach-regions.json';

const sunflowerColors = ['#eab744','#f3ce68','#94623c','#79a761','#a8d5dc','#e5edf0','#a6bc78','#557f50','#8fae75','#c5cf91'];
const roseColors = ['#bf3d45','#d7585c','#e8807b','#79a761','#a8d5dc','#e5edf0','#a6bc78','#557f50','#191919','#c5cf91'];
const beachColors = ['#add9e2','#edf4f2','#f3c95d','#72a96e','#a9bf8b','#bc8e69','#d28261','#e7d5b2','#78bfca','#b7e0dc','#efd7a6','#bdaba0'];
function Game({type}:{type:'sunflower'|'rose'|'beach'}){
 const isSunflower=type==='sunflower'; const isBeach=type==='beach';
 const regions=isSunflower?sunflowerRegions:isBeach?beachRegions:roseRegions;
 const colors=isSunflower?sunflowerColors:isBeach?beachColors:roseColors;
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
 return <><main><div className="intro"><div><h1>Un momento de color</h1><p>Elige un color y descubre la ilustración, pieza por pieza.</p></div><div className="counter">{Object.keys(painted).length} de {regions.length} piezas coloreadas</div></div><div className="workspace"><div className="game-stage"><section className="canvas" aria-label="Ilustración para colorear"><SunflowerCanvas painted={painted} colors={colors} celebration={celebration} onPaint={paint} regions={regions} artSrc={isSunflower?"girasol-simplificado.png":isBeach?"playa.png":"rosa-sin-fondo.png"} mapSrc={isSunflower?"girasol-regiones.png":isBeach?"playa-regiones.png":"rosa-sin-fondo-regiones.png"} name={isSunflower?"Girasol":isBeach?"Casa en la playa":"Rosa"} isSunflower={isSunflower}/><div className="palette" aria-label="Selector de colores">{colors.map((color,i)=>regions.some(r=>r.n===i+1)&&<button key={color} className="swatch" aria-label={`Color ${i+1}${available.includes(i+1) ? "" : ", completado"}`} disabled={!available.includes(i+1)} aria-pressed={activeColor===i+1} onClick={()=>setSelected(i+1)}><span style={{background:color,color:color==='#191919'?'#fff':undefined}}>{i+1}</span></button>)}<button className="tool" aria-label="Deshacer última acción" title="Deshacer" disabled={!history.length} onClick={undo}>↶</button><button className="tool" aria-label="Borrador" title="Borrador" aria-pressed={activeColor===null} onClick={()=>setSelected(null)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 14 8-8a2 2 0 0 1 3 0l4 4a2 2 0 0 1 0 3l-6 6H8l-4-4a1 1 0 0 1 0-1Zm4 5h12M9 9l7 7"/></svg></button></div></section><div className="stage-progress"><div className="progress-label"><span>Tu progreso</span><span>{percent}%</span></div><div className="progress"><span style={{width:`${percent}%`}}/></div><div className="message" aria-live="polite">{available.length===0?'¡Terminaste! Completaste todos los colores.':celebration!==null?`¡Completaste el color ${celebration}!`:''}</div></div></div></div></main></>;
}
type Drawing = 'sunflower' | 'rose' | 'beach';
const drawings: {id: Drawing; name: string; image: string}[] = [
 {id:'sunflower',name:'Girasol',image:'girasol-simplificado.png'},
 {id:'rose',name:'Rosa roja',image:'rosa-sin-fondo.png'},
 {id:'beach',name:'Casa en la playa',image:'playa.png'},
];
function App(){
 const [drawing,setDrawing]=useState<Drawing>('sunflower');
 return <><header><div className="brand"><img className="brand-icon" src={`${import.meta.env.BASE_URL}colora-logo.png`} alt=""/><span className="brand-name">Colora<span>.</span></span></div><div className="tag">Un pequeño espacio para crear</div></header><div className="app-layout"><nav className="drawing-rail" aria-label="Elegir ilustración"><h2>Ilustraciones</h2><div className="drawing-list">{drawings.map(item=><button key={item.id} className="drawing-option" aria-pressed={drawing===item.id} onClick={()=>setDrawing(item.id)}><img src={`${import.meta.env.BASE_URL}${item.image}`} alt=""/><span>{item.name}</span></button>)}</div></nav><div className="game-view"><div hidden={drawing!=='sunflower'}><Game type="sunflower"/></div><div hidden={drawing!=='rose'}><Game type="rose"/></div><div hidden={drawing!=='beach'}><Game type="beach"/></div></div></div></>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);

