import geoip2.database

from flask import request
from flask_restful import reqparse
from .auth import AuthenticatedResource

# Handle a GeoIP request.
# /geo?ip=1.1.1.1&ip=2.2.2.2
# /geo/1.1.1.1
class GeoIP(AuthenticatedResource):
    def __init__(self, geoip_asn_file=None, geoip_country_file=None):
        # Load the MaxMind databases
        self.asndb = geoip2.database.Reader(geoip_asn_file)
        self.geodb = geoip2.database.Reader(geoip_country_file)

    def get(self, ip=None):
        parser = reqparse.RequestParser()
        parser.add_argument('ip', action='append', default=[ip], location="args")
        parser.add_argument('raw', default=None, location="args")

        args = parser.parse_args()

        # Return raw results from the downstream API, or convert to ECS?
        schema = 'ecs' if args.raw == None else 'raw'

        data = self.geoip_lookup(asndb=self.asndb, geodb=self.geodb,
                ips=args['ip'], schema=schema)

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

        data = self.geoip_lookup(asndb=self.asndb, geodb=self.geodb,
                ips=ips, schema=schema)

        if data:            
            return { 'data' : data }, 200
        else:
            return { 'data' : data }, 404

    # Lookup a list of IPs in the MaxMind GeoIP database.  Return output in
    # Elastic Common Schema.
    def geoip_lookup(self, asndb=None, geodb=None, ips=[], schema=None):
        data = []
        for ip in ips:
            try:
                response = asndb.asn(ip)
                org = response.autonomous_system_organization.replace(',', '')
                asn = response.autonomous_system_number
            except:
                org = ''
                asn = ''
            try:
                response = geodb.country(ip)
                country_name = response.country.name
                country_code = response.country.iso_code
            except:
                country_name = ''
                country_code = ''

            if not asn and not country_code:
                # Probably bad input
                continue

            if schema == 'ecs':
                data.append({
                    'host' : { 'ip' : [ ip ] },
                    'as' : {
                        'number' : asn,
                        'organization' : {
                            'name' : org
                        },
                    },
                    'geo' : {
                        'country_iso_code' : country_code,
                        'country_name' : country_name
                    }
                })
            else:
                data.append({
                    'autonomous_system_organization' : org,
                    'autonomous_system_number' : asn,
                    'country' : {
                        'name' : country_name,
                        'iso_code' : country_code,
                    }
                })

        return data
