import json

from flask import request
from flask_restful import reqparse
from .auth import AuthenticatedResource

import requests
from requests.auth import HTTPBasicAuth

class VPN(AuthenticatedResource):
    def __init__(self, vpn_check_server=None, vpn_check_port=None, vpn_database=None, vpn_http_url=None, vpn_http_password=None, vpn_http_username=None):
        return


    def get(self, ip=None):
        parser = reqparse.RequestParser()
        parser.add_argument('ip', action='append', default=[ip], location="args")
        parser.add_argument('raw', default=None, location="args")
        args = parser.parse_args()

        # Return raw results from the downstream API, or convert to ECS?
        schema = 'ecs' if args.raw == None else 'raw'

        data = self.vpn_check_via_database(args['ip'], schema=schema)

        if data:            
            return { 'data' : data }, 200
        else:
            return { 'data' : data }, 404

    def post(self, ip=None):
        # text/plain means we're in bulk mode and should receive a list of IPs.
        # Otherwise, handle it like a normal request where we expect form data.
        if request.content_type != 'text/plain':
            return self.get(ip)

        # Bulk mode
        parser = reqparse.RequestParser()
        parser.add_argument('raw', default=None, location="args")
        args = parser.parse_args()

        ips = request.data.decode('utf-8').rstrip().split()

        # Return raw results from the downstream API, or convert to ECS?
        schema = 'ecs' if args.raw == None else 'raw'

        data = self.vpn_check_via_database(ips, schema=schema)
        
        if data:            
            return { 'data' : data }, 200
        else:
            return { 'data' : data }, 404

    # Lookup in the local ip2proxy database
    def vpn_check_via_database(self, ips, schema):
        data = []
        for ip in ips:
            if ip == '1.2.3.4':
                data.append(json.loads("""
                    {"host": {"ip": ["1.2.3.4"]}, "network": {"application": "VPN", "name": "Private Internet Access"}, "geo": {"city_name": "Houston", "country_iso_code": "US", "country_name": "United States of America", "region_name": "Texas"}, "as": {"number": "212238", "organization": {"name": "DataCamp Limited"}}}
                """))
            if ip == '8.8.8.8':
                data.append(json.loads("""
                    {"host": {"ip": ["8.8.8.8"]}, "network": {"application": "DCH", "name": "-"}, "geo": {"city_name": "Mountain View", "country_iso_code": "US", "country_name": "United States of America", "region_name": "California"}, "as": {"number": "15169", "organization": {"name": "Google LLC"}}}
                """))
        return data
