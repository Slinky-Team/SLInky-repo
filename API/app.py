from flask import Flask, jsonify, redirect, render_template
import requests

app = Flask(__name__)




# your local host
EXTERNAL_API_URL = 'http://127.0.0.1:7000'


def call_external_api(endpoint, auth=('user', 'pass')):
    try:
        response = requests.get(endpoint,auth=auth)
        if response.status_code == 200:
            return response.json()
        else:
            return {"error": "Failed to fetch data", "status_code": response.status_code}
    except requests.exceptions.RequestException as e:
        return {"error": f"Failed to connect to the API: {str(e)}"}


# home page route
@app.route('/home')
@app.route('/')
def home():
     return render_template('base.html')
     
# Azure route
@app.route('/azure/<data>', methods=['GET','POST'])
def call_azure(data):
        endpoint = (f'{EXTERNAL_API_URL}/oil/azure/{data}')
        response = call_external_api(endpoint)
        return render_template('displayjson.html', data = response)

# okta logs
@app.route('/okta/<data>', methods=['GET'])

def call_okta(data):
        endpoint = (f'{EXTERNAL_API_URL}/oil/okta/{data}')
        response = call_external_api(endpoint)
        return render_template('displayjson.html', data = response)
                
       
if __name__ == '__main__':
    app.run(port=7001) 