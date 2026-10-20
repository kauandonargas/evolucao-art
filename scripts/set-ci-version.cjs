'use strict';
const fs = require('node:fs');
const path = require('node:path');
const run = Number(process.env.GITHUB_RUN_NUMBER);
if (!Number.isSafeInteger(run) || run <= 0) {
  console.error('GITHUB_RUN_NUMBER inválido.');
  process.exit(1);
}
const file = path.resolve(__dirname, '../package.json');
const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
pkg.version = '0.1.' + run;
fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + '\n');
console.log('Versão desta publicação: ' + pkg.version);
