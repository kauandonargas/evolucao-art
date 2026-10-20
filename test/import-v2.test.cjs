'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../renderer/index.html'),'utf8');
const start=html.indexOf('/* BEGIN EA_IMPORT_CORE_v1');
const end=html.indexOf('/* END EA_IMPORT_CORE_v1 */',start)+'/* END EA_IMPORT_CORE_v1 */'.length;
const M=vm.runInNewContext(html.slice(start,end)+';EvolucaoImport',{URL,Date});
const doc={schema:'evolucao-art.import/v2',packageId:'demo-progression',name:'Progresso v2',
 foundations:[{key:'light',name:'Luz',complexity:1,focusKeys:['shadow']}],
 focuses:[{key:'shadow',title:'Luz e sombra',concept:'Separar luz e sombra',microSkill:'Observe as massas'}],
 exercises:[
  {key:'a',title:'Luz gradual',area:'painting',foundationKey:'light',focusKeys:['shadow'],difficulty:'medium',withReference:3,withoutReference:6,progressMode:'prtp'},
  {key:'b',title:'Caixas',area:'drawing',foundationKey:'light',focusKeys:['shadow'],difficulty:'easy',withReference:0,withoutReference:0,progressMode:'sheets',sheetTarget:20,sheetDone:10}
 ]};
const empty=()=>({exercises:{drawing:[],painting:[]},foundations:[],focuses:[],notes:[{id:'keep'}]});
test('v2 validates and preserves history on repeated import',()=>{
 const report=M.plan(JSON.stringify(doc),empty());assert.equal(report.errors.length,0);
 let n=0;const state=M.apply(report,empty(),x=>x+(++n));
 assert.equal(state.exercises.drawing[0].sheetDone,10);assert.equal(state.exercises.painting[0].progressMode,'prtp');
 state.focuses[0].history.push({rating:3,at:100});
 const second=M.plan(JSON.stringify(doc),state);assert.equal(second.counts.existing,4);
 const repeated=M.apply(second,state,x=>x+(++n));assert.equal(repeated.focuses[0].history.length,1);assert.equal(repeated.notes[0].id,'keep');
});
test('v1 compatibility and invalid progression rejection',()=>{
 const a=structuredClone(doc);a.schema='evolucao-art.import/v1';a.exercises=a.exercises.map(({progressMode,sheetTarget,sheetDone,...rest})=>rest);
 assert.equal(M.validate(JSON.stringify(a)).schema,'evolucao-art.import/v1');
 const bad=structuredClone(doc);bad.exercises[1].sheetDone=21;assert.throws(()=>M.validate(JSON.stringify(bad)));
 const bad2=structuredClone(doc);bad2.exercises[0].withoutReference=5;assert.throws(()=>M.validate(JSON.stringify(bad2)));
});
test('progress modes handle alternative PRTP and sheet history',()=>{
 const a=html.indexOf('/* BEGIN EA_IMPORT_PROGRESS_v2'),b=html.indexOf('/* END EA_IMPORT_PROGRESS_v2 */',a)+'/* END EA_IMPORT_PROGRESS_v2 */'.length;
 assert.ok(a>0&&b>a);
 const env={exCounts:()=>({ref:0,noRef:0,done:false,complete:0,total:0}),exerciseView:()=>'',state:{exercises:{}},difficultyChip:()=>'',esc:x=>x};
 vm.runInNewContext(html.slice(a,b)+';this.check=exCounts',env);
 const ex=(r,n)=>({progressMode:'prtp',entries:[...Array(r).fill(0).map(()=>({type:'ref'})),...Array(n).fill(0).map(()=>({type:'noref'}))]});
 assert.equal(env.check(ex(3,6)).done,true);assert.equal(env.check(ex(0,9)).done,true);
 assert.equal(env.check(ex(0,8)).done,false);assert.equal(env.check(ex(3,5)).done,false);
 assert.equal(env.check({progressMode:'sheets',sheetTarget:20,sheetDone:10,entries:[]}).complete,10);
});
