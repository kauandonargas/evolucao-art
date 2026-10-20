'use strict';
const test=require('node:test'), assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../renderer/index.html'),'utf8');
const script=html.match(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/i)?.[1];
test('full renderer compiles with the contextual interface',()=>{assert.ok(script);new vm.Script(script)});
test('onboarding remains first-use only and settings is a separate page',()=>{
 for(const key of ["EA.openSettings=function(){nav('eaSettings')}","EA.settingsView=function()","EA.openIntro();","route.page==='eaSettings'"])assert.ok(html.includes(key),key);
});
test('home and training are replaced, not covered by an additional panel',()=>{
 const js=script.slice(script.indexOf('/* BEGIN EA_CONTEXTUAL_UI_v4'));
 assert.ok(js.includes('homeView=function()'));
 assert.ok(js.includes('trainingView=function()'));
 assert.ok(js.includes('ea-ui4-start'));
 const section=js.slice(js.indexOf('trainingView=function(){'),js.indexOf('EA.exerciseMediaTabs={};'));
 assert.ok(!section.includes('Rotina recomendada')&&!section.includes('Importar sistema de estudos'));
});
test('guided flow reuses real exercise workspace and one completion action',()=>{
 for(const x of ["eaUi4PriorExercise(kind,exid)","EA.chooseExerciseMedia=function(mode)","EA.showRating=function(kind,exid)","EA.finishExercise(","ea-ui4-finish-wrap"])assert.ok(html.includes(x),x);
 assert.ok(html.includes("stage.querySelectorAll('.guided-bar,.ea-foundation-tags,.exercise-status,.exercise-focus-map')"));
});
test('advanced options are present only behind interaction',()=>{
 for(const x of ['<summary>Mais opções</summary>','<summary>Estudo de Mestres sugerido</summary>','<select class="ea-setting-select"','EA.importPage=function()'])assert.ok(html.includes(x));
});
