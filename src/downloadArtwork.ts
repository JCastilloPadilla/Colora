import {makeSignature} from './signature-paths';

/** Compone la obra a resolución original, independiente de la animación en pantalla. */
export async function downloadArtwork(source:HTMLCanvasElement, artist:string, title:string){
 let illustration:HTMLCanvasElement | undefined;
 source.dispatchEvent(new CustomEvent('colora-export',{detail:{receive:(canvas:HTMLCanvasElement)=>{illustration=canvas}}}));
 if(!illustration)throw new Error('La ilustración todavía no está lista');
 const artwork:HTMLCanvasElement=illustration;
 const frame=14, margin=22, signatureSpace=88;
 const canvas=document.createElement('canvas');canvas.width=artwork.width+2*(frame+margin);canvas.height=artwork.height+2*(frame+margin)+signatureSpace;
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('No se pudo preparar la imagen');
 ctx.fillStyle='#795b46';ctx.fillRect(0,0,canvas.width,canvas.height);
 ctx.fillStyle='#cfbda7';ctx.fillRect(frame-2,frame-2,canvas.width-2*frame+4,canvas.height-2*frame+4);
 ctx.fillStyle='#f7f4eb';ctx.fillRect(frame,frame,canvas.width-2*frame,canvas.height-2*frame);
 const x=frame+margin,y=frame+margin;
 ctx.drawImage(artwork,x,y);
 ctx.strokeStyle='#cfc8b9';ctx.lineWidth=2;ctx.strokeRect(x,y,artwork.width,artwork.height);
 const signature=makeSignature(artist);
 ctx.save();ctx.strokeStyle='#34483a';ctx.fillStyle='#34483a';ctx.lineCap='round';ctx.lineJoin='round';
 if(signature){
  const scale=Math.min(2,artwork.width*.65/(signature.width+6));
  const right=canvas.width-frame-margin-12;
  ctx.translate(right-(signature.width+6)*scale, y+artwork.height+24);
  ctx.transform(1,0,Math.tan(8*Math.PI/180),1,0,0);ctx.scale(scale,scale);ctx.lineWidth=1.1;
  for(const stroke of signature.strokes){ctx.save();ctx.translate(stroke.x,0);ctx.stroke(new Path2D(stroke.d));ctx.restore()}
 }else{
  await document.fonts.ready;ctx.font='54px Allura, cursive';ctx.textAlign='right';ctx.textBaseline='middle';ctx.fillText(artist,canvas.width-frame-margin-12,y+artwork.height+signatureSpace/2+5,artwork.width*.7);
 }
 ctx.restore();
 const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('No se pudo crear la imagen')),'image/png'));
 const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;
 const slug=title.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 link.download=`colora-${slug||'ilustracion'}.png`;document.body.appendChild(link);link.click();link.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
}
