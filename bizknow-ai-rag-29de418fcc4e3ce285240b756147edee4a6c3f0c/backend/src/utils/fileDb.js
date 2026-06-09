const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../../data');
const processedDir = path.join(dataDir, 'processed');
const files = {
  documents: path.join(processedDir, 'documents.json'),
  chunks: path.join(processedDir, 'chunks.json'),
  chats: path.join(processedDir, 'chats.json')
};

function ensureDb() {
  if (!fs.existsSync(processedDir)) fs.mkdirSync(processedDir, { recursive: true });
  for (const f of Object.values(files)) if (!fs.existsSync(f)) fs.writeFileSync(f, '[]');
}
function readJson(key) { ensureDb(); return JSON.parse(fs.readFileSync(files[key], 'utf-8') || '[]'); }
function writeJson(key, data) { ensureDb(); fs.writeFileSync(files[key], JSON.stringify(data, null, 2)); }
function addItem(key, item) { const arr = readJson(key); arr.push(item); writeJson(key, arr); return item; }
function resetAll() { ensureDb(); Object.keys(files).forEach(k => writeJson(k, [])); }

module.exports = { ensureDb, readJson, writeJson, addItem, resetAll, dataDir, processedDir };
