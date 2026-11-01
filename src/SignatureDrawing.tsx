import {makeSignature} from './signature-paths';
export default function Signature({name}:{name:string}){
 const signature=makeSignature(name);
 if(!signature)return <span>{name}</span>;
 const duration=Math.max(.08,Math.min(.45,3.6/Math.max(signature.steps,1)));
 return <svg className="signature-strokes" viewBox={`-3 -5 ${signature.width+6} 44`} role="img" aria-label={`Firma de ${name}`} style={{width:`min(100%, ${Math.max(60,signature.width*1.15)}px)`}}>{signature.strokes.map((stroke,i)=><path key={i} d={stroke.d} transform={`translate(${stroke.x} 0)`} pathLength="1" style={{animationDuration:`${duration}s`,animationDelay:`${.45+stroke.step*duration}s`}}/>)}</svg>;
}
