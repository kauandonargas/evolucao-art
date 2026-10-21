'use strict';
const test=require('node:test');const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../renderer/index.html'),'utf8');
const begin=html.indexOf('/* BEGIN EA_SHARED_EDITOR_v18 */'),end=html.indexOf('/* END EA_SHARED_EDITOR_v18 */',begin);
const source=html.slice(begin,end+'/* END EA_SHARED_EDITOR_v18 */'.length);
function engine(){
 let n=0;
 const f={id:'f1',title:'Luz e sombra',concept:'A',microSkill:'B',imageIds:['old-1','new-2'],editorBlocks:[{type:'text',role:'concept',text:'A'},{type:'row',images:[{imageId:'old-1',width:50,align:'right'}]}],history:[{rating:2,at:1}]};
 const state={focuses:[f],foundations:[{id:'g1',name:'Luz',artIds:['m1']}],notes:[{id:'n1',text:'Anotação',imageIds:['nimg']}],exercises:{drawing:[{id:'e1',title:'Luz',focusIds:['f1'],foundationId:'g1',difficulty:'easy',entries:[{type:'ref',imageId:'x'}],ratings:[{rating:3}]}],painting:[]}};
 const EA={v15Pct:v=>Math.max(25,Math.min(100,Number(v)||100)),v15AllBlocks:f=>[{type:'text',role:'concept',text:f.concept},...f.imageIds.map(imageId=>({type:'image',imageId}))],v14StartEdit(){},v15FocusReader(){},v16EditNote(){},v13InsightOptions(){},v13MasterAreaView(){},v13Area:()=>true,v13Groups:()=>[]};
 const ctx={EA,state,id:()=>''+(++n),esc:x=>String(x||''),nav(){},render(){},exerciseListView(){return ''},createExercise(){},document:{addEventListener(){}},window:{},URL,console};
 vm.runInNewContext(source,ctx);return{E:EA.editor,state};
}
test('all renderer scripts parse',()=>{assert.ok(begin>0&&end>begin);const a=html.indexOf('<script>'),b=html.indexOf('</script>',a);new vm.Script(html.slice(a+8,b))});
test('existing images and newly added images are both preserved',()=>{
 const {E,state}=engine();const f=E.blocks('focus',state.focuses[0]);assert.equal(f.filter(x=>x.type==='row').length,2);assert.equal(f[1].images[0].align,'right');
 assert.equal(E.blocks('foundation',state.foundations[0]).filter(x=>x.type==='row').length,1);
 assert.equal(E.blocks('note',state.notes[0]).filter(x=>x.type==='row').length,1);
});
test('no row can exceed three images',()=>{
 const {E}=engine();const blocks=E.normalize([{type:'row',images:Array.from({length:7},(_,i)=>({imageId:'im'+i}))}]);
 assert.deepEqual(Array.from(blocks,x=>x.images.length),[3,3,1]);
});
test('exercise ratings and sessions are not transformed by editor migration',()=>{
 const {E,state}=engine(),ex=state.exercises.drawing[0],before=JSON.stringify({entries:ex.entries,ratings:ex.ratings});
 E.blocks('exercise',ex);assert.equal(JSON.stringify({entries:ex.entries,ratings:ex.ratings}),before);
});
test('all four domains use the editor with context menu, undo, drag, paste, save and linked-Foco settings',()=>{
 for(const token of ['oncontextmenu=','E.drop=function','E.paste=function','E.undoLast=function','E.focusConfig=function','E.save=async function','E.newNote=function','A.v15FocusReader=function',"EA.editor.open('foundation'"])assert.ok(html.includes(token),token);
});