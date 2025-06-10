from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

@app.route('/get_csv_data', methods=['GET'])
def get_csv_data():
    try:
        df = pd.read_csv('C:/Users/sikha/OneDrive/Desktop/Resume Parser/backend/Resumes/ranking_results.csv')  # Ensure 'data.csv' is in the same folder or provide full path
        data = df.to_dict(orient='records')  # Convert DataFrame to list of dicts
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
