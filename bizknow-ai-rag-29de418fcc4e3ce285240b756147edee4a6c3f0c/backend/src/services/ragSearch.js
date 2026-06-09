const STOP = new Set(['the','is','are','a','an','and','or','of','to','in','for','on','with','from','by','as','at','be','this','that','what','how','can','do','does','it','about','give','tell','me','company','document']);
function tokens(text) {
  return (text || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !STOP.has(w));
}
function scoreChunk(question, chunkText) {
  const q = tokens(question); const c = tokens(chunkText); const cSet = new Set(c);
  let overlap = 0; q.forEach(t => { if (cSet.has(t)) overlap += 3; });
  // partial word match for simple semantic-like matching without embeddings
  q.forEach(t => c.forEach(w => { if (w.includes(t) || t.includes(w)) overlap += 0.35; }));
  return overlap / Math.sqrt((q.length || 1) * (c.length || 1));
}
function retrieve(question, chunks, topK = 4) {
  return chunks.map(ch => ({ ...ch, score: scoreChunk(question, ch.text) }))
    .sort((a,b) => b.score - a.score)
    .slice(0, topK)
    .filter(x => x.score > 0);
}
module.exports = { retrieve, tokens };
