from langchain_community.document_loaders import PyPDFLoader
from langchain.schema import Document

def load_pdf(file_path):
    loader = PyPDFLoader(file_path)
    docs = loader.load()

    minimal_docs = []
    for doc in docs:
        minimal_docs.append(
            Document(
                page_content=doc.page_content,
                metadata={"source": file_path}
            )
        )
    return minimal_docs