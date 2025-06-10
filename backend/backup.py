# import fitz  # PyMuPDF
# import requests
# import json
# import os
# import time

# # === Configuration for GROQ API ===
# GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
# API_KEY = "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"  # Use your key securely!
# HEADERS = {
#     "Authorization": f"Bearer {API_KEY}",
#     "Content-Type": "application/json"
# }

# def read_resume_from_path(pdf_path):
#     try:
#         doc = fitz.open(pdf_path)
#         text = ""
#         for page in doc:
#             text += page.get_text()
#         if not text.strip():
#             print(f"No text found in the PDF: {pdf_path}")
#             return None
#         return extract_resume_json(text, pdf_path)
#     except Exception as e:
#         print(f"Failed to read PDF '{pdf_path}':", str(e))
#         return None

# def extract_resume_json(resume_text, source_name=""):
#     messages = [
#         {
#             "role": "system",
#             "content": "You are an intelligent assistant that extracts structured information from resumes. Return only valid JSON."
#         },
#         {
#             "role": "user",
#             "content": f"Extract structured information from the following resume text and return it as a JSON object:\n\n{resume_text}"
#         }
#     ]

#     payload = {
#         "model": "llama3-70b-8192",
#         "messages": messages,
#         "temperature": 0.2
#     }

#     try:
#         response = requests.post(GROQ_API_URL, headers=HEADERS, json=payload)
#         response.raise_for_status()
#         result = response.json()
#         content = result['choices'][0]['message']['content']

#         try:
#             structured_data = json.loads(content)
#             # Optionally attach filename/source info for identification later
#             structured_data["_source_file"] = source_name
#             return structured_data
#         except json.JSONDecodeError:
#             print(f"Received non-JSON response for '{source_name}':")
#             print(content)
#             return content

#     except requests.RequestException as e:
#         print(f"Groq API request failed for '{source_name}':", str(e))
#         return None

# def get_job_description():
#     print("Enter the Job Description (end with a blank line):")
#     jd_lines = []
#     while True:
#         line = input()
#         if line.strip() == "":
#             break
#         jd_lines.append(line)
#     return "\n".join(jd_lines)

# def rank_resume(job_description, resume_json):
#     prompt = f"""
# You are an expert resume screener. Given a Job Description and a candidate's resume in JSON format, analyze and provide a match score out of 100 along with reasoning.

# ### Job Description:
# {job_description}

# ### Resume JSON:
# {json.dumps(resume_json, indent=2)}

# Now give:
# 1. A match score (0-100) indicating how well the resume fits the job.
# 2. A short reasoning for the score.
#     """

#     messages = [
#         {"role": "system", "content": "You are a helpful AI assistant that evaluates resumes based on job descriptions."},
#         {"role": "user", "content": prompt}
#     ]

#     payload = {
#         "model": "llama3-70b-8192",
#         "messages": messages,
#         "temperature": 0.2
#     }

#     try:
#         response = requests.post(GROQ_API_URL, headers=HEADERS, json=payload)
#         response.raise_for_status()
#         result = response.json()
#         reply = result["choices"][0]["message"]["content"]
#         return reply

#     except requests.exceptions.RequestException as e:
#         return f"API request failed: {e}"

# # def process_resumes_in_folder(folder_path):
# #     resumes_data = []
# #     for filename in os.listdir(folder_path):
# #         if filename.lower().endswith(".pdf"):
# #             full_path = os.path.join(folder_path, filename)
# #             print(f"\nProcessing resume: {filename}")
# #             resume_json = read_resume_from_path(full_path)
# #             if resume_json:
# #                 resume_json=resume_json
# #                 result = rank_resume(job_description, resume_json)
# #                 result_append = result_append.append(result)
# #             else:
# #                 print(f"Skipping resume due to extraction failure: {filename}")
# #     print(result_append)
# #     print(f"Successfully extracted resume data from: ",resumes_data)
# #     return resumes_data
# def process_resumes_in_folder(folder_path):
#     resumes_data = []
#     ranking_results = []  # Initialize an empty list to collect ranking results

#     for filename in os.listdir(folder_path):
        
#         if filename.lower().endswith(".pdf"):
#             full_path = os.path.join(folder_path, filename)
#             print(f"\nProcessing resume: {filename}")
#             resume_json = read_resume_from_path(full_path)
#             if resume_json:
#                 resumes_data.append(resume_json)  # collect structured resume JSON
#                 time.sleep(3)  # Wait 2 seconds between requests
#                 result = rank_resume(job_description, resume_json)
#                 ranking_results.append({
#                     "filename": filename,
#                     "ranking": result
#                 })
#             else:
#                 print(f"Skipping resume due to extraction failure: {filename}")

#     print("\nRanking Results:")
#     for result in ranking_results:
#         print(f"\n--- {result['filename']} ---")
#         print(result["ranking"])

#     print(f"\nSuccessfully extracted resume data from: ",ranking_results)

#     return resumes_data


# if __name__ == "__main__":
#     folder_path = "C:/Users/sikha/OneDrive/Desktop/Resume Parser/backend/Resumes"
#     job_description = get_job_description()
#     if not job_description.strip():
#         print("Job Description is empty, exiting.")
#         exit(1)

#     print(f"\nReading resumes from folder: {folder_path}")
#     resumes = process_resumes_in_folder(folder_path)
#     if not resumes:
#         print("No valid resumes found or extracted.")
#         exit(1)

#     # print("\nRanking all resumes against the job description...\n")
#     # for i, resume_json in enumerate(resumes, 1):
#     #     source_file = resume_json.get("_source_file", f"Resume #{i}")
#     #     print(f"--- Ranking Result for {source_file} ---")
#     #     result = rank_resume(job_description, resume_json)
#     #     print(result)
#     #     print("\n" + "="*60 + "\n")















######################################################################333Working




# import fitz  # PyMuPDF
# import requests
# import json
# import os
# import time

# # === Configuration for GROQ API ===
# GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
# API_KEY = "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"  # Use your key securely!
# HEADERS = {
#     "Authorization": f"Bearer {API_KEY}",
#     "Content-Type": "application/json"
# }

# def post_with_retries(url, headers, payload, retries=5, backoff_factor=2):
#     delay = 2  # initial delay in seconds
#     for attempt in range(retries):
#         try:
#             response = requests.post(url, headers=headers, json=payload)
#             response.raise_for_status()
#             return response
#         except requests.exceptions.HTTPError as e:
#             if response.status_code == 429:
#                 print(f"Rate limit hit. Retrying in {delay} seconds... (Attempt {attempt + 1} of {retries})")
#                 time.sleep(delay)
#                 delay *= backoff_factor  # exponential backoff
#             else:
#                 raise e
#     raise Exception("Exceeded retry limit due to repeated 429 errors.")

# def read_resume_from_path(pdf_path):
#     try:
#         doc = fitz.open(pdf_path)
#         text = ""
#         for page in doc:
#             text += page.get_text()
#         if not text.strip():
#             print(f"No text found in the PDF: {pdf_path}")
#             return None
#         return extract_resume_json(text, pdf_path)
#     except Exception as e:
#         print(f"Failed to read PDF '{pdf_path}':", str(e))
#         return None

# def extract_resume_json(resume_text, source_name=""):
#     messages = [
#         {
#             "role": "system",
#             "content": "You are an intelligent assistant that extracts structured information from resumes. Return only valid JSON."
#         },
#         {
#             "role": "user",
#             "content": f"Extract structured information from the following resume text and return it as a JSON object:\n\n{resume_text}"
#         }
#     ]

#     payload = {
#         "model": "llama3-70b-8192",
#         "messages": messages,
#         "temperature": 0.2
#     }

#     try:
#         response = post_with_retries(GROQ_API_URL, headers=HEADERS, payload=payload)
#         result = response.json()
#         content = result['choices'][0]['message']['content']
#         try:
#             structured_data = json.loads(content)
#             structured_data["_source_file"] = source_name
#             return structured_data
#         except json.JSONDecodeError:
#             print(f"Received non-JSON response for '{source_name}':")
#             print(content)
#             return content
#     except Exception as e:
#         print(f"Groq API request failed for '{source_name}':", str(e))
#         return None

# def get_job_description():
#     print("Enter the Job Description (end with a blank line):")
#     jd_lines = []
#     while True:
#         line = input()
#         if line.strip() == "":
#             break
#         jd_lines.append(line)
#     return "\n".join(jd_lines)

# def rank_resume(job_description, resume_json):
#     prompt = f"""
# You are an expert resume screener. Given a Job Description and a candidate's resume in JSON format, analyze and provide a match score out of 100 along with reasoning.

# ### Job Description:
# {job_description}

# ### Resume JSON:
# {json.dumps(resume_json, indent=2)}

# Now give:
# 1. A match score (0-100) indicating how well the resume fits the job.
# 2. A short reasoning for the score.
#     """

#     messages = [
#         {"role": "system", "content": "You are a helpful AI assistant that evaluates resumes based on job descriptions."},
#         {"role": "user", "content": prompt}
#     ]

#     payload = {
#         "model": "llama3-70b-8192",
#         "messages": messages,
#         "temperature": 0.2
#     }

#     try:
#         response = post_with_retries(GROQ_API_URL, headers=HEADERS, payload=payload)
#         result = response.json()
#         reply = result["choices"][0]["message"]["content"]
#         return reply

#     except Exception as e:
#         return f"API request failed: {e}"

# def process_resumes_in_folder(folder_path, job_description):
#     resumes_data = []
#     ranking_results = []

#     for filename in os.listdir(folder_path):
#         if filename.lower().endswith(".pdf"):
#             full_path = os.path.join(folder_path, filename)
#             print(f"\nProcessing resume: {filename}")
#             resume_json = read_resume_from_path(full_path)
#             if resume_json:
#                 resumes_data.append(resume_json)  # collect structured resume JSON
#                 time.sleep(2)  # small delay between calls
#                 result = rank_resume(job_description, resume_json)
#                 ranking_results.append({
#                     "filename": filename,
#                     "ranking": result
#                 })
#             else:
#                 print(f"Skipping resume due to extraction failure: {filename}")

#     print("\nRanking Results:")
#     for result in ranking_results:
#         print(f"\n--- {result['filename']} ---")
#         print(result["ranking"])

#     print(f"\nSuccessfully processed resumes: {[r['filename'] for r in ranking_results]}")

#     return resumes_data

# if __name__ == "__main__":
#     folder_path = "C:/Users/sikha/OneDrive/Desktop/Resume Parser/backend/Resumes"
#     job_description = get_job_description()
#     if not job_description.strip():
#         print("Job Description is empty, exiting.")
#         exit(1)

#     print(f"\nReading resumes from folder: {folder_path}")
#     resumes = process_resumes_in_folder(folder_path, job_description)
#     if not resumes:
#         print("No valid resumes found or extracted.")
#         exit(1)





##################################################################################################################







import pandas as pd
import re
import fitz  # PyMuPDF
import requests
import json
import os
import time




# === Configuration for GROQ API ===
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
API_KEY = "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"  # Use your key securely!
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

def post_with_retries(url, headers, payload, retries=5, backoff_factor=2):
    delay = 2  # initial delay in seconds
    for attempt in range(retries):
        try:
            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()
            return response
        except requests.exceptions.HTTPError as e:
            if response.status_code == 429:
                print(f"Rate limit hit. Retrying in {delay} seconds... (Attempt {attempt + 1} of {retries})")
                time.sleep(delay)
                delay *= backoff_factor  # exponential backoff
            else:
                raise e
    raise Exception("Exceeded retry limit due to repeated 429 errors.")


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


def get_job_description():
    print("Enter the Job Description (end with a blank line):")
    jd_lines = []
    while True:
        line = input()
        if line.strip() == "":
            break
        jd_lines.append(line)
    return "\n".join(jd_lines)

def read_resume_from_path(pdf_path):
    try:
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text()
        if not text.strip():
            print(f"No text found in the PDF: {pdf_path}")
            return None
        return extract_resume_json(text, pdf_path)
    except Exception as e:
        print(f"Failed to read PDF '{pdf_path}':", str(e))
        return None


def parse_ranking_result(text):
    score = None
    reasoning = None
    email = None
    phone = None  # ✅ Initialize before conditional use

    # Try to extract score out of 100 (e.g. "match score: 85" or "score: 85")
    score_match = re.search(r"score\s*[:\-]?\s*(\d{1,3})", text, re.I)
    if score_match:
        score = int(score_match.group(1))
        if score > 100:
            score = None

    # Extract email
    email_match = re.search(r"email\s*[:\-]?\s*([\w\.-]+@[\w\.-]+\.\w+)", text, re.I)
    if email_match:
        email = email_match.group(1)

    # Extract phone
    phone_match = re.search(r"phone\s*[:\-]?\s*([\+\d][\d\s\-\(\)]{7,}\d)", text, re.I)
    if phone_match:
        phone = phone_match.group(1).strip()

    # Extract reasoning as everything after the score line
    parts = text.split('\n')
    reasoning_lines = []
    found_score_line = False
    for line in parts:
        if score_match and score_match.group(0).lower() in line.lower():
            found_score_line = True
            continue
        if found_score_line:
            reasoning_lines.append(line.strip())
    reasoning = " ".join(reasoning_lines).strip()
    if not reasoning:
        reasoning = text

    return score, reasoning, phone, email


def rank_resume(job_description, resume_json):
    prompt = f"""
You are an expert resume screener. Given a Job Description and a candidate's resume in JSON format, analyze and provide a match score out of 100 along with reasoning.

### Job Description:
{job_description}

### Resume JSON:
{json.dumps(resume_json, indent=2)}

Now give:
1. A match score (0-100) indicating how well the resume fits the job.
2. A short reasoning for the score.
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

def process_resumes_in_folder(folder_path, job_description):
    results = []

    for filename in os.listdir(folder_path):
        if filename.lower().endswith(".pdf"):
            full_path = os.path.join(folder_path, filename)
            print(f"\nProcessing resume: {filename}")
            resume_json = read_resume_from_path(full_path)
            if resume_json:
                time.sleep(2)  # delay between calls
                ranking_text = rank_resume(job_description, resume_json)
                score, reasoning, phone, email = parse_ranking_result(ranking_text)
                results.append({
                    "filename": filename,
                    "match_score": score if score is not None else "N/A",
                    "reasoning": reasoning
                    # "phone": phone if phone else "N/A",
                    # "email": email if email else "N/A"
                    
                })
            else:
                print(f"Skipping resume due to extraction failure: {filename}")

    if not results:
        print("No ranking results to display or save.")
        return []

    # Create DataFrame
    df = pd.DataFrame(results)
    # Sort by match_score descending if scores are numeric
    try:
        df["match_score"] = pd.to_numeric(df["match_score"], errors='coerce')
        df = df.sort_values(by="match_score", ascending=False)
    except Exception:
        pass

    # Print table to console
    print("\n--- Resume Ranking Results ---")
    print(df.to_string(index=False))

    # Save to CSV
    csv_path = os.path.join(folder_path, "ranking_results.csv")
    df.to_csv(csv_path, index=False)
    print(f"\nRanking results saved to CSV file: {csv_path}")

    return results

# In your main __name__ == "__main__" block just call process_resumes_in_folder as before
if __name__ == "__main__":
    folder_path = "C:/Users/sikha/OneDrive/Desktop/Resume Parser/backend/Resumes"
    job_description = get_job_description()
    if not job_description.strip():
        print("Job Description is empty, exiting.")
        exit(1)

    print(f"\nReading resumes from folder: {folder_path}")
    process_resumes_in_folder(folder_path, job_description)