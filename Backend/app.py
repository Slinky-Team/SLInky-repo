from flask import Flask, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
# Explicitly allow the React frontend origin
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

EXTERNAL_API_URL = 'http://127.0.0.1:7000'  # External API on port 7000

def call_external_api(endpoint, auth=('user', 'pass')):
    try:
        response = requests.get(endpoint, auth=auth)
        if response.status_code == 200:
            return response.json()
        else:
            return {"error": "Failed to fetch data", "status_code": response.status_code}
    except requests.exceptions.RequestException as e:
        return {"error": f"Failed to connect to the API: {str(e)}"}

@app.route('/home')
@app.route('/')
def home():
    return jsonify({"message": "Welcome to the Flask API!"})

@app.route('/search/<data>', methods=['GET'])
def search(data):
    # Fetch Azure data
    azure_endpoint = f'{EXTERNAL_API_URL}/oil/azure/{data}'
    azure_response = call_external_api(azure_endpoint)

    # Fetch Okta data
    okta_endpoint = f'{EXTERNAL_API_URL}/oil/okta/{data}'
    okta_response = call_external_api(okta_endpoint)

    # Combine results
    return jsonify({
        "azure": azure_response,
        "okta": okta_response
    })

if __name__ == '__main__':
    app.run(port=5000, debug=True)