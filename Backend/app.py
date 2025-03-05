from flask import Flask, jsonify,request
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
import requests
app = Flask(__name__)

app.config['SECRET_KEY'] = 'your_secret_key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
CORS(app)  # Allow frontend requests

login_manager = LoginManager()
login_manager.init_app(app)

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    password = generate_password_hash(data.get("password"), method="pbkdf2:sha256")

    if User.query.filter_by(username=username).first():
        return jsonify({"message": "User already exists"}), 400

    new_user = User(username=username, password=password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User registered successfully"}), 201

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data.get("username")).first()

    if not user or not check_password_hash(user.password, data.get("password")):
        return jsonify({"message": "Invalid credentials"}), 401

    login_user(user)
    return jsonify({"message": "Login successful", "username": user.username}), 200

@app.route("/api/dashboard", methods=["GET"])
@login_required
def dashboard():
    return jsonify({"message": f"Welcome {current_user.username}!"})

@app.route("/api/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"}), 200
















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