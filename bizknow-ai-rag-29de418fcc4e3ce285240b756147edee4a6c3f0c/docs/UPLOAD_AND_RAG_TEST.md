# Upload + RAG Test

## 1. Start Backend
```bash
cd backend
npm install
npm run dev
```

Backend should show:
```text
BizKnow AI backend running on http://localhost:5000
```

## 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

Open:
```text
http://localhost:5173
```

## 3. Login
```text
username: admin
password: admin
```

## 4. Upload Sample PDF
Go to **Upload Docs** and upload:
```text
sample-docs/Sample_Company_Policy.pdf
```

After upload you should see:
```text
RAG Processing Completed
Characters extracted: 1793
Chunks created: 3
```

## 5. Ask RAG Question
Go to **Ask AI** and ask:
```text
What is the leave policy?
```

Expected retrieved chunk:
```text
Employees can apply for casual leave, sick leave, or earned leave through the HR portal.
Leave requests must be submitted at least two working days before the planned leave date.
Emergency sick leave can be submitted on the same day with valid reason.
Managers review leave requests within two working days.
```

## 6. Important
Even if Groq quota fails, local RAG fallback will still show retrieved document content and source citation.
