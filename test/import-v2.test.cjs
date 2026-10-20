'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../renderer/index.html'),'utf8');
const head=html.indexOf('/* BEGIN EA_IMPORT_CORE_v1'),end=html.indexOf('/* END EA_IMPORT_CORE_v1 */',head)+'/* END EA_IMPORT_CORE_v1 */'.length;
const M=vm.runInNewContext(html.slice(head,end)+';EvolucaoImport',{URL,Date});
const doc={schema:'evolucao-art.import/v3',packageId:'uniform-demo',name:'Práticas universais',
foundations:[{key:'luz',name:'Luz',complexity:1,focusKeys:['luz-sombra']}],
focuses:[{key:'luz-sombra',title:'Separar luz e sombra',concept:'Duas famílias',microSkill:'Observe os grupos'}],
exercises:[{key:'formas',title:'Luz nas formas',area:'painting',foundationKey:'luz',focusKeys:['luz-sombra'],difficulty:'medium',instructions:'Exercício repetível',sourceNotes:'PRTP original: 3+6, somente como referência histórica.'}]};
const empty=()=>({foundations:[],focuses:[],exercises:{drawing:[],painting:[]},exerciseSessions:[],notes:[{id:'preserve'}]});
test('v3 rejects exercise-specific completion modes',()=>{
 assert.equal(M.validate(JSON.stringify(doc)).schema,'evolucao-art.import/v3');
 const bad=structuredClone(doc);bad.exercises[0].progressMode='prtp';
 assert.throws(()=>M.validate(JSON.stringify(bad)),/v3 não aceita/);
});
test('v3 creates reusable exercises without quotas or fake ratings',()=>{
 let n=0;const plan=M.plan(JSON.stringify(doc),empty());assert.equal(plan.errors.length,0);
 const next=M.apply(plan,empty(),k=>k+(++n));const ex=next.exercises.painting[0];
 assert.equal(ex.refTarget,0);assert.equal(ex.noRefTarget,0);assert.equal(ex.progressMode,undefined);assert.equal(ex.entries.length,0);assert.equal(ex.ratings.length,0);
 assert.ok(ex.sourceNotes.includes('PRTP original'));assert.equal(ex.focusIds[0],next.focuses[0].id);assert.equal(next.notes[0].id,'preserve');
 next.focuses[0].history.push({rating:2,at:4});ex.ratings.push({rating:4,at:5});
 const again=M.plan(JSON.stringify(doc),next);assert.equal(again.counts.existing,3);
 const twice=M.apply(again,next,k=>k+(++n));assert.equal(twice.focuses[0].history.length,1);assert.equal(twice.exercises.painting[0].ratings.length,1);
});
test('legacy v2 quotas are archived as notes without becoming practice rules',()=>{
 const old=structuredClone(doc);old.schema='evolucao-art.import/v2';old.exercises[0].progressMode='sheets';old.exercises[0].sheetTarget=20;old.exercises[0].sheetDone=10;
 let n=0;const next=M.apply(M.plan(JSON.stringify(old),empty()),empty(),k=>k+(++n)),ex=next.exercises.painting[0];
 assert.ok(ex.sourceNotes.includes('20 folhas'));assert.ok(ex.sourceNotes.includes('10 informadas'));
 assert.equal(ex.sheetTarget,undefined);assert.equal(ex.sheetDone,undefined);assert.equal(ex.refTarget,0);
});
test('uniform practice uses session ratings, not historical targets',()=>{
 const source=html.slice(html.indexOf('/* BEGIN EA_UNIFIED_PRACTICE_v3'),html.indexOf('/* END EA_UNIFIED_PRACTICE_v3 */')+'/* END EA_UNIFIED_PRACTICE_v3 */'.length);
 assert.ok(source.includes('done:sessions>0'));assert.ok(source.includes('refTarget:0,noRefTarget:0'));assert.ok(!html.includes('/* BEGIN EA_IMPORT_PROGRESS_v2'));
});
