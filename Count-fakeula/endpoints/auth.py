from flask_restful import Resource
from flask_httpauth import HTTPBasicAuth

from config import *

auth = HTTPBasicAuth()

# Function to validate a username and password
@auth.verify_password
def verify_password(user, token):
    if user in auth_tokens and token == auth_tokens[user]:
        return user

class AuthenticatedResource(Resource):
    decorators = [auth.login_required]
