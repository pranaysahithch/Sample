require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ensureDb, readJson, writeJson, addItem, dataDir } = require('./utils/fileDb');
const { extractText } = require('./services/textExtractor');
const { chunkText } = require('./services/chunker');
const { retrieve, tokens } = require('./services/ragSearch');
const { askGroq, translateText } = require('./groq');

ensureDb();
const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const uploadDir = path.join(dataDir, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`)
});
const allowedExt = new Set(['.pdf', '.docx', '.txt', '.md']);
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExt.has(ext)) return cb(new Error('Only PDF, DOCX, TXT, and MD files are supported.'));
    cb(null, true);
  }
});

app.get('/api/health', (_, res) => res.json({ ok: true, app: 'BizKnow AI Backend' }));

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin') return res.json({ ok: true, role: 'admin', name: 'Admin' });
  if (username === 'user' && password === 'user') return res.json({ ok: true, role: 'user', name: 'User' });
  res.status(401).json({ ok: false, message: 'Use admin/admin or user/user for demo login.' });
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const text = await extractText(req.file.path, req.file.originalname);
    const docId = `doc_${Date.now()}`;
    const chunks = chunkText(text).map(ch => ({
      id: `${docId}_chunk_${ch.chunkIndex}`,
      docId,
      fileName: req.file.originalname,
      ...ch
    }));
    const doc = { id: docId, fileName: req.file.originalname, savedName: req.file.filename, uploadedAt: new Date().toISOString(), totalChars: text.length, totalChunks: chunks.length };
    addItem('documents', doc);
    writeJson('chunks', [...readJson('chunks'), ...chunks]);
    res.json({ ok: true, document: doc, chunksPreview: chunks.slice(0, 5), message: 'Document uploaded, text extracted, and chunks created.' });
  } catch (err) { res.status(500).json({ ok: false, message: err.message }); }
});

app.post('/api/ask', async (req, res) => {
  try {
    const { question, originalQuestion } = req.body;
    const requestedQuestion = question || originalQuestion;
    if (!requestedQuestion) return res.status(400).json({ message: 'Question is required' });
    const allChunks = readJson('chunks');
    if (allChunks.length === 0) {
      return res.json({
        ok: true,
        id: `chat_${Date.now()}`,
        question: originalQuestion || question,
        answer: 'No document chunks found. Please go to Upload Docs, upload the sample PDF or your own PDF/DOCX/TXT, and then ask again.',
        sources: [],
        topChunks: [],
        createdAt: new Date().toISOString(),
        ragSteps: { questionTokens: tokens(requestedQuestion), retrievedChunks: 0, chunks: [] },
        originalQuestion: originalQuestion || question,
      });
    }
    const topChunks = retrieve(requestedQuestion, allChunks, 4);
    const bestContext = topChunks.map((c, i) => `Context ${i+1} from ${c.fileName} / Chunk ${c.chunkIndex}:\n${c.text}`).join('\n\n---\n\n');
    const sources = [...new Set(topChunks.map(c => `${c.fileName} (chunk ${c.chunkIndex})`))];
    let aiAnswer;
    try {
      aiAnswer = await askGroq(requestedQuestion, bestContext);
    } catch (err) {
      const fallbackText = bestContext ? bestContext.slice(0, 1800) : 'No document chunks available yet.';
      aiAnswer = `Groq AI is unavailable: ${err.message}\n\nAnswer from retrieved document content:\n${fallbackText}\n\nSources: ${sources.join(', ') || 'No source found'}`;
    }
    const chat = { id: `chat_${Date.now()}`, question: originalQuestion || question, answer: aiAnswer, sources, topChunks, createdAt: new Date().toISOString() };
    addItem('chats', chat);
    res.json({
      ok: true,
      answer: aiAnswer,
      sources,
      question: originalQuestion || question,
      originalQuestion: originalQuestion || question,
      ragSteps: {
        questionTokens: tokens(requestedQuestion),
        retrievedChunks: topChunks.length,
        chunks: topChunks.map((c, i) => ({ 
          id: `${c.fileName}_${c.chunkIndex}`,
          fileName: c.fileName, 
          chunkIndex: c.chunkIndex, 
          text: c.text,
          score: c.score || 0
        }))
      }
    });
  } catch (err) { res.status(500).json({ ok: false, message: err.message }); }
});

app.post('/api/translate', async (req, res) => {
  try {
    const { text, language } = req.body;
    if (!text) return res.status(400).json({ ok: false, message: 'Text is required for translation.' });
    if (!language) return res.status(400).json({ ok: false, message: 'Language is required for translation.' });
    const translated = await translateText(text, language);
    res.json({ ok: true, text: translated, language });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

app.get('/api/documents', (_, res) => res.json(readJson('documents')));
app.get('/api/chunks', (_, res) => res.json(readJson('chunks')));
app.get('/api/chats', (_, res) => res.json(readJson('chats')));
app.get('/api/stats', (_, res) => {
  const documents = readJson('documents'), chunks = readJson('chunks'), chats = readJson('chats');
  res.json({ documents: documents.length, chunks: chunks.length, chats: chats.length, storage: 'Local JSON files, no database' });
});
app.get('/api/graph', (_, res) => {
  const docs = readJson('documents');
  const chunks = readJson('chunks');
  
  // Create app node
  const nodes = [{ id: 'BizKnow AI', type: 'app' }];
  
  // Add document nodes with chunk count
  docs.forEach(d => {
    const docChunks = chunks.filter(c => c.docId === d.id);
    nodes.push({
      id: d.fileName,
      type: 'document',
      data: {
        fileName: d.fileName,
        chunkCount: docChunks.length,
        uploadDate: d.uploadDate || 'N/A'
      }
    });
  });

  // Create edges from BizKnow AI to documents
  const edges = docs.map(d => {
    const docChunks = chunks.filter(c => c.docId === d.id);
    return {
      source: 'BizKnow AI',
      target: d.fileName,
      label: `${docChunks.length} chunks`,
      type: 'document'
    };
  });

  // Add chunk visualization for first 2 documents (to avoid clutter)
  docs.slice(0, 2).forEach((d, idx) => {
    const docChunks = chunks.filter(c => c.docId === d.id).slice(0, 3);
    docChunks.forEach((ch, chIdx) => {
      const chunkId = `chunk-${d.id}-${ch.index}`;
      nodes.push({
        id: chunkId,
        type: 'chunk',
        data: {
          index: ch.index,
          preview: ch.text.substring(0, 50) + '...'
        }
      });
      edges.push({
        source: d.fileName,
        target: chunkId,
        label: `chunk ${ch.index}`,
        type: 'chunk'
      });
    });
  });

  res.json({ nodes, edges });
});
app.delete('/api/reset', (_, res) => { writeJson('documents', []); writeJson('chunks', []); writeJson('chats', []); res.json({ ok: true }); });

app.use((err, req, res, next) => {
  res.status(500).json({ ok: false, message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
const groqStatus = process.env.GROQ_API_KEY ? 'configured' : 'NOT CONFIGURED';
console.log(`Groq API key is ${groqStatus}.`);
app.listen(PORT, () => console.log(`BizKnow AI backend running on http://localhost:${PORT}`));
