
import json
import requests
from pymongo import MongoClient
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import tiktoken

# === Load Data from MongoDB ===
def load_parsed_data_from_mongo(mongo_uri, db_name, collection_name):
    client = MongoClient(mongo_uri)
    collection = client[db_name][collection_name]
    documents = list(collection.find({"processed": True}))
    parsed_data = [doc.get("parsed_data") for doc in documents if doc.get("parsed_data")]
    return parsed_data

# === Build FAISS Index ===
def index_resumes_with_faiss(parsed_data, model_name="all-MiniLM-L6-v2"):
    model = SentenceTransformer(model_name)
    texts = []
    ids = []

    for idx, resume in enumerate(parsed_data):
        resume_str = json.dumps(resume, indent=2)
        texts.append(resume_str)
        ids.append(idx)

    embeddings = model.encode(texts, convert_to_numpy=True)
    index = faiss.IndexFlatL2(embeddings.shape[1])
    index.add(embeddings)
    return index, texts, model

# === Retrieve Chunks from FAISS ===
def retrieve_top_k_chunks(query, model, index, texts, k=4):
    query_embedding = model.encode([query], convert_to_numpy=True)
    distances, indices = index.search(query_embedding, k)
    return [texts[i] for i in indices[0]]

# === Build LLM Prompt ===
def build_prompt(chunks, user_query):
    return f"""You are a resume analysis assistant. Use the following candidate data to answer the question.

Candidate Data:
{chunks}

Question: {user_query}
Answer:"""

# === Call LLaMA 3 via Groq API ===
def query_llama(prompt, endpoint_url, api_key):
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "llama3-70b-8192",
        "messages": [
            {"role": "system", "content": "You are a helpful assistant that understands JSON resume data."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2
    }

    response = requests.post(endpoint_url, headers=headers, json=payload)
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"]

# === Detect Global Queries ===
def is_global_query(query):
    keywords = ["how many", "total", "count", "list all", "summary", "give me all"]
    return any(k in query.lower() for k in keywords)

# === Hybrid Chatbot Loop ===
def hybrid_chat(parsed_data, faiss_index, texts, model, endpoint_url, api_key):
    print("🤖 Ask your resume-related questions (type 'exit' to quit).")

    while True:
        user_query = input("\nYou: ")
        if user_query.lower() in ["exit", "quit"]:
            break

        if is_global_query(user_query):
            if "how many" in user_query.lower() and "candidates" in user_query.lower():
                print(f"\nAssistant: There are {len(parsed_data)} candidates in the database.")
                continue

            elif "list all" in user_query.lower() and "names" in user_query.lower():
                names = [res.get("name", "Unknown") for res in parsed_data]
                print(f"\nAssistant: Candidate Names:\n" + "\n".join(names))
                continue

            elif "summary" in user_query.lower():
                limited_data = "\n\n".join([json.dumps(r, indent=2) for r in parsed_data[:5]])
                prompt = build_prompt(limited_data, user_query)
                try:
                    response = query_llama(prompt, endpoint_url, api_key)
                    print(f"\nAssistant: {response}")
                except Exception as e:
                    print(f"❌ Error: {str(e)}")
                continue

        # Fallback to RAG
        top_chunks = retrieve_top_k_chunks(user_query, model, faiss_index, texts, k=4)
        prompt = build_prompt("\n\n".join(top_chunks), user_query)
        try:
            response = query_llama(prompt, endpoint_url, api_key)
            print(f"\nAssistant: {response}")
        except Exception as e:
            print(f"❌ Error: {str(e)}")

# === Main Entry ===
if __name__ == "__main__":
    mongo_uri = "mongodb+srv://parimala:Parimala@cluster0.nigrjnx.mongodb.net/resume_db?retryWrites=true&w=majority&appName=Cluster0"
    db_name = "resume_db"
    collection_name = "resumes"
    endpoint_url = "https://api.groq.com/openai/v1/chat/completions"
    api_key = "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"  # replace if rotating

    print("📥 Loading resumes from MongoDB...")
    parsed_data = load_parsed_data_from_mongo(mongo_uri, db_name, collection_name)

    print("🔍 Building FAISS index...")
    faiss_index, texts, model = index_resumes_with_faiss(parsed_data)

    hybrid_chat(parsed_data, faiss_index, texts, model, endpoint_url, api_key)
