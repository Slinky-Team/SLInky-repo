import json
import re
import redis

from flask import request
from flask_restful import reqparse
from .auth import AuthenticatedResource

# Handle an OIL request for assets.
#
# /asset?key=1.1.1.1
# /asset/1.1.1.1
# /asset/host
class AssetDB(AuthenticatedResource):
    def __init__(self, oil_conf=[]):
        return

    def get(self, key=None):
        parser = reqparse.RequestParser()
        # Key to search for
        parser.add_argument('key', action='append', default=[key], location='args')
        # Raw output or Elastic Common Schema
        parser.add_argument('raw', default=None, location='args')
        args = parser.parse_args()

        # Return raw results from the downstream API, or convert to ECS?
        schema = 'ecs' if args.raw == None else 'raw'

        data = self.oil_search(
                sources=['asset'],
                keys=args['key'],
                schema=schema
            )

        if data:            
            return { 'data' : data }, 200
        else:
            return { 'data' : data }, 404

    def post(self, key=None):
        # text/plain means we're in bulk mode and should receive a list of IPs.
        # Otherwise, handle it like a normal request where we expect form data.
        if request.content_type != 'text/plain':
            return self.get(key)

        # Bulk mode
        parser = reqparse.RequestParser()
        parser.add_argument('raw', default=None, location="args")
        args = parser.parse_args()

        keys = request.data.decode('utf-8').rstrip().split()

        # Return raw results from the downstream API, or convert to ECS?
        schema = 'ecs' if args.raw == None else 'raw'

        data = []
        data = self.oil_search(
                sources=['asset'],
                keys=keys,
                schema=schema
            )

        if data:
            return { 'data' : data }, 200
        else:
            return { 'data' : data }, 404

    # Search the OIL redis database and return the value of any key found.
    def oil_search(self, redis=None, sources=[], keys=[], schema=None):
        data = []
        for key in keys:
            if key.lower() == "server" or key.lower() == "server.example.com" or key == "10.0.0.1":
                data.append(json.loads("""
  {
    "host": {
      "name": "SERVER.EXAMPLE.COM",
      "ip": "10.0.0.1"
    },
    "platform": {
      "name": "Security Investigator",
      "owner": {
        "full_name": "Alice"
      },
      "executive": {
        "full_name": "Bob"
      }
    },
    "stack": {
      "name": "Cyber Defense",
      "owner": {
        "full_name": "Charlie"
      }
    },
    "event": {
      "created": "2024-05-07T00:00:00Z",
      "updated": "2025-01-15T00:00:00Z"
    }
  }
                """))
        return data        

