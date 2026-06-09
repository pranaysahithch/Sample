function chunkText(text, options = {}) {
  const maxWords = options.maxWords || 110;
  const overlapWords = options.overlapWords || 25;
  const words = text.split(/\s+/).filter(Boolean);
  const chunks = [];
  let index = 0;
  for (let start = 0; start < words.length; start += (maxWords - overlapWords)) {
    const part = words.slice(start, start + maxWords).join(' ');
    if (part.trim().length > 20) {
      chunks.push({ chunkIndex: index++, text: part, wordStart: start, wordEnd: Math.min(start + maxWords, words.length) });
    }
    if (start + maxWords >= words.length) break;
  }
  return chunks;
}
module.exports = { chunkText };
