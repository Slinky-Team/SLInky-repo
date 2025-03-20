from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from models import db, User
from config import Config
from flask import session
import requests


app = Flask(__name__)
app.config.from_object(Config)

# Initialize db and migrate
db.init_app(app)
migrate = Migrate(app, db)

# Explicitly allow the React frontend origin
CORS(app,supports_credentials=True, resources={r"/*": {"origins": "http://localhost:3000"}})

login_manager = LoginManager()
login_manager.init_app(app)

with app.app_context():
        db.create_all()
        
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/')
def index():
    return app.send_static_file('index.html')


# Register route
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data['username']
    password = generate_password_hash(data['password'], method='pbkdf2:sha256')
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({"message": "Missing username or password!"}), 400
    
    if User.query.filter_by(username=username).first():
        return jsonify({"message": "User already exists!"}), 400

    new_user = User(username=username, password=password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully!"}), 201

# Login route
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    

    # Retrieve user by username
    username_input = data['username'].strip()  # Ensure no leading/trailing spaces
    user = User.query.filter_by(username=username_input).first()

    # Debug: Print out the user object
    print(f"Query result for username '{username_input}': {user}")
    # print(f"CURRENT USER: {user} || USERNAME: {user.username} || PASS: {user.password}")

    # Check if the user exists
    if user == None:
        print("MSG 1 REACHED!!!!!!!!!!")
        return jsonify({"message": "Invalid credentials!"}), 401

    # Check if the password is correct
    if not check_password_hash(user.password, data['password']):
        print("MSG 2 REACHED!!!!!!!!!!")
        return jsonify({"message": "Invalid credentials!"}), 401

    # If user is valid, proceed with login
    print("SUCESSS LOGIN!!!!!")
    login_user(user)
    session.permanent = True  # Ensures session persists across restarts
    return jsonify({"message": "Login successful!", "redirect": "/"}), 200

# Dashboard route (only accessible to logged-in users)
@app.route('/api/dashboard', methods=['GET'])
@login_required
def dashboard():
    return jsonify({"message": f"Welcome {current_user.username}!"})

# Logout route
@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)  # Clear the session manually
    return jsonify({"message": "Logged out successfully!"}), 200





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
    
    app.run(port=7000, debug=True)