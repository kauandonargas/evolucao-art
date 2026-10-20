'use strict';
const APP_SCHEME = 'evolucao';
const APP_HOST = 'app';
const APP_URL = APP_SCHEME + '://' + APP_HOST + '/index.html';
const UPDATE_INTERVAL_MS = 4 * 60 * 60 * 1000;
const INITIAL_UPDATE_DELAY_MS = 15 * 1000;
function isAppUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === APP_SCHEME + ':' && u.hostname === APP_HOST &&
      (u.pathname === '/' || u.pathname === '/index.html') && !u.search && !u.hash;
  } catch { return false; }
}
function isExternalUrlAllowed(value) {
  try {
    const u = new URL(value);
    return (u.protocol === 'https:' || u.protocol === 'http:') && Boolean(u.hostname);
  } catch { return false; }
}
function makeUpdaterController({ updater, app, setTimer, setRepeating, logger }) {
  let running = false;
  const check = async () => {
    if (!app.isPackaged || running) return false;
    running = true;
    try { await updater.checkForUpdates(); return true; }
    catch (error) { logger('Atualização indisponível: ' + String(error?.message || error)); return false; }
    finally { running = false; }
  };
  const start = () => {
    if (!app.isPackaged) return;
    updater.autoDownload = true;
    updater.autoInstallOnAppQuit = true;
    updater.allowPrerelease = false;
    updater.on('error', e => logger('Falha no atualizador: ' + String(e?.message || e)));
    updater.on('update-downloaded', info => logger('Atualização ' + info.version + ' pronta para instalar ao sair.'));
    setTimer(() => { void check(); }, INITIAL_UPDATE_DELAY_MS);
    setRepeating(() => { void check(); }, UPDATE_INTERVAL_MS);
  };
  return { check, start };
}
module.exports = { APP_SCHEME, APP_HOST, APP_URL, UPDATE_INTERVAL_MS, INITIAL_UPDATE_DELAY_MS, isAppUrl, isExternalUrlAllowed, makeUpdaterController };
