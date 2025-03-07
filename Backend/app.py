from flask import Flask, jsonify, render_template
from flask_cors import CORS
import requests
from db import store_input, get_history, init_db  # Import functions from db.py

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
def index():
    history = get_history()
    return render_template('index.html', history=history)

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

@app.route('/history', methods=['GET'])
def history():
    return jsonify({"history": get_history()})

@app.route('/submit', methods=['POST'])
def submit():
    # Store input in the database (using the function from db.py)
    store_input()
    history = get_history()  # Fetch updated history
    return jsonify({"history": history})  # Return updated history

# Render the index page with history
# @app.route('/')
# def index():
#     history = get_history()
#     return render_template('index.html', history=history)

if __name__ == '__main__':
    init_db() # Initialize the database (from db.py)
    app.run(port=5000, debug=True)