# BizKnow AI - RAG Working Explanation

## What is RAG?
RAG means Retrieval Augmented Generation.

It works in two parts:
1. Retrieval: find the most relevant text from uploaded documents.
2. Generation: send that text to Groq to create a clear answer.

## Complete Flow

```text
User uploads PDF/DOCX/TXT
        ↓
Backend saves file locally
        ↓
Text extraction using pdf-parse/mammoth
        ↓
Document text is split into chunks
        ↓
Chunks are saved in local JSON file
        ↓
User asks a question
        ↓
Backend searches best matching chunks
        ↓
Relevant chunks are sent to Groq
        ↓
Groq generates final answer
        ↓
Frontend shows answer + source citations
```

## No Database Design
This project does not use Firebase, MongoDB, MySQL, or PostgreSQL.

Instead it stores data in JSON files:

```text
backend/data/processed/documents.json
backend/data/processed/chunks.json
backend/data/processed/chats.json
```

## Chunking Example
Original text:

```text
Employees can apply for leave through the HR portal. Leave approval takes 2 working days.
```

Chunk:

```text
Chunk 0: Employees can apply for leave through the HR portal. Leave approval takes 2 working days.
```

## Search Example
Question:

```text
What is the leave policy?
```

Backend extracts keywords:

```text
leave, policy
```

Best chunk found:

```text
Employees can apply for leave through the HR portal...
```

## Final Answer

```text
Employees can apply for leave through the HR portal. Approval takes 2 working days.
Source: Sample_Company_Policy.pdf, chunk 1
```

## Why This is Hackathon Ready
- Works without database setup
- Easy demo
- Source citations are visible
- RAG steps are visible in the UI
- Local fallback works even if Groq quota is over
