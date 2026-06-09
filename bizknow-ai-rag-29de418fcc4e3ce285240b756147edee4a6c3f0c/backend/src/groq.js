const Groq = require("groq-sdk");
require("dotenv").config();

const groqApiKey = process.env.GROQ_API_KEY;
const groq = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;

const supportedLanguages = {
  en: 'English',
  hi: 'Hindi',
  te: 'Telugu',
  ta: 'Tamil',
  ml: 'Malayalam',
  kn: 'Kannada',
  english: 'English',
  hindi: 'Hindi',
  telugu: 'Telugu',
  tamil: 'Tamil',
  malayalam: 'Malayalam',
  kannada: 'Kannada',
};

function normalizeLanguage(language) {
  if (!language) return null;
  const key = language.toString().trim().toLowerCase();
  return supportedLanguages[key] || Object.values(supportedLanguages).find(l => l.toLowerCase() === key) || null;
}

async function askGroq(question, context) {
  if (!groq) {
    throw new Error("GROQ_API_KEY is not configured. Set GROQ_API_KEY in backend/.env.");
  }

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content:
          "You are BizKnow AI. Answer only using the given document context. Give clear answer with source citation.",
      },
      {
        role: "user",
        content: `
Question:
${question}

Document Context:
${context}
        `,
      },
    ],
  });

  return completion.choices[0].message.content;
}

async function translateText(text, language) {
  if (!groq) {
    throw new Error("GROQ_API_KEY is not configured. Set GROQ_API_KEY in backend/.env.");
  }

  const normalized = normalizeLanguage(language);
  if (!normalized) {
    throw new Error(`Unsupported translation language: ${language}`);
  }

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    temperature: 0.1,
    max_tokens: 1600,
    messages: [
      {
        role: "system",
        content:
          "You are a translation assistant. Translate the provided text exactly into the requested language without adding notes or explanations.",
      },
      {
        role: "user",
        content: `Translate the following text into ${normalized}:

${text}`,
      },
    ],
  });

  return completion.choices?.[0]?.message?.content?.trim() || '';
}

module.exports = { askGroq, translateText };
