#!/bin/python3

# API to serve various data sources for SOC tools.

# Add our current path to the system path for searching for modules
import sys
sys.path.insert(0, '/app')


import argparse
import waitress

from flask import Flask, request
from flask_restful import Resource, Api, reqparse
from flask_httpauth import HTTPBasicAuth

from config import *
from endpoints import *

# Enable logging for waitress
import logging
logging.getLogger('waitress').setLevel(logging.INFO)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument("-d", "--debug", action='store_true',
            help="Run in debug mode")
    parser.add_argument("-p", "--port", type=int,
            help="Port to listen on (default 5000 for production or 7000 for debug)")
    args = parser.parse_args()
    app = Flask(__name__)
    api = Api(app)

    print("Adding Flask API resources")

    api.add_resource(
        oil.Oil,
        '/oil', '/oil/<string:key>', '/oil/<string:source>/<string:key>',
            resource_class_kwargs={'oil_conf' : oil_conf}
        )
    api.add_resource(
            geo.GeoIP,
            '/geo', '/geo/<string:ip>',
            resource_class_kwargs={
                'geoip_asn_file' : geoip_asn_file,
                'geoip_country_file' : geoip_country_file
            }
        )
    api.add_resource(
            vpn.VPN,
            '/vpn', '/vpn/<string:ip>',
            resource_class_kwargs={
                'vpn_check_server' : vpn_check_server,
                'vpn_check_port' : vpn_check_port,
                'vpn_database' : vpn_database,
                'vpn_http_url' : vpn_http_url,
                'vpn_http_username' : vpn_http_username,
                'vpn_http_password' : vpn_http_password,
            }
        )
    # function can be "summary" to return only a count of results
    api.add_resource(
            pdns.PassiveDNS,
            '/pdns', '/pdns/<string:ip_or_host>',
            '/pdns/<string:ip_or_host>/_<string:function>',
            resource_class_kwargs={
                'farsight_api_key' : farsight_api_key
            }
        )
    api.add_resource(
            cbr.CarbonBlackResponse,
            '/cbr', '/cbr/<string:ioc>',
            '/cbr/<string:query_type>',
            '/cbr/<string:query_type>/<string:ioc>',
            resource_class_kwargs={
                'profiles' : cbr_profiles,
                'internal_host_prefixes' : internal_host_prefixes
            }
        )
    
    api.add_resource(
        extract.IOCExtractor, '/extract',
        resource_class_kwargs={'internal_host_prefixes' : internal_host_prefixes}
    )
    api.add_resource(
            ldap.LDAPLookup, '/ldap', '/ldap/<string:key>',
            resource_class_kwargs={
                'ldap_user' : ldap_user,
                'ldap_pass' : ldap_pass,
                'ldap_server' : ldap_server,
                'ldap_verify' : ldap_verify
            }
    )
    api.add_resource(
        asset.AssetDB,
        '/asset', '/asset/<string:key>',
        # The asset DB isn't technically OIL, but it's in the same Redis
        resource_class_kwargs={'oil_conf' : oil_conf}
    )

    print("Starting API...", flush=True)

    if args.debug:
        port = args.port if args.port else 7000
        app.run(port=port, host='0.0.0.0', debug=True)
    else:
        port = args.port if args.port else 5000

        # To enable transaction (http access) logging
        from paste.translogger import TransLogger
        waitress.serve(
            TransLogger(
                app,
                setup_console_handler=True,
            ),
            # Listen on all interfaces
            host='0.0.0.0',
            port=port
        )

