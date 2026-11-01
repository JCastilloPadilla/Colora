// Trazos de Hershey Script 1-stroke; datos de Hershey Text de dominio público.
import rawGlyphs from './signature-glyphs.json';
type Glyph={width:number;d:string};
const glyphs:Record<string,Glyph>=rawGlyphs;
const marks:Record<string,string>={
 '\u0301':'M3,4 L7,0', '\u0300':'M3,0 L7,4', '\u0302':'M2,4 L5,1 L8,4',
 '\u0303':'M1,3 Q3,0 5,2 Q7,4 9,1', '\u0308':'M2,2 L2.2,2 M8,2 L8.2,2',
 '\u0327':'M5,24 Q3,29 7,28'
};
export type SignatureStroke={d:string;x:number;step:number};
export function makeSignature(name:string):{strokes:SignatureStroke[];width:number;steps:number}|null{
 const strokes:SignatureStroke[]=[];let x=2,step=0;
 for(const original of name){
  if(original===' '){x+=9;continue}
  const parts=Array.from(original.normalize('NFD'));const glyph=glyphs[parts[0]];
  if(!glyph || parts.slice(1).some(mark=>!marks[mark]))return null;
  if(glyph.d)strokes.push({d:glyph.d,x,step:step++});
  for(const mark of parts.slice(1))strokes.push({d:marks[mark],x:x+Math.max(0,glyph.width*.28),step:step++});
  x+=glyph.width*1.68;
 }
 return {strokes,width:Math.max(x+8,20),steps:step};
}
