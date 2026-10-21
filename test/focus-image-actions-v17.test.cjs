'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../renderer/index.html'),'utf8');
test('scripts remain valid with image actions patch',()=>{
 const a=html.indexOf('<script>'),b=html.indexOf('</script>',a);assert.ok(a>=0&&b>a);new vm.Script(html.slice(a+8,b));
});
test('image actions include delete, undo, positioning, alignment and resizing',()=>{
 for(const marker of ['BEGIN EA_IMAGE_ACTIONS_v17','v17UndoImage','data-v17-image="up"','data-v17-image="down"','data-v17-image="smaller"','data-v17-image="larger"','data-v15-delete','data-v17-image="center"','v15Pct'])assert.ok(html.includes(marker),marker);
});
test('retain existing free editor, title editing and focus histories',()=>{
 for(const marker of ['BEGIN EA_FOCUS_CANVAS_v15','BEGIN EA_EDIT_ANYWHERE_v16','EA.v14SavePage=async function','f.pageBlocks=blocks','EA.v15Drop=function','EA.v15Paste=function'])assert.ok(html.includes(marker),marker);
});
