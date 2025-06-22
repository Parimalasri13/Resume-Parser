import os
import random
import json
import time
from typing import Dict, List, Optional
from datetime import datetime

import requests
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import tiktoken
import fitz  # PyMuPDF
import pandas as pd

from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import gridfs
from flask import Response
import threading



# Global variable to store progress messages
progress_messages = []

# Lock for thread-safe access
progress_lock = threading.Lock()

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=[os.getenv("FRONTEND_URL")])

# Configuration
GROQ_API_URL = os.getenv("GROQ_API_URL")
API_KEY = os.getenv("API_KEY")
MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")
COLLECTION_NAME = "resumes"
DB_NAME = "resume_db"

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# MongoDB setup
try:
    client = MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]
    fs = gridfs.GridFS(db)  # For storing PDF files
    resumes_collection = db.resumes  # For storing resume metadata and parsed data
    rankings_collection = db.rankings 
    collection = client[DATABASE_NAME][COLLECTION_NAME] # For storing ranking results
    documents = list(collection.find({"processed": True}))
    parsed_data = [doc.get("parsed_data") for doc in documents if doc.get("parsed_data")]
    print(f"✅ Loaded {len(parsed_data)} processed resumes")
    print("Connected to MongoDB successfully")
    print("🔍 Creating FAISS index...")
    model = SentenceTransformer("all-MiniLM-L6-v2")
    texts = [json.dumps(resume, indent=2) for resume in parsed_data]
    embeddings = model.encode(texts, convert_to_numpy=True)
    faiss_index = faiss.IndexFlatL2(embeddings.shape[1])
    faiss_index.add(embeddings)
    print("✅ FAISS index ready")
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")
    client = None

def retrieve_top_k_chunks(query, model, index, texts, k=4):
    query_embedding = model.encode([query], convert_to_numpy=True)
    distances, indices = index.search(query_embedding, k)
    return [texts[i] for i in indices[0]]

def build_prompt(chunks, user_query):
    return f"""You are a resume analysis assistant. Use the following candidate data to answer the question.

Candidate Data:
{chunks}

Question: {user_query}
Answer:"""

def query_llama(prompt):
    headers = {
        "Authorization": f"Bearer {API_KEY}",
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
    response = requests.post(GROQ_API_URL, headers=headers, json=payload)
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"]

def is_global_query(query):
    keywords = ["how many", "total", "count", "list all", "summary", "give me all"]
    return any(k in query.lower() for k in keywords)

# === API Endpoint ===
@app.route("/query", methods=["POST"])
def query_resume():
    data = request.json
    user_query = data.get("query", "")

    if not user_query.strip():
        return jsonify({"error": "Query is required"}), 400

    try:
        if is_global_query(user_query):
            if "how many" in user_query.lower() and "candidates" in user_query.lower():
                return jsonify({"response": f"There are {len(parsed_data)} candidates in the database."})

            elif "list all" in user_query.lower() and "names" in user_query.lower():
                names = [res.get("name", "Unknown") for res in parsed_data]
                return jsonify({"response": names})

            elif "summary" in user_query.lower():
                summary_data = "\n\n".join([json.dumps(r, indent=2) for r in parsed_data[:5]])
                prompt = build_prompt(summary_data, user_query)
                response = query_llama(prompt)
                return jsonify({"response": response})

        # Fallback: use RAG
        top_chunks = retrieve_top_k_chunks(user_query, model, faiss_index, texts)
        prompt = build_prompt("\n\n".join(top_chunks), user_query)
        response = query_llama(prompt)
        return jsonify({"response": response})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def post_with_retries(url: str, headers: Dict, payload: Dict) -> requests.Response:
    """Make API request with exponential backoff retry logic"""
    base_delay = 1.0
    max_delay = 30.0
    post_success_sleep = 10.0
    delay = base_delay
    retries = 5
    backoff_factor = 2

    for attempt in range(1, retries + 1):
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            # Success delay
            time.sleep(random.uniform(0, post_success_sleep))
            return response
        except requests.exceptions.HTTPError as http_err:
            status = getattr(http_err.response, "status_code", None)
            if status == 429:
                # Exponential backoff with jitter
                sleep_time = min(max_delay, delay * backoff_factor)
                jitter = random.uniform(0, sleep_time * 0.1)
                print(f"[429] Rate limit hit. Retrying in {sleep_time + jitter:.2f}s (Attempt {attempt}/{retries})")
                time.sleep(sleep_time + jitter)
                delay = sleep_time
                continue
            raise
        except (requests.exceptions.Timeout, requests.exceptions.ConnectionError) as conn_err:
            # Retry on transient errors
            jitter = random.uniform(0, delay * 0.1)
            print(f"[Retryable] {type(conn_err).__name__} on attempt {attempt}, retrying in {delay + jitter:.2f}s")
            time.sleep(delay + jitter)
            delay = min(max_delay, delay * 2)
    raise RuntimeError(f"Failed after {retries} attempts: {url}")


def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> Optional[str]:
    """Extract text content from PDF bytes"""
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        if not text.strip():
            print("No text found in the PDF")
            return None
        return text
    except Exception as e:
        print(f"Failed to read PDF bytes: {e}")
        return None


def extract_resume_json(resume_text, source_name=""):
    system_msg = (
        "You are a resume-parsing assistant. Respond ONLY with a single, "
        "strictly valid JSON object with these keys: "
        '"contactInfo", "education", "experience", "projects", "technicalSkills", '
        '"certifications", "extraCurriculars", "achievements". '
        "Do NOT include any markdown, commentary, or trailing commas."
        
    )
    user_msg = f"Parse the following resume text into JSON:\n\n{resume_text}"

    messages = [
        {"role": "system", "content": system_msg},
        {"role": "user",   "content": user_msg}
    ]

    payload = {
        "model": "llama3-70b-8192",
        "messages": messages,
        "temperature": 0.2
    }

    try:
        response = post_with_retries(GROQ_API_URL, headers=HEADERS, payload=payload)
        result = response.json()
        content = result['choices'][0]['message']['content']
        try:
            structured_data = json.loads(content)
            structured_data["_source_file"] = source_name
            return structured_data
        except json.JSONDecodeError:
            print(f"Received non-JSON response for '{source_name}':")
            print(content)
            return content
    except Exception as e:
        print(f"Groq API request failed for '{source_name}':", str(e))
        return None
    

def rank_resume(job_description: str, resume_json: Dict) -> str:
    """Rank a resume against a job description"""
    prompt = f"""
    You are an expert resume screener. Given a Job Description and a candidate's resume in proper valid JSON format, analyze and return a structured, proper valid JSON object containing:

    - A match score (0–100) indicating how well the resume fits the job.
    - A short remark explaining the score.
    - The email address of the candidate if available.
    - The phone number of the candidate if available.
    - The experience of the candidate in years if available

    Please respond **only** with a single, valid JSON object—no additional text—using exactly this structure (all braces, quotes, commas, and colons must be present and correctly placed):
    {{
    "score": <integer or float>,
    "remarks": "<detailed text>",
    "email": "<email address or empty string>",
    "phone": "<phone number or empty string>",
    "experience":<integer or float>
    }}

    job description and resume json are attached below

    ### Job Description:
    {job_description}

    ### Resume JSON:
    {json.dumps(resume_json, indent=2)}
    """

    messages = [
        {"role": "system", "content": "You are a helpful AI assistant that evaluates resumes based on job descriptions."},
        {"role": "user", "content": prompt}
    ]

    payload = {
        "model": "llama3-70b-8192",
        "messages": messages,
        "temperature": 0.2
    }

    try:
        response = post_with_retries(GROQ_API_URL, headers=HEADERS, payload=payload)
        result = response.json()
        reply = result["choices"][0]["message"]["content"]
        return reply
    except Exception as e:
        return f"API request failed: {e}"


def store_resume_in_db(filename: str, pdf_bytes: bytes, resume_json: Dict) -> str:
    """Store resume PDF and parsed data in MongoDB"""
    try:
        # Store PDF file in GridFS
        file_id = fs.put(pdf_bytes, filename=filename, content_type="application/pdf")
        # Store resume metadata and parsed data
        resume_doc = {
            "filename": filename,
            "file_id": file_id,
            "parsed_data": resume_json,
            "uploaded_at": datetime.utcnow(),
            "processed": True if resume_json else False
        }
        result = resumes_collection.insert_one(resume_doc)
        print(f"Resume stored with ID: {result.inserted_id}")
        return str(result.inserted_id)
    except Exception as e:
        print(f"Error storing resume in database: {e}")
        return None


def get_all_resumes_from_db() -> List[Dict]:
    """Retrieve all resumes from MongoDB"""
    try:
        resumes = list(resumes_collection.find({"processed": True}))
        for resume in resumes:
            resume["_id"] = str(resume["_id"])  # Convert ObjectId to string
        return resumes
    except Exception as e:
        print(f"Error retrieving resumes from database: {e}")
        return []


def process_resumes_from_db(job_description: str) -> List[Dict]:
    with progress_lock:
        # clear old progress messages
        progress_messages.clear()
    results = []
    resumes = get_all_resumes_from_db()
    total = len(resumes)
    if not resumes:
        send_progress(json.dumps({"status":"complete","message":"No resumes found in the database."}))
        return results
    for i, resume in enumerate(resumes):
        try:
            filename = resume.get("filename", "Unknown")
            send_progress(json.dumps({"status":"progress","message":f"Processing {filename} ","done":i,"total":total}))
            resume_json = str(resume.get("parsed_data"))
            if resume_json:
                start_index = resume_json.find('{')
                end_index = resume_json.rfind('}')+1
                resume_json = resume_json[start_index:end_index]
                ranking_text = rank_resume(job_description, resume_json)
                resume_response = json.loads(ranking_text)
                result = {
                    "filename": filename,
                    "score": resume_response.get("score", -1),
                    "remarks": resume_response.get("remarks"),
                    "phone": resume_response.get("phone"),
                    "email": resume_response.get("email"),
                    "experience": resume_response.get("experience")
                }
                results.append(result)
                send_progress(json.dumps({"status":"progress","message":f"Done processing {filename}","done":i+1,"total":total}))
            else:
                send_progress(json.dumps({"status":"progress","message":f"Unable to process {filename}", "done":i+1,"total":total}))
        except Exception as e:
            send_progress(json.dumps({"status":"failed","message":f"Error processing {filename}: {str(e)}", "done":i+1,"total":total}))
    # send final results
    send_progress(json.dumps({
        "status": "complete",
        "count": len(results),
        "results": results
    }))

@app.route('/resume_count')
def resume_count():
    return jsonify({"count": resumes_collection.count_documents({})})


def send_progress(message: str):
    with progress_lock:
        progress_messages.append(message)

# Flask Routes
@app.route("/progress_stream")
def progress_stream():
    def event_stream():
        last_index = 0
        while True:
            time.sleep(1)  # Poll every second
            with progress_lock:
                new_msgs = progress_messages[last_index:]
                last_index = len(progress_messages)
            for msg in new_msgs:
                yield f"data: {msg}\n\n"
    return Response(event_stream(), mimetype="text/event-stream")


@app.route('/upload_resumes', methods=['POST'])
def upload_resumes():
    """Upload and store multiple resumes in MongoDB"""
    try:
        if 'files' not in request.files:
            return jsonify({"error": "No files provided"}), 400

        files = request.files.getlist('files')
        if not files:
            return jsonify({"error": "No files selected"}), 400

        results = []
        for file in files:
            if file.filename == '':
                results.append({"file": "Unnamed", "status": "skipped", "reason": "No filename"})
                continue
            if not file.filename.lower().endswith('.pdf'):
                results.append({"file": file.filename, "status": "skipped", "reason": "Invalid format"})
                continue

            pdf_bytes = file.read()
            text = extract_text_from_pdf_bytes(pdf_bytes)
            if not text:
                results.append({"file": file.filename, "status": "error", "reason": "Text extraction failed"})
                continue

            resume_json = extract_resume_json(text, file.filename)
            if not resume_json:
                results.append({"file": file.filename, "status": "error", "reason": "Parsing failed"})
                continue

            resume_id = store_resume_in_db(file.filename, pdf_bytes, resume_json)
            if not resume_id:
                results.append({"file": file.filename, "status": "error", "reason": "Database error"})
                continue

            results.append({"file": file.filename, "status": "success"})

        return jsonify({
            "message": f"{len([r for r in results if r['status'] == 'success'])} of {len(results)} resumes uploaded",
            "details": results
        })

    except Exception as e:
        return jsonify({"error": f"Upload failed: {str(e)}"}), 500


@app.route('/get_resumes', methods=['GET'])
def get_resumes():
    """Get list of all stored resumes"""
    if not client:
        return jsonify({"error": "Database connection not available"}), 500
    try:
        resumes = get_all_resumes_from_db()
        return jsonify({
            "count": len(resumes),
            "resumes": [{"id": r["_id"], "filename": r["filename"], "uploaded_at": r["uploaded_at"]} for r in resumes]
        })
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve resumes: {str(e)}"}), 500


@app.route('/get_ranking_results', methods=['GET'])
def get_ranking_results():
    """Get all ranking results"""
    try:
        # Fetch all ranking documents, sorted by created_at descending
        all_rankings_cursor = rankings_collection.find().sort("created_at", -1)
        all_rankings = list(all_rankings_cursor)
        if not all_rankings:
            return jsonify({"error": "No ranking results found. Please process resumes first."}), 404
        rankings_response = []
        for ranking in all_rankings:
            results = ranking.get("results", [])
            # Sort each ranking's results by score
            try:
                sorted_results = sorted(
                    results,
                    key=lambda x: x["score"],
                    reverse=True
                )
            except:
                sorted_results = results
            rankings_response.append({
                "job_description": ranking.get("job_description", ""),
                "created_at": ranking.get("created_at"),
                "count": len(sorted_results),
                "results": sorted_results
            })
        return jsonify(rankings_response)
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve ranking results: {str(e)}"}), 500


@app.route("/process_resumes", methods=["POST"])
def process_resumes():
    """Process all resumes against a job description"""
    try:
        data = request.get_json()
        if not data or "job_Description" not in data:
            return jsonify({"error": "Missing job_Description in request"}), 400
        job_description = data.get("job_Description")
        print("Received job description:")
        print(job_description)
        # Trigger processing (final results will be sent via SSE)
        process_resumes_from_db(job_description)
        return jsonify({"message": "Resume processing done."}), 200
    except Exception as e:
        return jsonify({"error": f"Processing failed: {str(e)}"}), 500


@app.route('/delete_resume/<resume_id>', methods=['DELETE'])
def delete_resume(resume_id):
    """Delete a resume from database"""
    if not client:
        return jsonify({"error": "Database connection not available"}), 500
    try:
        # Find resume
        resume = resumes_collection.find_one({"_id": ObjectId(resume_id)})
        if not resume:
            return jsonify({"error": "Resume not found"}), 404
        # Delete PDF file from GridFS
        if "file_id" in resume:
            fs.delete(resume["file_id"])
        # Delete resume document
        resumes_collection.delete_one({"_id": ObjectId(resume_id)})
        return jsonify({"message": "Resume deleted successfully"})
    except Exception as e:
        return jsonify({"error": f"Failed to delete resume: {str(e)}"}), 500


@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(e):
    return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":    
    if not client:
        raise ValueError("Failed to connect to MongoDB. Check MONGO_URI in environment variables.")
    app.run(debug=True)