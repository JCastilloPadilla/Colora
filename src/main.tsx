import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { applyStroke, undoStroke, progress, availableColors, newlyCompletedColor, normalizeArtistName, type Painted } from '../game';
import '@fontsource/allura';
import './style.css';
import SunflowerCanvas from './SunflowerCanvas';
import Signature from './SignatureDrawing';
import {downloadArtwork} from './downloadArtwork';
import sunflowerRegions from './sunflower-regions.json';
import roseRegions from './rose-solo-regions.json';
import capybaraRegions from './capybara-regions.json';
import catRegions from './cat-regions.json';
import tulipRegions from './tulip-regions.json';

const tulipColors = ['#e77997','#f39daf','#f6b9c6','#d86280','#76a76a','#9abe82','#57865b','#f8e7cf'];
const sunflowerColors = ['#eab744','#f3ce68','#94623c','#79a761','#a8d5dc','#e5edf0','#a6bc78','#557f50','#8fae75','#c5cf91'];
const roseColors = ['#bf3d45','#d7585c','#e8807b','#79a761','#a8d5dc','#e5edf0','#a6bc78','#557f50','#f5e3e1','#c5cf91'];
const catColors = ['#efa75d','#bb683d','#f39ca5','#fff0d9','#a26b4b','#53a8b5','#e87565','#f4be4e','#69a95f','#8fd3e3','#dbe7eb','#83b3ae','#e99281','#dda9bf','#e8c99e'];
const capybaraColors = ['#c99a74','#ae7d59','#f0aeb3','#f3d4a3','#8daf83','#628968','#c5e6ef','#d58071','#f3e9d7','#d6c6b5','#9bc5cb','#d7ad75','#c7b8df','#ed8b83','#f1c66f'];
function PaletteColors({children}:{children:React.ReactNode}){
 const drag=useRef<{startY:number;scrollTop:number;dragging:boolean}|null>(null);
 const suppressClick=useRef(false);
 function start(event:React.PointerEvent<HTMLDivElement>){
  if(event.pointerType!=='mouse'||event.button!==0)return;
  suppressClick.current=false;
  drag.current={startY:event.clientY,scrollTop:event.currentTarget.scrollTop,dragging:false};
 }
 function move(event:React.PointerEvent<HTMLDivElement>){
  const state=drag.current;if(!state)return;
  const distance=event.clientY-state.startY;
  if(!state.dragging&&Math.abs(distance)>5){state.dragging=true;suppressClick.current=true;event.currentTarget.setPointerCapture(event.pointerId)}
  if(state.dragging){event.preventDefault();event.currentTarget.scrollTop=state.scrollTop-distance}
 }
 function finish(event:React.PointerEvent<HTMLDivElement>){
  if(drag.current?.dragging){suppressClick.current=true;window.setTimeout(()=>{suppressClick.current=false},0)}
  if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
  drag.current=null;
 }
 return <div className="palette-colors" aria-label="Colores disponibles" onPointerDown={start} onPointerMove={move} onPointerUp={finish} onPointerCancel={finish} onClickCapture={event=>{if(suppressClick.current){event.preventDefault();event.stopPropagation()}}}>{children}</div>;
}
function Game({type,active,artist,onEditArtist}:{type:'sunflower'|'rose'|'capybara'|'cat'|'tulip';active:boolean;artist:string;onEditArtist:()=>void}){
 const isSunflower=type==='sunflower'; const isCapybara=type==='capybara'; const isCat=type==='cat'; const isTulip=type==='tulip';
 const regions=isSunflower?sunflowerRegions:isCapybara?capybaraRegions:isCat?catRegions:isTulip?tulipRegions:roseRegions;
 const colors=isSunflower?sunflowerColors:isCapybara?capybaraColors:isCat?catColors:isTulip?tulipColors:roseColors;
 const [selected,setSelected]=useState<number | null>(1);
 const [downloadError,setDownloadError]=useState(false);
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
 async function download(){
  const source=stageRef.current?.querySelector('canvas');if(!source)return;
  setDownloadError(false);
  try{await downloadArtwork(source,artist,isSunflower?'girasol':isCapybara?'capibara':isCat?'gato':isTulip?'tulipan':'rosa')}
  catch{setDownloadError(true)}
 }
 function undo(){setGame(current=>{if(current.replayIndex!==null)return current;const previous=undoStroke(current.history); return previous ? {...current,...previous,celebration:null,timeline:[...current.timeline,previous.painted]} : current})}
 return <><main><div className="intro"><div><div className="intro-title"><h1>Un momento de color</h1>{artist&&<button type="button" className="artist-control" onClick={onEditArtist} aria-label={`Cambiar nombre del autor: ${artist}`} title="Cambiar nombre del autor"><span className="artist-control-label">Autor</span><strong>{artist}</strong><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.1 13.3 20.5 5a1.7 1.7 0 0 0-2.4-2.4l-8.3 6.4"/><path d="M14.1 13.3c-1.3-1.8-2.9-3.2-4.3-4.3L7.7 11a3.3 3.3 0 0 0 4.7 4.7l1.7-2.4Z"/><path d="M7.7 11c-3.1 0-4.7 1.8-4.7 4.4 0 1.4-.7 2.4-1.5 3.1 3.4.6 7.4-.2 8-3"/></svg></button>}</div><p>Elige un color y descubre la ilustración, pieza por pieza.</p></div><div className="counter">{Object.keys(painted).length} de {regions.length} piezas coloreadas</div></div><div className="workspace"><div ref={stageRef} className={`game-stage ${replaying?"replay-stage":""} ${closing?"replay-exit":""}`}><section className="canvas" aria-label="Ilustración para colorear">{replaying&&<div className="replay-sparkles" aria-hidden="true"><i/><i/><i/><i/><i/><i/></div>}<div className={`artwork ${signed?"artwork-signed":""}`}><SunflowerCanvas painted={displayed} colors={colors} celebration={replaying?null:celebration} onPaint={paint} regions={regions} artSrc={isSunflower?"girasol-simplificado.png":isCapybara?"capibara.png":isCat?"gato.png":isTulip?"tulipan.png":"rosa-sin-fondo.png"} mapSrc={isSunflower?"girasol-regiones.png":isCapybara?"capibara-regiones.png?v=10":isCat?"gato-regiones.png?v=7":isTulip?"tulipan-regiones.png?v=2":"rosa-sin-fondo-regiones.png"} name={isSunflower?"Girasol":isCapybara?"Capibara con nieve":isCat?"Gato en la librería":isTulip?"Tulipán rosa":"Rosa"} isSunflower={isSunflower} hideNumbers={signed}/>{signed&&<div className="artwork-signature" aria-label={`Firmado por ${artist}`}><Signature name={artist}/></div>}</div><div className="palette" aria-label="Selector de colores"><PaletteColors>{colors.map((color,i)=>regions.some(r=>r.n===i+1)&&<button key={color} className="swatch" aria-label={`Color ${i+1}${available.includes(i+1) ? "" : ", completado"}`} disabled={replaying||!available.includes(i+1)} aria-pressed={activeColor===i+1} onClick={()=>setSelected(i+1)}><span style={{background:color,color:color==='#191919'?'#fff':undefined}}>{i+1}</span></button>)}</PaletteColors><div className="palette-tools"><button className="tool" aria-label="Deshacer última acción" title="Deshacer" disabled={replaying||!history.length} onClick={undo}>↶</button><button className="tool" aria-label="Borrador" title="Borrador" disabled={replaying} aria-pressed={activeColor===null} onClick={()=>setSelected(null)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 14 8-8a2 2 0 0 1 3 0l4 4a2 2 0 0 1 0 3l-6 6H8l-4-4a1 1 0 0 1 0-1Zm4 5h12M9 9l7 7"/></svg></button></div></div></section><div className="stage-progress"><div className="progress-label"><span>{replaying?'Reproduciendo tu proceso':'Tu progreso'}</span><span>{shownPercent}%</span></div><div className="progress"><span style={{width:`${shownPercent}%`}}/></div><div className="message" aria-live="polite">{replaying?(replayIndex===-1?'¡Terminaste! Tu obra está lista ✨':'Así cobró vida tu ilustración'):available.length===0?'¡Terminaste! Completaste todos los colores.':celebration!==null?`¡Completaste el color ${celebration}!`:''}{replaying&&<button className="skip-replay" disabled={closing} onClick={()=>setGame(current=>({...current,closing:true}))}>Saltar animación</button>}</div>{signed&&<button className="download-artwork" type="button" onClick={download}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-4-4 4 4 4-4M4 17v3h16v-3"/></svg>Descargar ilustración</button>}{downloadError&&<p className="download-error" role="alert">No se pudo descargar la ilustración. Inténtalo de nuevo.</p>}</div></div></div></main></>;
}
type Drawing = 'sunflower' | 'rose' | 'capybara' | 'cat' | 'tulip';
const drawings: {id: Drawing; name: string; image: string}[] = [
 {id:'sunflower',name:'Girasol',image:'girasol-simplificado.png'},
 {id:'rose',name:'Rosa roja',image:'rosa-sin-fondo.png'},
 {id:'capybara',name:'Capibara con nieve',image:'capibara.png'},
 {id:'cat',name:'Gato en la librería',image:'gato.png'},
 {id:'tulip',name:'Tulipán rosa',image:'tulipan.png'},
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
 return <><header><div className="brand"><img className="brand-icon" src={`${import.meta.env.BASE_URL}colora-logo.png`} alt=""/><span className="brand-name">Colora<span>.</span></span></div><div className="tag">Un pequeño espacio para crear</div></header><div className="app-layout"><nav className="drawing-rail" aria-label="Elegir ilustración"><h2>Ilustraciones</h2><div className="drawing-list">{drawings.map(item=><button key={item.id} className="drawing-option" aria-pressed={drawing===item.id} onClick={()=>setDrawing(item.id)}><img src={`${import.meta.env.BASE_URL}${item.image}`} alt=""/><span>{item.name}</span></button>)}</div></nav><div className="game-view"><div hidden={drawing!=='sunflower'}><Game type="sunflower" active={drawing==='sunflower'} artist={artist} onEditArtist={()=>setEditingArtist(true)}/></div><div hidden={drawing!=='rose'}><Game type="rose" active={drawing==='rose'} artist={artist} onEditArtist={()=>setEditingArtist(true)}/></div><div hidden={drawing!=='capybara'}><Game type="capybara" active={drawing==='capybara'} artist={artist} onEditArtist={()=>setEditingArtist(true)}/></div><div hidden={drawing!=='cat'}><Game type="cat" active={drawing==='cat'} artist={artist} onEditArtist={()=>setEditingArtist(true)}/></div><div hidden={drawing!=='tulip'}><Game type="tulip" active={drawing==='tulip'} artist={artist} onEditArtist={()=>setEditingArtist(true)}/></div></div>{(!artist||editingArtist)&&<ArtistDialog initialName={artist} onConfirm={name=>{setArtist(name);setEditingArtist(false)}} onCancel={artist?()=>setEditingArtist(false):undefined}/>}</div><footer className="site-footer"><span>Creado por Jose Carlos Castillo y ChatGPT con mucho amor</span><svg viewBox="0 0 24 24" role="img" aria-label="corazón"><path d="M12 20.3 4.3 13a5.1 5.1 0 0 1 0-7.3 4.8 4.8 0 0 1 6.9 0l.8.9.8-.9a4.8 4.8 0 0 1 6.9 0 5.1 5.1 0 0 1 0 7.3L12 20.3Z"/></svg></footer></>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);

