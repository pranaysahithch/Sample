# Hackathon Submission Content

## Project Title
BizKnow AI - Smart Document Knowledge Assistant

## Category
Open Innovation

## Problem Statement
Organizations store important information in PDFs, SOPs, manuals, policy files, and internal documents. Employees waste time manually searching these files to find answers.

## Proposed Solution
BizKnow AI is a RAG-based chatbot that allows users to upload business documents and ask questions in natural language. The system retrieves the most relevant document chunks and generates accurate answers with source citations.

## Key Features
- Upload PDF, DOCX, TXT, and MD files
- Automatic text extraction
- Document chunking
- RAG-based smart search
- AI answer generation using Groq
- Source citations
- Admin dashboard
- Knowledge graph view
- No database required
- Local JSON storage
- Fallback answer when AI quota is unavailable

## Innovation
The project clearly shows the internal RAG pipeline: document extraction, chunking, retrieval, answer generation, and citation. This makes the solution transparent and easy to demo.

## Tech Stack
Frontend: React + Vite
Backend: Node.js + Express
AI: Groq API
Storage: Local folder + JSON files
Document Parsing: pdf-parse, mammoth

## Architecture
React Frontend -> Node.js Backend -> Document Upload -> Text Extraction -> Chunking -> Local JSON Storage -> RAG Search -> Groq -> Answer + Citation

## Future Scope
- Add vector embeddings
- Add Firebase/Supabase/PostgreSQL storage
- Add role-based enterprise authentication
- Add multi-document comparison
- Add voice assistant
- Add workflow automation
