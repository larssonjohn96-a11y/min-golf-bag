import { useState } from 'react';
import { BagComparison } from '../components/bag-comparison';
import { latestCompletedBagMap } from '../lib/map-my-bag';
import { comparisonProfile, parseSharedBag, type SharedBag } from '../lib/transfer';

export default function Compare(){
  const [friend,setFriend]=useState<SharedBag|null>(null);
  const [error,setError]=useState('');
  const left=comparisonProfile(latestCompletedBagMap());
  return <main className="mx-auto min-h-screen max-w-md px-5 pb-32 pt-8">
    <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-primary">Min Golfbag</p><h1 className="mt-2 text-3xl">Jämför din bag</h1>
    <p className="mt-3 mb-6 text-sm text-muted-foreground">Se slaglängder och utrustning sida vid sida.</p>
    {!left?<a href="/map-my-bag" className="mb-4 block rounded-2xl bg-primary p-4 text-center font-bold text-primary-foreground">Skapa min golfbag</a>:null}
    <BagComparison left={left} leftName="Du" friendName={friend?.name||'Kompis'} friendBag={comparisonProfile(friend?.bag??null)} initialTarget="friend"/>
    <section className="mt-6 rounded-2xl border border-border bg-card p-5"><h2 className="text-lg">Jämför med en kompis</h2><p className="mt-2 text-sm text-muted-foreground">Be kompisen exportera sin bag under Dela & spara. Välj filen här. Din egen bag ändras inte.</p><label className="mt-4 block text-sm font-semibold">Välj kompisens bagfil<input aria-label="Kompisens bagfil" type="file" accept=".json,application/json" className="mt-2 block w-full text-xs file:mr-3 file:rounded-xl file:border-0 file:bg-primary file:px-3 file:py-3 file:font-bold file:text-primary-foreground" onChange={async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>2_000_000)throw new Error('Filen är för stor.');setFriend(parseSharedBag(await file.text()));setError('');}catch(err){setError(err instanceof Error?err.message:'Kunde inte läsa filen.');}e.target.value='';}}/></label>{error&&<p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}{friend&&<p role="status" className="mt-3 text-sm text-primary">{friend.name}: {friend.bag.clubs.length} klubbor inlästa.</p>}</section>
  </main>;
}
