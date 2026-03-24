from flask import Flask, request, jsonify, render_template
import os

from helpers.pdf_loader import load_pdf
from helpers.text_splitter import split_text
from helpers.embeddings import get_embeddings

from services.gemini_service import get_llm
from services.rag_pipeline import get_rag_chain

from langchain_pinecone import PineconeVectorStore
from config import INDEX_NAME

app = Flask(__name__)

ALLOWED_ORIGINS = {
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
}

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize
embeddings = get_embeddings()
llm = get_llm()
rag_chain, vectorstore = get_rag_chain(llm)


@app.after_request
def add_cors_headers(response):
    origin = request.headers.get("Origin")
    if origin in ALLOWED_ORIGINS:
        response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Vary"] = "Origin"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    return response


@app.route("/")
def home():
    return render_template("chat.html")


# 📄 Upload PDF → store in Pinecone
@app.route("/upload", methods=["POST", "OPTIONS"])
def upload_pdf():
    if request.method == "OPTIONS":
        return ("", 204)

    file = request.files["file"]

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    docs = load_pdf(file_path)
    chunks = split_text(docs)

    PineconeVectorStore.from_documents(
        documents=chunks,
        embedding=embeddings,
        index_name=INDEX_NAME
    )

    return jsonify({"message": "PDF uploaded & indexed successfully"})


# 💬 Ask question
@app.route("/ask", methods=["POST", "OPTIONS"])
def ask():
    if request.method == "OPTIONS":
        return ("", 204)

    data = request.json
    query = data.get("question")

    response = rag_chain.invoke({"input": query})

    return jsonify({
        "question": query,
        "answer": response["answer"]
    })


# 🔹 Old chat UI support
@app.route("/get", methods=["POST"])
def chat():
    msg = request.form["msg"]

    response = rag_chain.invoke({"input": msg})

    return str(response["answer"])


if __name__ == "__main__":
    app.run(debug=True, port=8080)