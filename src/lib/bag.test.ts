import { describe, expect, it, beforeEach } from 'vitest';
import { createBagMap, medianCarry, bagHcp, addClubToBag, saveBagDraft, loadBagDraft, completeBagMap, latestCompletedBagMap, loadBagHistory } from './map-my-bag';
import { parseSharedBag } from './transfer';

const data=new Map<string,string>();
Object.defineProperty(globalThis,'window',{value:globalThis,configurable:true});
Object.defineProperty(globalThis,'localStorage',{value:{getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>data.set(k,v),removeItem:(k:string)=>data.delete(k)},configurable:true});
beforeEach(()=>data.clear());
describe('extracted bag data',()=>{
 it('retains partial maps and all equipment when completed',()=>{
  const bag=createBagMap(['Driver','7i','Putter']);
  bag.clubs[0].shots=[{carry:230,offline:-5,accepted:true,createdAt:new Date().toISOString()}];
  bag.clubs[0].shaft='Ventus';saveBagDraft(bag);
  expect(loadBagDraft()?.clubs[0].shots[0].offline).toBe(-5);
  completeBagMap(bag);expect(loadBagDraft()).toBeNull();
  expect(latestCompletedBagMap()?.clubs).toHaveLength(3);
  expect(latestCompletedBagMap()?.clubs[0].shaft).toBe('Ventus');
 });
 it('calculates finite index for five mapped clubs and ignores misses in median',()=>{
  const bag=createBagMap(['5i','6i','7i','8i','9i','Putter']);
  bag.clubs.slice(0,5).forEach((c,i)=>{c.shots=Array.from({length:5},()=>({carry:180-i*12,accepted:true,createdAt:new Date().toISOString()}));});
  expect(Number.isFinite(bagHcp(bag))).toBe(true);
  bag.clubs[0].shots.push({carry:0,accepted:false,createdAt:new Date().toISOString()});
  expect(medianCarry(bag.clubs[0])).toBe(180);
 });
 it('enforces fourteen clubs and reserves putter',()=>{
  const bag=createBagMap();expect(bag.clubs).toHaveLength(14);
  expect(addClubToBag(bag,'2i').clubs).toHaveLength(14);
 });
 it('validates imports without mutating current data',()=>{
  const bag=completeBagMap(createBagMap());
  const shared=parseSharedBag(JSON.stringify({version:1,name:'Anna',bag}));
  expect(shared.name).toBe('Anna');expect(shared.bag.id).not.toBe(bag.id);expect(loadBagHistory()).toHaveLength(1);
  expect(()=>parseSharedBag('{"version":1,"bag":{"clubs":[]}}')).toThrow();
  bag.clubs[0].shots=[{carry:-1,accepted:true,createdAt:'bad'}];
  expect(()=>parseSharedBag(JSON.stringify({version:1,bag}))).toThrow();
 });
});
