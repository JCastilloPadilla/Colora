import {useEffect, useRef, useState} from 'react';
import {numberOpacity, type Painted} from '../game';
type Region = {id: string; n: number; x: number; y: number};

type Props = {painted: Painted; colors: string[]; celebration: number | null; onPaint: (id: string) => void; regions: Region[]; artSrc: string; mapSrc: string; name: string; isSunflower: boolean; hideNumbers: boolean};
type Assets = {art: HTMLImageElement; ids: Uint16Array; width: number; height: number};
function loadImage(src: string): Promise<HTMLImageElement> {
 return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('No se pudo cargar la ilustración'));image.src=src});
}
export default function SunflowerCanvas({painted,colors,celebration,onPaint,regions,artSrc,mapSrc,name,isSunflower,hideNumbers}:Props){
 const canvas=useRef<HTMLCanvasElement>(null);
 const [assets,setAssets]=useState<Assets | null>(null);
 const [error,setError]=useState(false);
 const crop=artSrc==='gato.png'?21:0;
 useEffect(()=>{let cancelled=false;Promise.all([loadImage(`${import.meta.env.BASE_URL}${artSrc}`),loadImage(`${import.meta.env.BASE_URL}${mapSrc}`)]).then(([art,map])=>{
  const scratch=document.createElement('canvas');scratch.width=map.width;scratch.height=map.height;const ctx=scratch.getContext('2d');if(!ctx)throw Error('Canvas no disponible');if(crop)ctx.drawImage(map,crop,crop,map.width-2*crop,map.height-2*crop,0,0,map.width,map.height);else ctx.drawImage(map,0,0);const pixels=ctx.getImageData(0,0,map.width,map.height).data;const ids=new Uint16Array(map.width*map.height);for(let i=0;i<ids.length;i++)ids[i]=pixels[i*4]*256+pixels[i*4+1];if(!cancelled)setAssets({art,ids,width:map.width,height:map.height});
 }).catch(()=>{if(!cancelled)setError(true)});return()=>{cancelled=true}},[]);
 useEffect(()=>{
  if(!assets||!canvas.current)return;const ctx=canvas.current.getContext('2d');if(!ctx)return;
  const {width,height,ids,art}=assets;const rgb=colors.map(hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)));let frame=0;const start=performance.now();const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;const animate=celebration!==null&&!reducedMotion;
  function draw(now:number){
   if(!ctx)return;const elapsed=now-start;const flash=animate&&elapsed<900?Math.sin(Math.PI*elapsed/900)*.32:0;
   const data=ctx.createImageData(width,height);for(let i=0;i<ids.length;i++){const id=ids[i];const color=painted[String(id)];const p=i*4;if(color){const c=rgb[color-1];const glow=celebration===regions[id-1]?.n?flash:0;data.data[p]=c[0]+(255-c[0])*glow;data.data[p+1]=c[1]+(255-c[1])*glow;data.data[p+2]=c[2]+(255-c[2])*glow}else{const background = 255;data.data[p]=background;data.data[p+1]=background;data.data[p+2]=background}data.data[p+3]=255}
   ctx.putImageData(data,0,0);ctx.globalCompositeOperation='multiply';if(crop)ctx.drawImage(art,crop,crop,width-2*crop,height-2*crop,0,0,width,height);else ctx.drawImage(art,0,0,width,height);ctx.globalCompositeOperation='source-over';if(crop){
    // Detalles decorativos abiertos: no dividen piezas ni agregan números diminutos.
    ctx.save();ctx.scale(width/(width-2*crop),height/(height-2*crop));ctx.translate(-crop,-crop);
    ctx.strokeStyle='#302923';ctx.lineWidth=3;ctx.lineCap='round';
    for(const x of [1028,1075,1122]){ctx.beginPath();ctx.moveTo(x,868);ctx.quadraticCurveTo(x+8,876,x+16,868);ctx.stroke()}
    ctx.restore();
   }if(isSunflower){ctx.strokeStyle='#202020';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(320,158);ctx.lineTo(337,158);ctx.stroke()};ctx.fillStyle='#1d1d1d';ctx.font='24px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.globalAlpha=numberOpacity(hideNumbers,elapsed,reducedMotion);for(const region of regions){ctx.fillStyle=painted[region.id] && colors[painted[region.id]-1]==='#191919'?'#fff':'#1d1d1d';ctx.fillText(String(region.n),(region.x-crop)*width/(width-2*crop),(region.y-crop)*height/(height-2*crop))}ctx.globalAlpha=1;
   if((animate&&elapsed<900)||(hideNumbers&&!reducedMotion&&elapsed<1300))frame=requestAnimationFrame(draw);
  }
  frame=requestAnimationFrame(draw);return()=>cancelAnimationFrame(frame);
 },[assets,painted,colors,celebration,regions,isSunflower,name,hideNumbers]);
 function handleClick(e:React.MouseEvent<HTMLCanvasElement>){if(!assets||!canvas.current)return;const rect=canvas.current.getBoundingClientRect();const x=Math.floor((e.clientX-rect.left)/rect.width*assets.width),y=Math.floor((e.clientY-rect.top)/rect.height*assets.height);if(x<0||y<0||x>=assets.width||y>=assets.height)return;const id=assets.ids[y*assets.width+x];if(id)onPaint(String(id));}
 if(error)return <p>No se pudo cargar la ilustración. Recarga la página para intentarlo de nuevo.</p>;
 return <><canvas ref={canvas} className="sunflower" width={1254} height={1254} onClick={handleClick} aria-label={`${name} para colorear`} role="img"/><div className="accessible-regions" aria-label="Piezas de la ilustración">{regions.map(r=><button key={r.id} onClick={()=>onPaint(r.id)} aria-label={`Pieza ${r.id}, color indicado ${r.n}, ${painted[r.id]?'coloreada':'sin colorear'}`}/>)}</div></>;
}
