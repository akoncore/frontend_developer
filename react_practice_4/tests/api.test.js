import {test} from 'node:test';
import assert from 'node:assert/strict';
import {demoApi as api} from '../src/api/demoApi.js';
import {API_CONFIG} from '../src/api/settings.js';
const storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)};
API_CONFIG.minDelay=1;API_CONFIG.maxDelay=3;API_CONFIG.errorChance=0;
test('120 summaries, separate details, CRUD and persistence',async()=>{
 const list=await api.pets();assert.equal(list.length,120);assert.equal('allergies' in list[0],false);assert.ok('allergies' in await api.pet(list[0].id));
 const pet=await api.addPet({name:'Test pet',species:'dog',weight_kg:5});
 await Promise.all([api.updatePet(pet.id,{notes:'Saved note'}),api.updatePet(pet.id,{care_status:'Checkup complete'})]);
 const loaded=await api.pet(pet.id);assert.equal(loaded.notes,'Saved note');assert.equal(loaded.care_status,'Checkup complete');assert.equal((await api.pets()).length,121);
 await api.removePet(pet.id);await assert.rejects(api.pet(pet.id),/not found/);assert.equal((await api.pets()).length,120);
});
test('abort and simulated errors never commit writes',async()=>{
 const initial=(await api.pets()).length;const c=new AbortController();const work=api.addPet({name:'Cancelled'},c.signal);c.abort();await assert.rejects(work,{name:'AbortError'});assert.equal((await api.pets()).length,initial);
 API_CONFIG.errorChance=1;await assert.rejects(api.addPet({name:'Failed'}),/Simulated server/);API_CONFIG.errorChance=0;assert.equal((await api.pets()).length,initial);
});
