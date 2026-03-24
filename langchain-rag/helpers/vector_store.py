from pinecone import Pinecone
from langchain_pinecone import PineconeVectorStore
from config import PINECONE_API_KEY, PINECONE_INDEX_NAME


# 🔹 Initialize Pinecone (NEW METHOD)
def init_pinecone(embeddings):
    pc = Pinecone(api_key=PINECONE_API_KEY)

    index = pc.Index(PINECONE_INDEX_NAME)

    vectorstore = PineconeVectorStore(
        index=index,
        embedding=embeddings
    )

    return vectorstore


# 🔹 Store Documents in Pinecone
def store_documents(docs, embeddings):
    pc = Pinecone(api_key=PINECONE_API_KEY)

    index = pc.Index(PINECONE_INDEX_NAME)

    vectorstore = PineconeVectorStore(
        index=index,
        embedding=embeddings
    )

    vectorstore.add_documents(docs)