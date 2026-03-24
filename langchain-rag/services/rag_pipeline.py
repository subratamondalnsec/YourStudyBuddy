from langchain_pinecone import PineconeVectorStore
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from helpers.embeddings import get_embeddings
from config import INDEX_NAME

system_prompt = (
    "You are an AI Study Companion that teaches students using ONLY the uploaded PDF content.\n\n"

    "Your goal is to explain concepts clearly and simply for beginners.\n\n"

    "IMPORTANT RULES:\n"
    "1. Answer ONLY from the provided context.\n"
    "2. Do NOT add outside knowledge.\n"
    "3. Always refer to the document using phrases like:\n"
    "   'According to the provided document' or 'Based on the given material'.\n"
    "4. Explain in simple language suitable for beginners.\n"
    "5. Keep explanation clear, structured, and slightly detailed (not too long).\n\n"

    "Answer Format:\n"
    "📘 Definition\n"
    "🧠 Explanation (step-by-step)\n"
    "📊 Key Points\n"
    "🌍 Example (ONLY if present in context)\n"
    "🧾 Summary\n\n"

    "If the answer is NOT in the context, say:\n"
    "'I don't know based on the uploaded document.'\n\n"

    "Context:\n{context}"
)


def get_rag_chain(llm):
    embeddings = get_embeddings()

    vectorstore = PineconeVectorStore.from_existing_index(
        index_name=INDEX_NAME,
        embedding=embeddings
    )

    retriever = vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 3}
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{input}")
    ])

    qa_chain = create_stuff_documents_chain(llm, prompt)
    rag_chain = create_retrieval_chain(retriever, qa_chain)

    return rag_chain, vectorstore