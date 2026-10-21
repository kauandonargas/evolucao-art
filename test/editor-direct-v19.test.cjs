'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../renderer/index.html'),'utf8');
const start=html.indexOf('/* BEGIN EA_SHARED_EDITOR_v18 */'),end=html.indexOf('/* END EA_SHARED_EDITOR_v18 */',start);
const source=html.slice(start,end+'/* END EA_SHARED_EDITOR_v18 */'.length);
function prepare(){
 let n=0;const focus={id:'f1',title:'Luz e sombra',concept:'Agrupar valores',microSkill:'Simplificar',history:[{rating:2}],imageIds:[]};
 const EA={v15Pct:v=>Math.max(25,Math.min(100,Number(v)||100)),v15AllBlocks:f=>[{type:'text',text:f.concept}],v14StartEdit(){},v15FocusReader(){},v16EditNote(){},v13InsightOptions(){},v13MasterAreaView(){},v13MasterGalleryLoad:async()=>{},v13Area:()=>true,v13Groups:()=>[]};
 const state={focuses:[focus],foundations:[{id:'g1',name:'Luz',artIds:[]}],notes:[],exercises:{drawing:[],painting:[]}};
 const document={addEventListener(){}};
 vm.runInNewContext(source,{EA,state,id:()=>String(++n),esc:x=>String(x||''),nav(){},render(){},exerciseListView(){return ''},createExercise(){},document,window:{},URL,console});
 return {E:EA.editor,state};
}
test('entire renderer JavaScript parses and uses shared inline editing',()=>{
 const a=html.indexOf('<script>'),b=html.indexOf('</script>',a);assert.ok(a>=0&&b>a);new vm.Script(html.slice(a+8,b));
 for(const text of ['ea-v19-inline','E.galleryPaste=function','E.galleryPending','Artista desta obra','practice.artist','ea-ui4-start'])assert.ok(html.includes(text),text);
});
test('internal image drag moves its identity instead of duplicating',()=>{
 const {E}=prepare();const blocks=E.normalize([{type:'row',images:[{imageId:'a'}]},{type:'row',images:[{imageId:'b'}]}]);
 E.draft={type:'focus',key:'f1',blocks};E.redraw=()=>{};E.toast=()=>{};
 const source=blocks[1],target=blocks[0];E.drag={bid:source.id,pid:source.images[0].id,key:'f1'};
 let blocked=false;
 E.drop({target:{closest:x=>x==='[data-photo]'?{dataset:{photo:target.images[0].id}}:{dataset:{block:target.id}}},dataTransfer:{getData:()=>''},preventDefault:()=>{blocked=true},stopPropagation(){}});
 assert.equal(blocked,true);assert.equal(E.images().length,2);
 assert.equal(new Set(E.images().map(x=>x.imageId)).size,2);assert.equal(E.draft.blocks.filter(x=>x.type==='row').length,1);
 assert.deepEqual(Array.from(E.draft.blocks[0].images,x=>x.imageId),['a','b']);
});
test('legacy exercise histories and focus ratings remain independent',()=>{
 const {E,state}=prepare();state.exercises.drawing.push({id:'e1',title:'Esfera',entries:[{rating:4}],ratings:[{rating:4}],focusIds:['f1'],instructions:'Observe planos'});
 assert.ok(E.blocks('exercise',state.exercises.drawing[0]));assert.equal(state.exercises.drawing[0].entries.length,1);
 assert.equal(state.focuses[0].history[0].rating,2);
});
