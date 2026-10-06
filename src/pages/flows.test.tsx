// @vitest-environment jsdom
import { beforeEach, afterEach, expect, it } from 'vitest';
import { cleanup, render, screen, fireEvent, within } from '@testing-library/react';
import MapBag from './map-my-bag';
import MinBag from './min-bag';
import Compare from './compare';
import { latestCompletedBagMap, loadBagDraft, createBagMap, completeBagMap } from '../lib/map-my-bag';

beforeEach(()=>localStorage.clear());
afterEach(cleanup);

it('maps carry and signed offline, keeps unmapped equipment, and saves the bag',()=>{
 render(<MapBag/>);
 fireEvent.click(screen.getByRole('button',{name:'Starta ny Mappa din bag'}));
 fireEvent.click(screen.getByRole('button',{name:/Mappa slaglängder/}));
 fireEvent.click(within(screen.getByRole('listbox',{name:'Carry'})).getByRole('option',{name:'120 m'}));
 fireEvent.click(within(screen.getByRole('listbox',{name:'Sidled'})).getByRole('option',{name:'5 m'}));
 fireEvent.click(screen.getByRole('button',{name:'Vänster'}));
 fireEvent.click(screen.getByRole('button',{name:'Registrera slag'}));
 expect(loadBagDraft()?.clubs[0].shots[0]).toMatchObject({carry:120,offline:-5});
 for(let i=0;i<4;i++)fireEvent.click(screen.getByRole('button',{name:'Registrera slag'}));
 fireEvent.click(screen.getByRole('button',{name:/Färdigställ med/}));
 expect(latestCompletedBagMap()?.clubs).toHaveLength(14);
 expect(latestCompletedBagMap()?.clubs[0].shots).toHaveLength(5);
 expect(screen.getByRole('heading',{name:'Din bag är sparad'})).toBeTruthy();
});

it('edits WITB without overwriting carry and reloads saved equipment',()=>{
 const bag=createBagMap(['Driver','Putter']);
 bag.clubs[0].shots=[{carry:250,accepted:true,createdAt:new Date().toISOString()}];
 completeBagMap(bag);render(<MinBag/>);
 fireEvent.click(screen.getAllByRole('button',{name:/Lägg till utrustning/})[0]);
 fireEvent.change(screen.getByPlaceholderText('Titleist'),{target:{value:'Titleist'}});
 fireEvent.change(screen.getByPlaceholderText('GT3 / T150 / SM10'),{target:{value:'Scotty Cameron'}});
 fireEvent.click(screen.getByRole('button',{name:'Spara Putter'}));
 expect(latestCompletedBagMap()?.clubs.find(c=>c.label==='Putter')?.brand).toBe('Titleist');
 expect(latestCompletedBagMap()?.clubs[0].shots[0].carry).toBe(250);
 cleanup();render(<MinBag/>);expect(screen.getByText('Titleist Scotty Cameron')).toBeTruthy();
});

it('shows carry comparisons and clearly labels benchmark estimates',()=>{
 const bag=createBagMap(['Driver','Putter']);bag.clubs[0].shots=[{carry:250,accepted:true,createdAt:new Date().toISOString()}];completeBagMap(bag);
 render(<Compare/>);fireEvent.click(screen.getByRole('button',{name:'HCP 10'}));
 expect(screen.getByText('250 m')).toBeTruthy();expect(screen.getByText('220 m')).toBeTruthy();
 expect(screen.getByText(/Illustrativa referensvärden/)).toBeTruthy();
});
