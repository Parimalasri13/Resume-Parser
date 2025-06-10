import fitz  # PyMuPDF
import requests
import json

# === Configuration for GROQ API ===
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
API_KEY = "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"  # Use your key securely!
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

def read_resume_from_path():
    pdf_path = "C:/Users/sikha/OneDrive/Desktop/Resume Parser/backend/ParimalaSri.pdf"  # Change this if needed

    try:
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text()
        if not text.strip():
            print("No text found in the PDF.")
            return
        return extract_resume_json(text)
    except Exception as e:
        print("Failed to read PDF:", str(e))

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
            print(json.dumps(structured_data, indent=4))
        except json.JSONDecodeError:
            print("Received non-JSON response:")
            print(content)
        return content


    except requests.RequestException as e:
        print("Groq API request failed:", str(e))

def get_job_description():
    print("Enter the Job Description (end with a blank line):")
    jd_lines = []
    while True:
        line = input()
        if line.strip() == "":
            break
        jd_lines.append(line)
    return "\n".join(jd_lines)

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
        response = requests.post(GROQ_API_URL, headers=HEADERS, json=payload)
        response.raise_for_status()
        result = response.json()
        reply = result["choices"][0]["message"]["content"]
        return reply

    except requests.exceptions.RequestException as e:
        return f"API request failed: {e}"




# === Run directly as a script ===
if __name__ == "__main__":
    resume_json= read_resume_from_path()
    job_description = get_job_description()
    if not resume_json:
        print("Failed to extract resume data.")
        exit(1)

    print("\nRanking Resume...")
    result = rank_resume(job_description, resume_json)
    print("\n=== Ranking Result ===")
    print(result)
