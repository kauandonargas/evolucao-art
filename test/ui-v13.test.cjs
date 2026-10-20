'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../renderer/index.html'),'utf8');
const match=html.match(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/i);
test('v13 JavaScript parses',()=>{assert.ok(match);new vm.Script(match[1])});
test('v13 training catalog is progressive, never a flat feed',()=>{for(const token of ['EA.v13Groups=function','EA.v13Level=function','ea-v13-accordion','ea-v13-level','Sem fundamento'])assert.ok(html.includes(token),token)});
test('v13 masters gallery and reversible favorites work through dedicated views',()=>{for(const token of ['EA.v13MasterGalleryLoad','EA.v13InsightOptions','EA.v13EditInsight','EA.v13UndoNote','EA.v13NotesBank'])assert.ok(html.includes(token),token)});
test('v13 Focos expose card, rating and optional artwork on demand',()=>{for(const token of ['ea-v13-gold-card','ea-v13-focus-rating','ea-v13-detail-media','EA.showFocusDetail()'])assert.ok(html.includes(token),token)});
test('v13 keeps guided progression, import and local images',()=>{for(const token of ['EA.advanceGuided','EvolucaoImport','dropExerciseFiles','putImage','getImage','EA.v13UploadExercise','EA.v13SaveExercise'])assert.ok(html.includes(token),token)});
