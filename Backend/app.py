from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from models import db, User, SearchHistory
from config import Config
from flask import session
import requests
import json


app = Flask(__name__)
app.config.from_object(Config)

# Initialize db and migrate
db.init_app(app)
migrate = Migrate(app, db)

# Explicitly allow the React frontend origin
CORS(app,supports_credentials=True, resources={r"/*": {"origins": "http://localhost:3000"}})

# Initialize login 
login_manager = LoginManager()
login_manager.init_app(app)
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


# create the db 
with app.app_context():
    db.create_all()

# vars
IOC_EXTRACTOR_URL = "http://127.0.0.1:5000/extract"
auth = ('user', 'pass')
OUTPUT_FILE = "output.txt"

# Default route
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

    # Check if the user exists
    if user == None:
        return jsonify({"message": "Invalid credentials!"}), 401

    # Check if the password is correct
    if not check_password_hash(user.password, data['password']):
        return jsonify({"message": "Invalid credentials!"}), 401

    # If user is valid, proceed with login
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


# fang/defang route
@app.route('/fanging', methods=["POST"])
def fang_defang():
    try:
        # Get the mode from the query parameter & input text as raw text
        mode = request.args.get("mode")
        input_text = request.get_data(as_text=True)

        print(f"Mode: {mode}")
        print(f"Input text:\n{input_text}")


        # Method to fang ioc
        def fang(ioc):
            # Turn www[dot]site[dot]com into www.site.com
            ioc = ioc.replace("[dot]", ".")
            # Turn www(dot)site(dot)com into www.site.com
            ioc = ioc.replace("(dot)", ".")
            # Turn 1.2.3[,]4 into 1.2.3.4
            ioc = ioc.replace("[,]", ".")
            # Turn http[:]// into http://
            ioc = ioc.replace("[:]", ":")
            # Turn 1.2.3[.]4 into 1.2.3.4
            ioc = ioc.replace("[.]", ".")
            # Turn bad.guy .com into bad.guy.com
            ioc = ioc.replace(" .", ".")
            # Turn hxxp into http
            ioc = ioc.replace("hxxp", "http")
            return ioc
        
        # Method to defang ioc
        def defang(ioc):
            # Turn 1.2.3.4 into 1[.]2[.]3[.]4
            ioc = ioc.replace(".", "[.]")
            # Turn http:// into http[:]//
            ioc = ioc.replace(":", "[:]")
            # Turn 1.2.3[[.]]4 into 1[.]2[.]3[.]4
            ioc = ioc.replace("[[.]]", "[.]")
            # Turn http[[:]]// into http[:]//
            ioc = ioc.replace("[[:]]", "[:]")
            # Turn http into hxxp
            ioc = ioc.replace("http", "hxxp")
            return ioc
        
        # For each ioc fang/defang as needed
        output_lines = []
        for line in input_text.splitlines():
            if mode == "fanged":
                output_lines.append(fang(line))
            elif mode == "defanged":
                output_lines.append(defang(line))
            else:
                output_lines.append(line)  # No change if mode is invalid

        # return results
        return "\n".join(output_lines), 200
    except Exception as e:
        print(f"FAILED FANGING API: {e}")
        return "Error processing text", 500


@app.route("/search-and-extract", methods=["POST"])
def search_and_extract():
    text = request.get_data(as_text=True)
    ioc_map = {}

    try:
        # Save text to output.txt
        with open(OUTPUT_FILE, "w") as file:
            file.write(text)

        # Read file contents
        with open(OUTPUT_FILE, "r") as file:
            file_content = file.read()

        # Call the IOC extraction API
        response = requests.post(
            IOC_EXTRACTOR_URL,
            headers={"Content-Type": "text/plain"},
            auth=auth,
            data=file_content
        )

        if response.status_code == 200:
            ioc_data = response.json()
            # print(f'ioc_data == {ioc_data}')  # Debug

            for item in ioc_data.get("data", []):
                threat = item.get("threat", {})
                indicator = threat.get("indicator", {})
                ioc_type = indicator.get("type")

                # Extract key based on type
                if ioc_type in ("ipv4-addr", "ipv6-addr"):
                    key = indicator.get("ip")
                elif ioc_type == "domain-name":
                    key = indicator.get("domain-name")
                elif ioc_type == "url":
                    key = indicator.get("url")
                elif ioc_type == "file":
                    hash_info = indicator.get("file", {}).get("hash", {})
                    key = hash_info.get("sha256") or hash_info.get("md5")
                elif ioc_type == "user-account":
                    key = indicator.get("user-account")
                elif ioc_type == "email-addr":
                    key = indicator.get("email", {}).get("address")

                if key:
                    ioc_map[key] = {
                        "type": ioc_type,
                        "data": indicator
                    }

            final_results = check_iocs_against_endpoints(ioc_map)
            # print(f"Final_Results: {type(final_results)}")
            # print(f"Final_Results: {final_results}")

            return jsonify(final_results), 200
        else:
            return jsonify({"error": "IOC extraction failed"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500


def check_iocs_against_endpoints(ioc_map):
    results = {}

    for ioc_value, details in ioc_map.items():
        results[ioc_value] = []  # Prepare a list to hold responses
        ioc_type = details["type"]

        BASE_URL = "http://127.0.0.1:5000"

        # Determine endpoints based on the IOC type
        if ioc_type in ("ipv4-addr", "ipv6-addr"):
            endpoints = [
                f"{BASE_URL}/oil",      
                f"{BASE_URL}/pdns",    
                f"{BASE_URL}/cbr",      
                f"{BASE_URL}/vpn"       
            ]
        elif ioc_type == "domain-name":
            endpoints = [
                f"{BASE_URL}/pdns",              
                f"{BASE_URL}/ldap",              
                f"{BASE_URL}/asset"              
            ]
        elif ioc_type == "url":
            endpoints = [
                f"{BASE_URL}/oil"        
            ]
        elif ioc_type == "email-addr":
            endpoints = [
                f"{BASE_URL}/oil/email"     
            ]
        elif ioc_type == "file":
            endpoints = [
                f"{BASE_URL}/cbr/binary/"        
            ]
        elif ioc_type == "user-account":
            endpoints = [
                f"{BASE_URL}/ldap"           
            ]
        else:
            endpoints = []

        # For each endpoint, make a call and store the result
        for endpoint in endpoints:
            try:
                url = f"{endpoint}/{ioc_value}"
                resp = requests.get(url, auth=auth,timeout=5)
                print(f"Response from {endpoint}: {resp.status_code}")  # Debug log
                if resp.status_code == 200:
                    data = resp.json()  
                    results[ioc_value].append({
                        "source": endpoint,
                        "hit": True,
                        "data": data
                    })
                else:
                    results[ioc_value].append({
                        "source": endpoint,
                        "hit": False,
                        "data": None,
                        "error": f"HTTP {resp.status_code}"
                    })
            except Exception as e:
                results[ioc_value].append({
                    "source": endpoint,
                    "hit": False,
                    "error": str(e)
                })
                

    # print(f"Final results: {json.dumps(results, indent=2)}")  # Debug log
    # Return the results for all IOCs
    return results


# Add a route to save search history
@app.route('/api/search-history', methods=['POST', 'OPTIONS'])
@login_required
def save_search_history():
    if request.method == 'OPTIONS':
        return '', 200
    
    data = request.get_json()
    
    if not data:
        return jsonify({"message": "No data provided"}), 400
        
    try:
        new_search = SearchHistory(
            user_id=current_user.id,
            query=data.get('query', ''),
            status=data.get('status', 'Completed'),
            result_data=data.get('data', {})
        )
       
       
        db.session.add(new_search)
        db.session.commit()
        
        return jsonify({"message": "Search history saved", "id": new_search.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error saving search history: {str(e)}"}), 500

# Add a route to get search history
@app.route('/api/search-history', methods=['GET', 'OPTIONS'])
@login_required
def get_search_history():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        # Get all records first
        all_history = db.session.query(SearchHistory).all()
        
        # Filter for current user
        user_history = [item for item in all_history if item.user_id == current_user.id]
        
        # Sort (newest first)
        user_history.sort(key=lambda x: x.timestamp, reverse=True)
        
        
        result = []
        for item in user_history:
            data = item.to_dict()
            # Add username from current_user 
            data['username'] = current_user.username
            result.append(data)
            
        return jsonify(result), 200
    except Exception as e:
        print(f"Error retrieving history: {str(e)}")
        return jsonify({"message": f"Error retrieving search history: {str(e)}"}), 500
    
# delete search history
@app.route('/api/search-history/clear', methods=['DELETE', 'OPTIONS'])
@login_required
def clear_search_history():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        # Get all records first 
        all_history = db.session.query(SearchHistory).all()
        
        # Filter for current user
        user_history = [item for item in all_history if item.user_id == current_user.id]
        

        # Delete each record
        for item in user_history:
            db.session.delete(item)
        
        # Commit the changes
        db.session.commit()
        
        return jsonify({"message": "Search history cleared successfully"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error clearing history: {str(e)}")
        return jsonify({"message": f"Error clearing search history: {str(e)}"}), 500
    
if __name__ == '__main__':
    
    app.run(port=7000, debug=True)