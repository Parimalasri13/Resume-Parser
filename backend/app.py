import os
import re
import json
import time
from typing import Dict, List, Optional, Tuple
from datetime import datetime

import fitz  # PyMuPDF
import pandas as pd
import requests
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import gridfs
import io

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
    rankings_collection = db.rankings  # For storing ranking results
    print("Connected to MongoDB successfully")
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")
    client = None


def post_with_retries(url: str, headers: Dict, payload: Dict, retries: int = 5, backoff_factor: int = 2) -> requests.Response:
    """Make API request with exponential backoff retry logic"""
    delay = 2
    
    for attempt in range(retries):
        try:
            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()
            return response
        except requests.exceptions.HTTPError as e:
            if response.status_code == 429:
                print(f"Rate limit hit. Retrying in {delay}s... (Attempt {attempt + 1}/{retries})")
                time.sleep(delay)
                delay *= backoff_factor
            else:
                raise e
    raise Exception("Exceeded retry limit due to repeated 429 errors")


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
    messages = [
        {
            "role": "system",
            "content": "You are an intelligent assistant that extracts structured information from resumes. Return only valid JSON."
        },
        {
            "role": "user",
            "content": f"Extract structured information from the following resume text and return it as a JSON object:\n\n{resume_text}"
        }
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
    

def parse_ranking_result(text: str) -> Tuple[Optional[int], str, Optional[str], Optional[str]]:
    """Parse ranking result to extract score, reason, phone, and email"""
    score = None
    reason = text
    email = None
    phone = None
    
    # Extract score (0-100)
    score_match = re.search(r"score\s*[:\-]?\s*(\d{1,3})", text, re.IGNORECASE)
    if score_match:
        potential_score = int(score_match.group(1))
        if potential_score <= 100:
            score = potential_score
    # Extract email
    email_match = re.search(r"email\s*[:\-]?\s*([\w\.-]+@[\w\.-]+\.\w+)", text, re.IGNORECASE)
    if email_match:
        email = email_match.group(1)

    # Extract phone
    phone_match = re.search(r"phone\s*[:\-]?\s*([\+\d][\d\s\-\(\)]{7,}\d)", text, re.IGNORECASE)
    if phone_match:
        phone = phone_match.group(1).strip()
    # Extract reason (text after score line)
    if score_match:
        parts = text.split('\n')
        reason_lines = []
        found_score_line = False
        for line in parts:
            if score_match.group(0).lower() in line.lower():
                found_score_line = True
                continue
            if found_score_line:
                reason_lines.append(line.strip())
        if reason_lines:
            reason = " ".join(reason_lines).strip()
    return score, reason, phone, email


def rank_resume(job_description: str, resume_json: Dict) -> str:
    """Rank a resume against a job description"""
    prompt = f"""
You are an expert resume screener. Given a Job Description and a candidate's resume in JSON format, analyze and provide a match score out of 100 along with reason.

### Job Description:
{job_description}

### Resume JSON:
{json.dumps(resume_json, indent=2)}

Now give:
1. A match score (0-100) indicating how well the resume fits the job.
2. A short reason for the score.
3. Email address of the candidate if available.
4. Phone number of the candidate if available.
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
    """Process all resumes from MongoDB and rank them"""
    results = []
    resumes = get_all_resumes_from_db()
    if not resumes:
        print("No resumes found in database")
        return results
    for resume in resumes:
        filename = resume.get("filename", "Unknown")
        resume_json = resume.get("parsed_data")
        print(f"\nProcessing resume: {filename}")
        if resume_json:
            ranking_text = rank_resume(job_description, resume_json)
            score, reason, phone, email = parse_ranking_result(ranking_text)
            result = {
                "resume_id": resume["_id"],
                "filename": filename,
                "match_score": score if score is not None else "N/A",
                "reason": reason,
                "phone": phone,
                "email": email
            }
            results.append(result)
        else:
            print(f"Skipping resume due to missing parsed data: {filename}")

    if results:
        # Store ranking results in database
        ranking_doc = {
            "job_description": job_description,
            "results": results,
            "created_at": datetime.utcnow()
        }
        rankings_collection.insert_one(ranking_doc)
        print(f"Stored ranking results for {len(results)} resumes")
    return results


# Flask Routes
@app.route('/upload_resume', methods=['POST'])
def upload_resume():
    """Upload and store resume in MongoDB"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({"error": "Only PDF files are supported"}), 400
        # Read PDF bytes
        pdf_bytes = file.read()
        # Extract text and parse resume
        text = extract_text_from_pdf_bytes(pdf_bytes)
        if not text:
            return jsonify({"error": "Could not extract text from PDF"}), 400
        resume_json = extract_resume_json(text, file.filename)
        if not resume_json:
            return jsonify({"error": "Could not parse resume content"}), 400
        # Store in database
        resume_id = store_resume_in_db(file.filename, pdf_bytes, resume_json)
        if not resume_id:
            return jsonify({"error": "Failed to store resume in database"}), 500
        return jsonify({
            "message": "Resume uploaded and processed successfully",
            "resume_id": resume_id,
            "filename": file.filename
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
            # Sort each ranking's results by match_score
            try:
                sorted_results = sorted(
                    results,
                    key=lambda x: float(x["match_score"]) if x["match_score"] != "N/A" else -1,
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
        if not job_description.strip():
            return jsonify({"error": "Job description cannot be empty"}), 400
        print("Received job description:")
        print(job_description)
        results = process_resumes_from_db(job_description)
        sorted_results = sorted(
                    results,
                    key=lambda x: float(x["match_score"]) if x["match_score"] != "N/A" else -1,
                    reverse=True
                )
        num_processed = len(sorted_results)
        return jsonify({
            "message": f"Job description received successfully. {num_processed} resumes processed.",
            "count": num_processed,
            "results": sorted_results
        })
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