import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { applyStroke, undoStroke, progress, availableColors, newlyCompletedColor, normalizeArtistName, type Painted } from '../game';
import '@fontsource/allura';
import './style.css';
import SunflowerCanvas from './SunflowerCanvas';
import Signature from './SignatureDrawing';
import sunflowerRegions from './sunflower-regions.json';
import roseRegions from './rose-solo-regions.json';
import beachRegions from './beach-regions.json';

const sunflowerColors = ['#eab744','#f3ce68','#94623c','#79a761','#a8d5dc','#e5edf0','#a6bc78','#557f50','#8fae75','#c5cf91'];
const roseColors = ['#bf3d45','#d7585c','#e8807b','#79a761','#a8d5dc','#e5edf0','#a6bc78','#557f50','#f5e3e1','#c5cf91'];
const beachColors = ['#add9e2','#edf4f2','#f3c95d','#72a96e','#a9bf8b','#bc8e69','#d28261','#e7d5b2','#78bfca','#b7e0dc','#efd7a6','#bdaba0'];
function Game({type,active,artist}:{type:'sunflower'|'rose'|'beach';active:boolean;artist:string}){
 const isSunflower=type==='sunflower'; const isBeach=type==='beach';
 const regions=isSunflower?sunflowerRegions:isBeach?beachRegions:roseRegions;
 const colors=isSunflower?sunflowerColors:isBeach?beachColors:roseColors;
 const [selected,setSelected]=useState<number | null>(1);
 const stageRef=useRef<HTMLDivElement>(null);
 const originalCanvas=useRef<DOMRect | null>(null);
 const [game,setGame]=useState<{painted: Painted; history: Painted[]; celebration: number | null; timeline: Painted[]; replayIndex: number | null; closing: boolean}>({painted:{},history:[],celebration:null,timeline:[{}],replayIndex:null,closing:false});
 const {painted,history,celebration,timeline,replayIndex,closing}=game;
 const replaying=replayIndex!==null;
 const displayed=replaying&&!closing&&replayIndex>=0?timeline[replayIndex]:painted;
 const shownPercent=replaying&&!closing&&replayIndex>=0?Math.round(replayIndex/Math.max(timeline.length-1,1)*100):progress(painted,regions.length);
 useEffect(()=>{
  if(!active || replayIndex===null)return;
  const delay=closing?600:replayIndex===-1?1300:Math.max(15,Math.min(180,5000/Math.max(timeline.length-1,1)));
  const timer=window.setTimeout(()=>setGame(current=>{
   if(current.replayIndex===null)return current;
   if(current.closing)return {...current,replayIndex:null,closing:false,celebration:null};
   if(current.replayIndex+1>=current.timeline.length)return {...current,closing:true};
   return {...current,replayIndex:current.replayIndex+1};
  }),delay);
  return ()=>window.clearTimeout(timer);
 },[active,replayIndex,timeline.length,closing]);
 useEffect(()=>{
  if(!closing || !active || !stageRef.current || !originalCanvas.current)return;
  const stage=stageRef.current;
  const canvas=stage.querySelector('canvas');
  if(!canvas)return;
  const current=canvas.getBoundingClientRect(), target=originalCanvas.current, box=stage.getBoundingClientRect();
  const dx=target.left+target.width/2-(current.left+current.width/2);
  const dy=target.top+target.height/2-(current.top+current.height/2);
  stage.style.transformOrigin=`${current.left+current.width/2-box.left}px ${current.top+current.height/2-box.top}px`;
  const frame=requestAnimationFrame(()=>{stage.style.setProperty('--return-x',`${dx}px`);stage.style.setProperty('--return-y',`${dy}px`);stage.style.setProperty('--return-scale',`${target.width/current.width}`)});
  return ()=>{cancelAnimationFrame(frame);stage.style.removeProperty('--return-x');stage.style.removeProperty('--return-y');stage.style.removeProperty('--return-scale');stage.style.removeProperty('transform-origin')};
 },[closing,active]);
 const available=availableColors(regions,painted);
 const signed=available.length===0 && !replaying && !!artist;
 const activeColor=selected === null ? null : available.includes(selected) ? selected : available[0];
 function paint(id:string){
  if(!artist)return;
  if(!replaying){const canvas=stageRef.current?.querySelector('canvas'); if(canvas)originalCanvas.current=canvas.getBoundingClientRect()}
  setGame(current=>{
   if (current.replayIndex !== null || activeColor === undefined || (current.painted[id] ?? null) === activeColor) return current;
   const next=applyStroke(current.painted,id,activeColor);
   const finished=availableColors(regions,current.painted).length>0 && availableColors(regions,next).length===0;
   const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   return {painted:next,history:[...current.history,current.painted],celebration:newlyCompletedColor(regions,current.painted,next,activeColor),timeline:[...current.timeline,next],replayIndex:finished&&!reduced?-1:null,closing:false};
  });
 }
 function undo(){setGame(current=>{if(current.replayIndex!==null)return current;const previous=undoStroke(current.history); return previous ? {...current,...previous,celebration:null,timeline:[...current.timeline,previous.painted]} : current})}
 return <><main><div className="intro"><div><h1>Un momento de color</h1><p>Elige un color y descubre la ilustración, pieza por pieza.</p></div><div className="counter">{Object.keys(painted).length} de {regions.length} piezas coloreadas</div></div><div className="workspace"><div ref={stageRef} className={`game-stage ${replaying?"replay-stage":""} ${closing?"replay-exit":""}`}><section className="canvas" aria-label="Ilustración para colorear">{replaying&&<div className="replay-sparkles" aria-hidden="true"><i/><i/><i/><i/><i/><i/></div>}<div className={`artwork ${signed?"artwork-signed":""}`}><SunflowerCanvas painted={displayed} colors={colors} celebration={replaying?null:celebration} onPaint={paint} regions={regions} artSrc={isSunflower?"girasol-simplificado.png":isBeach?"playa.png":"rosa-sin-fondo.png"} mapSrc={isSunflower?"girasol-regiones.png":isBeach?"playa-regiones.png":"rosa-sin-fondo-regiones.png"} name={isSunflower?"Girasol":isBeach?"Casa en la playa":"Rosa"} isSunflower={isSunflower}/>{signed&&<div className="artwork-signature" aria-label={`Firmado por ${artist}`}><Signature name={artist}/></div>}</div><div className="palette" aria-label="Selector de colores">{colors.map((color,i)=>regions.some(r=>r.n===i+1)&&<button key={color} className="swatch" aria-label={`Color ${i+1}${available.includes(i+1) ? "" : ", completado"}`} disabled={replaying||!available.includes(i+1)} aria-pressed={activeColor===i+1} onClick={()=>setSelected(i+1)}><span style={{background:color,color:color==='#191919'?'#fff':undefined}}>{i+1}</span></button>)}<button className="tool" aria-label="Deshacer última acción" title="Deshacer" disabled={replaying||!history.length} onClick={undo}>↶</button><button className="tool" aria-label="Borrador" title="Borrador" disabled={replaying} aria-pressed={activeColor===null} onClick={()=>setSelected(null)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 14 8-8a2 2 0 0 1 3 0l4 4a2 2 0 0 1 0 3l-6 6H8l-4-4a1 1 0 0 1 0-1Zm4 5h12M9 9l7 7"/></svg></button></div></section><div className="stage-progress"><div className="progress-label"><span>{replaying?'Reproduciendo tu proceso':'Tu progreso'}</span><span>{shownPercent}%</span></div><div className="progress"><span style={{width:`${shownPercent}%`}}/></div><div className="message" aria-live="polite">{replaying?(replayIndex===-1?'¡Terminaste! Tu obra está lista ✨':'Así cobró vida tu ilustración'):available.length===0?'¡Terminaste! Completaste todos los colores.':celebration!==null?`¡Completaste el color ${celebration}!`:''}{replaying&&<button className="skip-replay" disabled={closing} onClick={()=>setGame(current=>({...current,closing:true}))}>Saltar animación</button>}</div></div></div></div></main></>;
}
type Drawing = 'sunflower' | 'rose' | 'beach';
const drawings: {id: Drawing; name: string; image: string}[] = [
 {id:'sunflower',name:'Girasol',image:'girasol-simplificado.png'},
 {id:'rose',name:'Rosa roja',image:'rosa-sin-fondo.png'},
 {id:'beach',name:'Casa en la playa',image:'playa.png'},
];
function ArtistDialog({initialName,onConfirm,onCancel}:{initialName:string;onConfirm:(name:string)=>void;onCancel?:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);
 const [input,setInput]=useState(initialName);
 useEffect(()=>{const element=dialog.current;if(!element)return;if(!element.open)element.showModal();return()=>{if(element.open)element.close()}},[]);
 function submit(event:React.FormEvent<HTMLFormElement>){event.preventDefault();const name=normalizeArtistName(input);if(name)onConfirm(name)}
 return <dialog ref={dialog} className="artist-dialog" onCancel={event=>{event.preventDefault();onCancel?.()}} aria-labelledby="artist-title"><form onSubmit={submit}><h2 id="artist-title">{initialName?'Cambiar nombre':'Tu nombre en la obra'}</h2><p>Al terminar, tus ilustraciones llevarán tu firma.</p><label htmlFor="signature-input">¿Cómo quieres firmarlas?</label><input id="signature-input" autoFocus required maxLength={40} autoComplete="off" data-1p-ignore="true" data-lpignore="true" data-bwignore="true" data-form-type="other" value={input} onChange={event=>setInput(event.target.value)} placeholder="Tu nombre"/><button type="submit" disabled={!normalizeArtistName(input)}>{initialName?'Guardar nombre':'Empezar a colorear'}</button>{onCancel&&<button type="button" className="artist-cancel" onClick={onCancel}>Cancelar</button>}<p className="artist-note">Tu nombre se guarda solo mientras esta página esté abierta.</p></form></dialog>;
}
function App(){
 const [artist,setArtist]=useState('');
 const [editingArtist,setEditingArtist]=useState(false);
 const [drawing,setDrawing]=useState<Drawing>('sunflower');
 return <><header><div className="brand"><img className="brand-icon" src={`${import.meta.env.BASE_URL}colora-logo.png`} alt=""/><span className="brand-name">Colora<span>.</span></span></div><div className="header-right"><div className="tag">Un pequeño espacio para crear</div>{artist&&<div className="header-artist"><span>Autor: <strong>{artist}</strong></span><button type="button" onClick={()=>setEditingArtist(true)}>Cambiar</button></div>}</div></header><div className="app-layout"><nav className="drawing-rail" aria-label="Elegir ilustración"><h2>Ilustraciones</h2><div className="drawing-list">{drawings.map(item=><button key={item.id} className="drawing-option" aria-pressed={drawing===item.id} onClick={()=>setDrawing(item.id)}><img src={`${import.meta.env.BASE_URL}${item.image}`} alt=""/><span>{item.name}</span></button>)}</div></nav><div className="game-view"><div hidden={drawing!=='sunflower'}><Game type="sunflower" active={drawing==='sunflower'} artist={artist}/></div><div hidden={drawing!=='rose'}><Game type="rose" active={drawing==='rose'} artist={artist}/></div><div hidden={drawing!=='beach'}><Game type="beach" active={drawing==='beach'} artist={artist}/></div></div>{(!artist||editingArtist)&&<ArtistDialog initialName={artist} onConfirm={name=>{setArtist(name);setEditingArtist(false)}} onCancel={artist?()=>setEditingArtist(false):undefined}/>}</div></>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);

