# API Endpoints

Base URL: `http://localhost:5000/api`

## POST /login
Demo login.

Request:
```json
{"username":"admin","password":"admin"}
```

## POST /upload
Uploads document using `multipart/form-data` field name `file`.

Response includes:
- document metadata
- total chunks
- chunk preview

## POST /ask
Asks question from uploaded document chunks.

Request:
```json
{"question":"What is the leave policy?"}
```

Response includes:
- answer
- sources
- retrieved chunks
- RAG search tokens

## GET /documents
Lists uploaded documents.

## GET /chunks
Lists stored chunks.

## GET /chats
Lists chat history.

## GET /stats
Returns dashboard counts.

## GET /graph
Returns simple graph data.

## DELETE /reset
Clears local JSON data.
