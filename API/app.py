from flask import Flask, jsonify
import requests

app = Flask(__name__)




# your local host
EXTERNAL_API_URL = 'xxxx'


def call_external_api(endpoint, auth=('user', 'pass')):
    try:
        response = requests.get(endpoint,auth=auth)
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify({"error": "Failed to fetch data", "status_code": response.status_code}),500
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Failed to connect to the API: {str(e)}"}), 500

# Azure route
@app.route('/azure/<data>', methods=['GET'])

def call_azure(data):
        endpoint = (f'{EXTERNAL_API_URL}/oil/azure/{data}')
        return call_external_api(endpoint)

# okta logs
@app.route('/okta/<data>', methods=['GET'])

def call_okta(data):
        endpoint = (f'{EXTERNAL_API_URL}/oil/okta/{data}')
        return call_external_api(endpoint)
                
       
if __name__ == '__main__':
    app.run(port=7001) 