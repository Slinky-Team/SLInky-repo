# Skeleton endpoint module to serve as a starting point for new modules.

from flask import request
from flask_restful import reqparse
from .auth import AuthenticatedResource

class Skeleton(AuthenticatedResource):
    def __init__(self, arg1=None, arg2=None):
        # Add any class initialization here
        return

    # Handle get requests
    def get(self, param1=None):
        parser = reqparse.RequestParser()
        parser.add_argument('param1', action='append', default=[param1], location="args")
        parser.add_argument('raw', default=None, location="args")
        args = parser.parse_args()

        # Return raw results from the downstream API, or convert to ECS?
        schema = 'ecs' if args.raw == None else 'raw'

        data = self.do_something(args['param1'], schema=schema)

        if data:            
            return { 'data' : data }, 200
        else:
            return { 'data' : data }, 404
    
    # Handle post requests
    def post(self, param1=None):
        # text/plain means we're in bulk mode and should receive a list of items.
        # Otherwise, handle it like a normal request where we expect form data.
        if request.content_type != 'text/plain':
            return self.get(param1)

        # Bulk mode
        parser = reqparse.RequestParser()
        parser.add_argument('raw', default=None, location="args")
        args = parser.parse_args()
        
        params = request.data.decode('utf-8').rstrip().split()

        # Return raw results from the downstream API, or convert to ECS?
        schema = 'ecs' if args.raw == None else 'raw'

        data = self.do_something(params, schema=schema)

        if data:            
            return { 'data' : data }, 200
        else:
            return { 'data' : data }, 404

    # Lookup routine goes here
    def do_something(self, params=[]):
        data = []
        return data
