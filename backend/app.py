# from flask import request
# import fitz  # PyMuPDF for PDF text extraction


# import requests

# GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
# API_KEY = "your_groq_api_key"
# HEADERS = {
#     "Authorization": f"Bearer {API_KEY}",
#     "Content-Type": "application/json"
# }

# @app.route("/upload_resume", methods=["POST"])
# def upload_resume():
#     file = request.files['resume']
#     if not file:
#         return jsonify({"message": "No file uploaded"}), 400

#     # Extract text from PDF
#     doc = fitz.open(stream=file.read(), filetype="pdf")
#     text = ""
#     for page in doc:
#         text += page.get_text()

#     return extract_resume_json(text)




# def extract_resume_json(resume_text):
#     messages = [
#         {
#             "role": "system",
#             "content": "You are an intelligent assistant that extracts structured information from resumes."
#         },
#         {
#             "role": "user",
#             "content": f"Extract key details from the following resume text and return them as a JSON object:\n\n{resume_text}"
#         }
#     ]

#     payload = {
#         "model": "llama3-70b-8192",  # or the correct model ID Groq supports
#         "messages": messages,
#         "temperature": 0.2
#     }

#     response = requests.post(GROQ_API_URL, headers=HEADERS, json=payload)
#     if response.status_code == 200:
#         result = response.json()
#         content = result['choices'][0]['message']['content']
#         try:
#             structured_data = json.loads(content)
#             return jsonify(structured_data)
#         except:
#             return jsonify({"raw_response": content, "note": "Response was not valid JSON"}), 200
#     else:
#         return jsonify({"error": "Failed to extract data", "details": response.text}), 500



from flask import Flask, request, jsonify
from flask_cors import CORS
import fitz  # PyMuPDF for PDF text extraction
import requests
import json

app = Flask(__name__)
CORS(app)  # Allows React frontend to call Flask backend

# === Configuration for GROQ API ===
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
API_KEY = "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"  # Replace with your real key
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# === Resume Upload Route ===
# @app.route("/upload_resume", methods=["POST"])
# def upload_resume():
#     if 'resume' not in request.files:
#         return jsonify({"message": "No file part"}), 400

#     file = request.files['resume']
#     if file.filename == '':
#         return jsonify({"message": "No selected file"}), 400

#     # Extract text from PDF using PyMuPDF
#     try:
#         doc = fitz.open(stream=file.read(), filetype="pdf")
#         text = ""
#         for page in doc:
#             text += page.get_text()
#     except Exception as e:
#         return jsonify({"message": "Failed to extract text", "error": str(e)}), 500

#     return extract_resume_json(text)

def read_resume_from_path():
    pdf_path = "ParimalaSri.pdf"  # Change this to your file path

    try:
        doc = fitz.open(pdf_path)  # Open directly from file path
        text = ""
        for page in doc:
            text += page.get_text()
        print ("Extracted Text:", text)  # Print the extracted text for debugging
        if not text.strip():
            return jsonify({"message": "No text found in the PDF"}), 400
        return extract_resume_json(text)
    except Exception as e:
        return jsonify({"message": "Failed to read PDF", "error": str(e)}), 500


# === Function to Call Groq API and Parse Resume Data ===
def extract_resume_json(resume_text):
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
        response = requests.post(GROQ_API_URL, headers=HEADERS, json=payload)
        response.raise_for_status()
        result = response.json()
        content = result['choices'][0]['message']['content']

        try:
            structured_data = json.loads(content)
            return jsonify(structured_data)
        except json.JSONDecodeError:
            return jsonify({
                "raw_response": content,
                "note": "Response received but it was not valid JSON. You may parse it manually."
            }), 200

    except requests.RequestException as e:
        return jsonify({"error": "Groq API request failed", "details": str(e)}), 500



# main
if __name__ == "__main__":
    app.run(debug=True, port=5000)  # Run Flask app on port 5000
    read_resume_from_path()  # Call this function to test reading from a file