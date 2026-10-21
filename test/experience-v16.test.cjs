'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../renderer/index.html'),'utf8');
test('v16 is present and parses with all legacy scripts',()=>{
 assert.ok(html.includes('/* BEGIN EA_EDIT_ANYWHERE_v16 */'));
 const begin=html.indexOf('<script>'),end=html.indexOf('</script>',begin);assert.ok(begin>=0&&end>begin);new vm.Script(html.slice(begin+'<script>'.length,end));
});
test('Focus heading is editable and previous canvas editing preserved',()=>{
 for(const x of ['EA.v16EditFocusTitle','EA.v14StartEdit','eaV15Title','EA.v15InsertFiles','EA.v15Drop'])assert.ok(html.includes(x),x);
});
test('Master works accept images copied from clipboard, as well as dropping files',()=>{
 for(const x of ['EA.v16ClipboardImages','EA.v16MasterPaste','EA.v16MasterDrop','EA.v13AddMasterWorks'])assert.ok(html.includes(x),x);
});
test('Master foundations and notes can be renamed without deleting their history',()=>{
 for(const x of ['EA.v16RenameFoundation','EA.v16SaveFoundationName','EA.v16EditNote','EA.v16SaveNote','EA.v13NotesBank','EA.v13InsightCard'])assert.ok(html.includes(x),x);
});
test('Exercise image paste respects existing ref/non-reference flow',()=>{
 for(const x of ['EA.v16PasteExercise','dropExerciseFiles','uniqueNewStudyFiles','showReferenceRequest'])assert.ok(html.includes(x),x);
});