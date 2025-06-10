import React, { useState } from 'react';
import axios from 'axios';

function ResumeUploader() {
  const [file, setFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setExtractedData(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a resume file (PDF)");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/upload_resume", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      setExtractedData(response.data);
    } catch (err) {
      setError("Failed to extract data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 shadow rounded border">
      <h2 className="text-2xl font-semibold mb-4">Upload Resume</h2>

      <input type="file" accept=".pdf" onChange={handleFileChange} className="mb-4" />
      <br />
      <button 
        onClick={handleUpload}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Uploading..." : "Upload and Extract"}
      </button>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {extractedData && (
        <div className="mt-6 bg-gray-100 p-4 rounded">
          <h3 className="text-lg font-bold mb-2">Extracted Information:</h3>
          <pre className="text-sm overflow-auto">{JSON.stringify(extractedData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default ResumeUploader;
