import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { paintRegion, progress, availableColors, type Painted } from '../game';
import './style.css';

const colors = ['#e4ad79','#e97d68','#f1cb85','#a9bd8d','#759c80','#7eacaa','#c7a8ba','#b77f89'];
type Region = { id: string; n: number; d: string; x: number; y: number };
const point = (r: number, a: number) => [250 + r * Math.cos(a), 250 + r * Math.sin(a)];
const fmt = (p: number[]) => p.map(x => x.toFixed(2)).join(' ');
function createRegions(): Region[] {
 const result: Region[] = [];
 const rings = [{inner:169,outer:230,count:16,offset:0},{inner:113,outer:175,count:16,offset:Math.PI/16},{inner:58,outer:121,count:12,offset:0}];
 rings.forEach((ring, ri) => { for(let i=0;i<ring.count;i++) {
   const a=ring.offset+i*2*Math.PI/ring.count,b=ring.offset+(i+1)*2*Math.PI/ring.count,m=(a+b)/2;
   const p1=point(ring.inner,a),p2=point(ring.outer,m),p3=point(ring.inner,b),c1=point(ring.outer,a),c2=point(ring.outer,b),[x,y]=point((ring.inner+ring.outer)*.51,m);
   result.push({id:`${ri}-${i}`, n:(i+ri*2)%8+1,x,y,d:`M ${fmt(p1)} Q ${fmt(c1)} ${fmt(p2)} Q ${fmt(c2)} ${fmt(p3)} A ${ring.inner} ${ring.inner} 0 0 0 ${fmt(p1)} Z`});
 }});
 for(let i=0;i<8;i++){const a=i*Math.PI/4,b=(i+1)*Math.PI/4,m=(a+b)/2,p=point(60,a),q=point(60,b),[x,y]=point(39,m);result.push({id:`center-${i}`,n:i+1,x,y,d:`M 250 250 L ${fmt(p)} A 60 60 0 0 1 ${fmt(q)} Z`})}
 return result;
}
const regions = createRegions();
function App(){
 const [selected,setSelected]=useState(1); const [painted,setPainted]=useState<Painted>({}); const [message,setMessage]=useState('');
 const percent=progress(painted,regions.length); const available=availableColors(regions,painted);
 function paint(region:Region){if(painted[region.id]) return; if(selected!==region.n){setMessage(`Esta pieza lleva el color ${region.n}.`);return} const next=paintRegion(painted,region.id,region.n,selected); setPainted(next); const remaining=availableColors(regions,next); if(!remaining.includes(selected) && remaining.length) setSelected(remaining[0]); setMessage('')}
 return <><header><div className="brand">pausa<span>.</span></div><div className="tag">Un pequeño espacio para crear</div></header><main><div className="intro"><div><h1>Un momento de color</h1><p>Elige un color y descubre la ilustración, pieza por pieza.</p></div><div className="counter">{Object.keys(painted).length} de {regions.length} piezas coloreadas</div></div><div className="workspace"><section className="canvas" aria-label="Ilustración para colorear"><svg viewBox="0 0 500 500" role="group" aria-label="Mandala floral con regiones numeradas">{regions.map(r=><g key={r.id}><path d={r.d} className={`region ${painted[r.id]?'done':''}`} style={painted[r.id]?{fill:colors[r.n-1]}:undefined} role="button" tabIndex={0} aria-label={`Pieza ${r.n}, ${painted[r.id]?'coloreada':'sin colorear'}`} onClick={()=>paint(r)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();paint(r)}}}/><text x={r.x} y={r.y} className="number">{r.n}</text></g>)}<circle cx="250" cy="250" r="14" fill="#f9faf6" stroke="#89958a" strokeWidth="1.2" pointerEvents="none"/></svg><div className="palette" aria-label="Selector de colores">{colors.map((color,i)=><button key={color} className="swatch" aria-label={`Color ${i+1}${available.includes(i+1)?"":" completado"}`} disabled={!available.includes(i+1)} aria-pressed={selected===i+1 && available.includes(i+1)} onClick={()=>{setSelected(i+1);setMessage('')}}><span style={{background:color}}>{i+1}</span></button>)}</div></section><aside className="side"><h2>Tu paleta</h2><p>Selecciona un color y toca las piezas con el mismo número.</p><div className="hint"><strong>Cómo jugar</strong>Busca el número en la ilustración y rellena sus piezas. Puedes cambiar de color cuando quieras.</div><div className="message" aria-live="polite">{percent===100?'¡Terminaste! Tu mandala está lleno de color.':message}</div><div className="bottom"><div className="progress-label"><span>Tu progreso</span><span>{percent}%</span></div><div className="progress"><span style={{width:`${percent}%`}}/></div><button className="reset" onClick={()=>{setPainted({});setSelected(1);setMessage('')}}>Empezar de nuevo</button></div></aside></div><p className="foot">Una pieza a la vez. No hay prisa.</p></main></>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);

