# 🧠 AI Doubt-Clearing Chatbot (RAG-based)

An intelligent AI-powered chatbot that allows students to upload study materials (PDFs) and ask questions.  
The system retrieves relevant content from the uploaded documents and generates accurate, beginner-friendly explanations using Gemini AI.

---

# 🚀 Features

- 📄 Upload PDF study material
- 🔍 Semantic search using vector embeddings
- 🧠 Context-aware answers using RAG (Retrieval-Augmented Generation)
- 🤖 Powered by Gemini (Google Generative AI)
- 📚 Beginner-friendly explanations (step-by-step)
- ❌ No hallucination (answers strictly based on PDF)
- ⚡ Fast retrieval using Pinecone vector database

---

# 🏗️ Tech Stack

### Backend
- Python
- Flask

### AI / ML
- LangChain
- HuggingFace Embeddings (`all-MiniLM-L6-v2`)
- Gemini API (`gemini-2.5-flash`)

### Vector Database
- Pinecone

### Document Processing
- PyPDF (via LangChain)

---

# 🧠 How It Works (Architecture)

1. 📄 User uploads PDF  
2. ✂️ Text is split into chunks  
3. 🧬 Each chunk is converted into embeddings  
4. 🗄️ Stored in Pinecone vector DB  
5. ❓ User asks a question  
6. 🔍 Relevant chunks retrieved (semantic search)  
7. 🤖 Gemini generates answer based on context  
8. 📘 Returns structured, simple explanation  

---

# 📁 Project Structure

```
backend/
│
├── app.py
├── config.py
├── requirements.txt
│
├── helpers/
│   ├── pdf_loader.py
│   ├── text_splitter.py
│   ├── embeddings.py
│   └── vector_store.py
│
├── services/
│   ├── rag_pipeline.py
│   └── gemini_model.py
│
├── uploads/
└── templates/
```

---

# ⚙️ Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone <your-repo-link>
cd backend
```

## 2️⃣ Create Virtual Environment

```bash
python -m venv venv
```

**Activate:**

```bash
# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

## 3️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 📦 Requirements

```
flask
python-dotenv
langchain
langchain-community
langchain-huggingface
langchain-pinecone
langchain-google-genai
sentence-transformers
pypdf
pinecone
```

---

## 🔑 Environment Variables

Create a `.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key
PINECONE_API_KEY=your_pinecone_api_key
```

---

## 🗄️ Pinecone Setup

1. Go to [Pinecone Dashboard](https://app.pinecone.io)
2. Create Index:
   - **Name:** `study-ai-index`
   - **Dimension:** `384`
   - **Metric:** `cosine`

---

## ▶️ Run the App

```bash
python app.py
```

Server runs on:

```
http://127.0.0.1:8080
```

---

# 📄 API Endpoints

## 📤 Upload PDF

**Endpoint:**
```
POST /upload
```

**Body (form-data):**

| Key  | Type | Value      |
|------|------|------------|
| file | File | Upload PDF |

**Response:**
```json
{
  "message": "PDF uploaded & indexed successfully"
}
```

---

## ❓ Ask Question

**Endpoint:**
```
POST /ask
```

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "question": "What is Spiral Model?"
}
```

**Response:**
```json
{
  "question": "What is Spiral Model?",
  "answer": "Detailed explanation..."
}
```

---

# 🧠 Prompt Engineering (Core Logic)

The system uses a structured teaching prompt:

- ✅ Beginner-friendly explanation
- ✅ Step-by-step breakdown
- ✅ Based **ONLY** on PDF context
- ✅ No external knowledge

---

# 🔐 Key Concepts Used

### 🔹 RAG (Retrieval-Augmented Generation)

Combines:
- **Retrieval** (Pinecone)
- **Generation** (Gemini)

### 🔹 Embeddings

Text → Vector using:
```
sentence-transformers/all-MiniLM-L6-v2
```

### 🔹 Vector Search

- Semantic similarity search
- Top-k relevant chunks retrieved

---

# ⚠️ Important Notes

- Ensure Pinecone index dimension = `384`
- Always send JSON in `/ask` API
- Do not use deprecated LangChain imports
- Gemini warning can be ignored (non-breaking)

---

# 🚀 Future Improvements

- 🔊 Voice-based AI tutor
- 📊 Progress tracking
- 🧾 Source highlighting (PDF references)
- 📚 Multi-document support
- ⚡ Streaming responses (ChatGPT style)

---

# 🎯 Use Case

This feature can be used in:

- AI Study Companion
- EdTech platforms
- Smart learning systems
- Personalized tutoring apps

---

# 💡 Summary

This project implements a complete AI-powered doubt-solving system using:

- 📄 PDF-based knowledge
- 🔍 Semantic search
- 🤖 Context-aware AI responses

> 👉 Making learning smarter, adaptive, and student-friendly

---

# 👨‍💻 Author

**Susovan Paul**