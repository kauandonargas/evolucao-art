'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../renderer/index.html'),'utf8');
const start=source.lastIndexOf('/* BEGIN EA_FOCUS_CANVAS_v15'),end=source.indexOf('/* END EA_FOCUS_CANVAS_v15 */',start);
assert.ok(start>=0&&end>start);
const code=source.slice(start,end+'/* END EA_FOCUS_CANVAS_v15 */'.length);
const EA={v14PageBlocks:f=>(f.pageBlocks||[]).map(x=>({...x})),v14StartEdit:()=>{},v14FocusReader:()=>{},v14FocusEditor:()=>{},v14CancelEdit:()=>{},v14FillFocusNewImages:()=>{},v14SavePage:()=>{},v14Draft:null,v14PageEditing:false};
vm.runInNewContext(code,{EA,nav:()=>{},Date,URL,Map,Math,window:{},console});
test('Edição visual, colagem, arrastar e redimensionar',()=>{
 for(const f of ['v15Paste','v15Drop','v15DragStart','v15PointerDown','v15Collect','v15InsertFiles','v15FocusEditor','v14SavePage'])assert.equal(typeof EA[f],'function');
 assert.ok(code.includes('contenteditable="true"'));assert.ok(code.includes("startsWith('image/')"));
});
test('Compatibilidade com páginas antigas',()=>{
 const f={concept:'Conceito',microSkill:'Lembrar',pageBlocks:[{type:'text',text:'Texto'}, {type:'image',imageId:'img_x'}]};
 const blocks=EA.v15AllBlocks(f);assert.equal(blocks[0].role,'concept');assert.equal(blocks[1].role,'microSkill');assert.equal(blocks[3].imageId,'img_x');
 const newer={...f,pageBlocks:[{type:'image',imageId:'img_x',widthPct:63},{type:'text',role:'concept',text:'Novo'},{type:'text',role:'microSkill',text:'Lembrar'}]};
 assert.equal(EA.v15AllBlocks(newer).length,3);
});
test('Largura de imagens validada',()=>{
 assert.equal(EA.v15Pct(0),25);assert.equal(EA.v15Pct(600),100);assert.equal(EA.v15Pct('42'),42);assert.equal(EA.v15Pct('invalid'),100);
});
test('Preserva histórico de avaliações e o restante do aplicativo',()=>{
 assert.ok(source.includes('EA.v13MasterAreaView'));assert.ok(source.includes('function trainingView()'));assert.ok(source.includes('function exerciseView('));
 assert.ok(code.includes('const snapshot={title:f.title'));assert.ok(code.includes('f.pageBlocks=blocks'));assert.ok(code.includes('f.imageIds=blocks.filter'));assert.equal(code.includes('f.history='),false);
});
