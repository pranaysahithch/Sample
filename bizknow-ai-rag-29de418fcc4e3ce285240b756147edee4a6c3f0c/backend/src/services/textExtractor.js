const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

async function extractText(filePath, originalName) {
  const ext = path.extname(originalName).toLowerCase();

  if (ext === '.pdf') {
    const text = await extractPdfText(filePath);
    if (!text) throw new Error('PDF uploaded, but no readable text was found. Try a text-based PDF, DOCX, or TXT file. Scanned image PDFs need OCR.');
    return clean(text);
  }

  if (ext === '.docx') {
    const result = await mammoth.extractRawText({ path: filePath });
    const text = clean(result.value || '');
    if (!text) throw new Error('DOCX uploaded, but no readable text was found.');
    return text;
  }

  if (ext === '.txt' || ext === '.md') {
    const text = clean(fs.readFileSync(filePath, 'utf-8'));
    if (!text) throw new Error('TXT/MD file uploaded, but it is empty.');
    return text;
  }

  throw new Error('Unsupported file type. Upload PDF, DOCX, TXT, or MD. For PPT, export as PDF first.');
}

async function extractPdfText(filePath) {
  const pdfModule = require('pdf-parse');

  // New pdf-parse versions expose PDFParse class.
  if (pdfModule.PDFParse) {
    const parser = new pdfModule.PDFParse({ url: filePath });
    try {
      const result = await parser.getText();
      return result.text || '';
    } finally {
      if (parser.destroy) await parser.destroy();
    }
  }

  // Old pdf-parse versions export a function.
  if (typeof pdfModule === 'function') {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfModule(buffer);
    return data.text || '';
  }

  throw new Error('PDF parser package is not compatible. Run: npm install pdf-parse@latest');
}

function clean(text) {
  return text
    .replace(/\r/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

module.exports = { extractText };
