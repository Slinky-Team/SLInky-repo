import json
import re

from flask import request
from flask_restful import reqparse
from .auth import AuthenticatedResource

class LDAPLookup(AuthenticatedResource):
    def __init__(self, ldap_user=None, ldap_pass=None, ldap_server=None, ldap_port=636, ldap_use_ssl=True, ldap_verify=None):
        return

    # Handle get requests
    def get(self, key=None):
        parser = reqparse.RequestParser()
        parser.add_argument('key', action='append', default=[key], location="args")
        parser.add_argument('raw', default=None, location="args")
        args = parser.parse_args()

        # Return raw attributess from the downstream API, or convert to ECS?
        schema = 'ecs' if args.raw == None else 'raw'

        data = self.ldap_lookup(args['key'], schema=schema)

        if data:            
            return { 'data' : data }, 200
        else:
            return { 'data' : data }, 404
    
    # Handle post requests
    def post(self, key=None):
        # text/plain means we're in bulk mode and should receive a list of items.
        # Otherwise, handle it like a normal request where we expect form data.
        if request.content_type != 'text/plain':
            return self.get(key)

        # Bulk mode
        parser = reqparse.RequestParser()
        parser.add_argument('raw', default=None, location="args")
        args = parser.parse_args()
        
        keys = request.data.decode('utf-8').rstrip().split()

        # Return raw attributess from the downstream API, or convert to ECS?
        schema = 'ecs' if args.raw == None else 'raw'

        data = self.ldap_lookup(keys, schema=schema)

        if data:            
            return { 'data' : data }, 200
        else:
            return { 'data' : data }, 404

    # Lookup routine goes here
    def ldap_lookup(self, keys=[], schema='ecs'):
        data = []
        for key in keys:
            if key in ['abob', 'alice.bob@example.com']:
                data = json.loads("""
[
    {
      "user": {
        "email": "alice.bob@example.com",
        "full_name": "Alice Bob",
        "name": "abob",
        "title": "CISO",
        "company": "Example Corp",
        "phone": "+1 (555) 555-5555",
        "mobile": "+1 (555) 777-7777",
        "created": "2015-01-01 20:00:00+00:00",
        "manager": "CN=Bob Charlie (Example-Atlanta) bcharlie,OU=Users,OU=Standard Users,OU=Users and Computers,OU=Atlanta,OU=Example,DC=DOMAIN,DC=EXAMPLE,DC=com",
        "age": 8692
      }
    }
  ]
                """)
        return data
