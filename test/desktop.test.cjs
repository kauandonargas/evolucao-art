'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const mod = require('../desktop-logic.cjs');
for (const url of ['evolucao://app/','evolucao://app/index.html']) {
  test('allows internal origin ' + url, () => assert.equal(mod.isAppUrl(url), true));
}
for (const url of ['https://app/','file:///C:/Windows','evolucao://evil/index.html','evolucao://app/secret','javascript:alert(1)','evolucao://app/index.html?x=1','']) {
  test('rejects internal origin ' + url, () => assert.equal(mod.isAppUrl(url), false));
}
for (const url of ['https://github.com/','http://localhost/']) {
  test('allows external link ' + url, () => assert.equal(mod.isExternalUrlAllowed(url), true));
}
for (const url of ['file:///tmp/a','javascript:alert(1)','data:text/html,hi','mailto:person@example.com','evolucao://app/']) {
  test('rejects external link ' + url, () => assert.equal(mod.isExternalUrlAllowed(url), false));
}
test('checks packaged apps without forcing a restart', async () => {
  const calls=[]; let checkCount=0;
  const updater={on:(k,cb)=>calls.push(k),checkForUpdates:async()=>{checkCount++;}};
  let timer,loop;
  const ctl=mod.makeUpdaterController({updater,app:{isPackaged:true},
    setTimer:(fn,delay)=>{timer={fn,delay};},
    setRepeating:(fn,delay)=>{loop={fn,delay};},logger:()=>{}});
  ctl.start();
  assert.equal(updater.autoDownload,true);
  assert.equal(updater.autoInstallOnAppQuit,true);
  assert.equal(timer.delay,15000);
  assert.equal(loop.delay,4*60*60*1000);
  await ctl.check();
  assert.equal(checkCount,1);
  assert.ok(calls.includes('update-downloaded'));
  assert.equal(typeof updater.quitAndInstall,'undefined');
});
test('does not check updates in development mode', async () => {
 let invoked=false;
 const updater={on:()=>{},checkForUpdates:async()=>{invoked=true;}};
 const ctl=mod.makeUpdaterController({updater,app:{isPackaged:false},
 setTimer:()=>{throw Error('Timer should not run');},setRepeating:()=>{throw Error('Loop should not run');},logger:()=>{}});
 ctl.start();
 assert.equal(await ctl.check(),false);
 assert.equal(invoked,false);
});
test('renderer includes working application and compiles', () => {
 const html=fs.readFileSync(path.join(__dirname,'../renderer/index.html'),'utf8');
 assert.ok(html.includes('Treinar agora'));
 assert.ok(html.includes('Estudo de mestres'));
 assert.ok(html.includes('Focos'));
 const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(m=>m[1]);
 assert.ok(scripts.length>0);
 for(const s of scripts) new vm.Script(s);
});
test('electron settings preserve profile and security', () => {
 const m=fs.readFileSync(path.join(__dirname,'../main.cjs'),'utf8');
 assert.ok(m.includes("app.setPath('userData'"));
 assert.ok(m.includes('nodeIntegration: false'));
 assert.ok(m.includes('contextIsolation: true'));
 assert.ok(m.includes('sandbox: true'));
});
