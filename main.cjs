'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { app, BrowserWindow, protocol, shell, session } = require('electron');
const { autoUpdater } = require('electron-updater');
const { APP_SCHEME, APP_URL, isAppUrl, isExternalUrlAllowed, makeUpdaterController } = require('./desktop-logic.cjs');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
protocol.registerSchemesAsPrivileged([{
  scheme: APP_SCHEME,
  privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true }
}]);
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.setName('EvolucaoArt');
  app.setPath('userData', path.join(app.getPath('appData'), 'EvolucaoArt'));
  let mainWindow;
  const logPath = path.join(app.getPath('userData'), 'desktop.log');
  function log(message) {
    try {
      fs.mkdirSync(path.dirname(logPath), { recursive: true });
      fs.appendFileSync(logPath, new Date().toISOString() + ' ' + message + '\n');
    } catch {}
  }
  function openSafeExternal(raw) {
    if (isExternalUrlAllowed(raw)) {
      void shell.openExternal(raw).catch(e => log('Falha ao abrir link: ' + e.message));
    }
  }
  function createWindow() {
    const w = new BrowserWindow({
      title: 'Evolução Art',
      width: 1260, height: 850, minWidth: 740, minHeight: 550,
      backgroundColor: '#0c0d0d',
      show: false,
      autoHideMenuBar: true,
      webPreferences: {
        contextIsolation: true, nodeIntegration: false, sandbox: true,
        webSecurity: true, allowRunningInsecureContent: false, spellcheck: false
      }
    });
    w.webContents.setWindowOpenHandler(({ url }) => {
      openSafeExternal(url); return { action: 'deny' };
    });
    w.webContents.on('will-navigate', (event, url) => {
      if (!isAppUrl(url)) { event.preventDefault(); openSafeExternal(url); }
    });
    w.once('ready-to-show', () => w.show());
    w.loadURL(APP_URL).catch(error => {
      log('Falha ao carregar interface: ' + error.message); w.show();
    });
    w.on('closed', () => { if (mainWindow === w) mainWindow = null; });
    mainWindow = w;
  }
  app.on('second-instance', () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  });
  app.whenReady().then(() => {
    protocol.handle(APP_SCHEME, request => {
      if (!isAppUrl(request.url)) return new Response('Não encontrado', { status: 404 });
      return new Response(fs.readFileSync(path.join(__dirname, 'renderer', 'index.html')), {
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }
      });
    });
    session.defaultSession.setPermissionRequestHandler((_contents,_permission,reply) => reply(false));
    createWindow();
    makeUpdaterController({
      updater: autoUpdater, app, setTimer: setTimeout, setRepeating: setInterval, logger: log
    }).start();
  }).catch(error => log('Falha na inicialização: ' + error.message));
  app.on('window-all-closed', () => app.quit());
}
