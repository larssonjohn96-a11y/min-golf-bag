import { type BagMap, type BagClub, medianCarry, bagMappedCount } from './map-my-bag';
import type { ComparisonBagProfile } from '../components/bag-comparison';

export type SharedBag = { version: 1; name: string; bag: BagMap };
const specs = ['brand','model','loft','shaft','flex','length','lie','grip'] as const;
function record(value: unknown): value is Record<string, unknown> { return !!value && typeof value==='object' && !Array.isArray(value); }
function validDate(value: unknown): value is string { return typeof value==='string' && Number.isFinite(Date.parse(value)); }

/** Reconstruct whitelisted fields. Imported data never writes until explicitly saved. */
export function parseSharedBag(text: string): SharedBag {
  if(text.length>2_000_000) throw new Error('Filen är för stor (max 2 MB).');
  const data: unknown=JSON.parse(text);
  if(!record(data)||data.version!==1||!record(data.bag)) throw new Error('Filen måste vara exporterad från Min Golfbag (version 1).');
  const source=data.bag;
  if(!Array.isArray(source.clubs)||source.clubs.length<1||source.clubs.length>14) throw new Error('En bag måste innehålla 1–14 klubbor.');
  const clubs:BagClub[]=source.clubs.map((c:unknown,index:number)=>{
    if(!record(c)||typeof c.label!=='string'||!c.label.trim()||c.label.length>40||!Array.isArray(c.shots)||c.shots.length>5000) throw new Error('Ogiltig klubbdata.');
    const shots=c.shots.map((s:unknown)=>{
      if(!record(s)||typeof s.carry!=='number'||!Number.isFinite(s.carry)||s.carry<0||s.carry>500||typeof s.accepted!=='boolean'||(s.accepted&&s.carry===0)||!validDate(s.createdAt)) throw new Error('Filen innehåller ett ogiltigt slag.');
      if(s.offline!==undefined&&(typeof s.offline!=='number'||!Number.isFinite(s.offline)||Math.abs(s.offline)>500)) throw new Error('Ogiltigt sidledsavstånd.');
      return {carry:s.carry,accepted:s.accepted,createdAt:s.createdAt,...(typeof s.offline==='number'?{offline:s.offline}:{})};
    });
    const meta:Partial<BagClub>={};
    for(const key of specs) if(typeof c[key]==='string') meta[key]=(c[key] as string).slice(0,160);
    return {id:crypto.randomUUID(),label:c.label.trim(),order:index,shots,...meta};
  });
  if(new Set(clubs.map(c=>c.label.toLowerCase())).size!==clubs.length) throw new Error('Filen innehåller dubbla klubbor.');
  const now=new Date().toISOString();
  return {version:1,name:typeof data.name==='string'?data.name.slice(0,60):'Kompis',bag:{id:crypto.randomUUID(),status:'completed',createdAt:validDate(source.createdAt)?source.createdAt:now,updatedAt:now,completedAt:validDate(source.completedAt)?source.completedAt:now,clubs}};
}

export function comparisonProfile(bag:BagMap|null): ComparisonBagProfile|undefined {
  if(!bag) return undefined;
  return {mappedCount:bagMappedCount(bag),clubCount:bag.clubs.length,clubs:bag.clubs.map(c=>{const carry=medianCarry(c);return {...c,...(carry!==null?{carry}:{})};})};
}

export function downloadBag(bag:BagMap,name:string){
  const url=URL.createObjectURL(new Blob([JSON.stringify({version:1,name:name.trim()||'Golfare',bag},null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='min-golfbag.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
