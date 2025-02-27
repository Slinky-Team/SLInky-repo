import json
import redis

from flask import request
from flask_restful import reqparse
from .auth import AuthenticatedResource

# Handle an OIL request.
#
# Search all sources:
# /oil?key=1.1.1.1
#
# Search a specific source:
# /oil?source=okta&key=1.1.1.1
#
# Search multiple sources and multiple keys:
# /oil?source=azure&source=dhcp&key=1.1.1.1&key=2.2.2.2
#
# Search a single source and key:
# /oil/citrix/1.1.1.1
#
# Search all sources for a single key:
# /oil/1.1.1.1
class Oil(AuthenticatedResource):
    def __init__(self, oil_conf=[]):
        dummy_data = json.loads("""
[
    {"callerIpAddress":"1.2.3.4","coxAccountName":"abob","userPrincipalName":"alice.bob@example.com","userDisplayName":"Alice Bob","displayName":"laptop1","client":{"as_org":"ASN-ACME","ip":"1.2.3.4","asn":1234},"timestamp":"2025-01-23T21:15:51.439Z","key":"1.2.3.4","oil":"azure","testMsg":"Yipee!!"},
    {"callerIpAddress":"1.2.3.4","coxAccountName":"abob","userPrincipalName":"alice.bob@example.com","userDisplayName":"Alice Bob","displayName":"laptop1","client":{"as_org":"ASN-ACME","ip":"1.2.3.4","asn":1234},"timestamp":"2025-01-23T21:15:51.439Z","key":"abob","oil":"azure"},
    {"callerIpAddress":"1.2.3.4","coxAccountName":"abob","userPrincipalName":"alice.bob@example.com","userDisplayName":"Alice Bob","displayName":"laptop1","client":{"as_org":"ASN-ACME","ip":"1.2.3.4","asn":1234},"timestamp":"2025-01-23T21:15:51.439Z","key":"alice.bob@example.com","oil":"azure"},
    {"event":{"start":"2025-01-23T21:12:52.566Z","type":"access","module":"azure","outcome":"success","category":"authentication"},"@timestamp":"2025-01-23T21:12:52.566Z","user":{"full_name":"Alice Bob","email":"alice.bob@example.com","name":"abob"},"host":{"os":{"family":"Windows10"},"name":"laptop1"},"source":{"ip":"1.2.3.4"},"megaoil":{"pipeline":"coxsight"},"timestamp":"2025-01-23T21:12:52.566Z","key":"1.2.3.4","oil":"coxsight"},
    {"event":{"start":"2025-01-23T21:12:52.566Z","type":"access","module":"azure","outcome":"success","category":"authentication"},"@timestamp":"2025-01-23T21:12:52.566Z","user":{"full_name":"Alice Bob","email":"alice.bob@example.com","name":"abob"},"host":{"os":{"family":"Windows10"},"name":"laptop1"},"source":{"ip":"1.2.3.4"},"megaoil":{"pipeline":"coxsight"},"timestamp":"2025-01-23T21:12:52.566Z","key":"laptop1","oil":"coxsight"},
    {"fqdn":"workstation1.corp.cox.com","macAddress":"001122334455","@timestamp":"2025-01-23T19:24:58.000Z","description":"Renew","hostname":"workstation1","sourceIP":"10.0.0.2","megaoil":{"pipeline":"megaoil_dhcp"},"timestamp":"2025-01-23T19:24:58.000Z","key":"10.0.0.2","oil":"dhcp"},
    {"megaoil":{"pipeline":"megaoil_xdr"},"event":{"module":"defender_xdr"},"user":{"target":{}},"source":{"ip":"1.2.3.4"},"email":{"to":{"address":"alice.bob@example.com"},"from":{"address":"charlie@example.com"},"subject":"Re: Dinner"},"@timestamp":"2025-01-23T21:04:50.000Z","timestamp":"2025-01-23T21:04:50.000Z","key":"1.2.3.4","oil":"email"},
    {"megaoil":{"pipeline":"megaoil_xdr"},"event":{"module":"defender_xdr"},"user":{"target":{}},"source":{"ip":"1.2.3.4"},"email":{"to":{"address":"alice.bob@example.com"},"from":{"address":"charlie@example.com"},"subject":"Re: Dinner"},"@timestamp":"2025-01-23T21:04:50.000Z","timestamp":"2025-01-23T21:04:50.000Z","key":"alice.bob@example.com","oil":"email"},
    {"megaoil":{"pipeline":"megaoil_xdr"},"event":{"module":"defender_xdr"},"user":{"target":{}},"source":{"ip":"1.2.3.4"},"email":{"to":{"address":"alice.bob@example.com"},"from":{"address":"charlie@example.com"},"subject":"Re: Dinner"},"@timestamp":"2025-01-23T21:04:50.000Z","timestamp":"2025-01-23T21:04:50.000Z","key":"charlie@example.com","oil":"email"},
    {"observer":{"hostname":"sensor1"},"destination":{"port":"161","threat":{"indicator":{"Classification":"Unclassified","Service_Name":"UNCLASSIFIED"}},"as":{},"ip":"5.6.7.8"},"event":{"message":"Security Alert"},"Suricata":{"Signature":"1234567"},"network":{"protocol":"UDP"},"source":{"port":"46971","threat":{"indicator":{"Classification":"Residential Proxy","Service_Name":"Unknown"}},"as":{"organization":{"name":"ASN-ACME"},"number":1234},"geo":{"country_iso_code":"US","city_name":"Atlanta"},"ip":"1.2.3.4"},"megaoil":{"pipeline":"megaoil_helios"},"@timestamp":"2025-01-23T21:12:09.000Z","tags":["megaoil_helios"],"timestamp":"","key":"1.2.3.4","oil":"helios"},
    {"network":{"transport":"UDP"},"source":{"address":"10.0.0.1","ip":"10.0.0.1","port":"53015"},"destination":{"address":"1.2.3.4","ip":"1.2.3.4","port":"25762"},"event":{"start":"2025-01-23T21:05:00Z","end":"2025-01-23T21:09:59Z"},"key":"1.2.3.4","oil":"netflow"},
    {"client":{"ipAddress":"1.2.3.4"},"actor":{"alternateId":"alice.bob@example.com","displayName":"Alice Bob"},"target":[{"id":"00u1n4jhllk8fwWUR0h8","detailEntry":null,"type":"User","displayName":"Alice Bob","alternateId":"alice.bob@example.com"}],"timestamp":"2025-01-23T21:09:06.518Z","displayMessage":"User logout from Okta","key":"1.2.3.4","oil":"okta"},
    {"client":{"ipAddress":"1.2.3.4"},"actor":{"alternateId":"alice.bob@example.com","displayName":"Alice Bob"},"target":[{"id":"00u1n4jhllk8fwWUR0h8","detailEntry":null,"type":"User","displayName":"Alice Bob","alternateId":"alice.bob@example.com"}],"timestamp":"2025-01-23T21:09:06.518Z","displayMessage":"User logout from Okta","key":"alice.bob@example.com","oil":"okta"},
    {"network":{"transport":"icmp","application":"icmp"},"@timestamp":"2025-01-23T18:50:47.754Z","tags":["megaoil_prisma"],"rule":{"name":"intrazone-default"},"threat":{"indicator":{}},"source":{"geo":{"country_iso_code":"US","city_name":"Atlanta"},"port":"0","ip":"1.2.3.4","packets":"1","bytes":"158","as":{"organization":{"name":"ASN-ACME"},"number":1234}},"event":{"sequence":"7458713440516515611","action":"allow"},"megaoil":{"pipeline":"megaoil_prisma"},"destination":{"ip":"8.8.8.8","port":"0","packets":"0","bytes":"0","as":{"organization":{"name":"ASN-ACME"},"number":1234}},"timestamp":"2025-01-23T18:50:47.754Z","key":"1.2.3.4","oil":"prisma"},
    {"observer":{"hostname":"sensor2"},"tags":["megaoil_suricata"],"Suricata":{"Signature":"2009702"},"destination":{"ip":"172.16.0.1","port":"53"},"source":{"threat":{"indicator":{"Classification":"Residential Proxy","Service_Name":"Unknown"}},"port":"14858","geo":{"city_name":"Atlanta","country_iso_code":"US"},"as":{"organization":{"name":"ASN-ACME"},"number":1234},"ip":"1.2.3.4"},"event":{"message":"ET POLICY DNS Update From External net"},"megaoil":{"pipeline":"megaoil_suricata"},"network":{"protocol":"UDP"},"@timestamp":"2025-01-23T21:15:17.000Z","timestamp":"","key":"1.2.3.4","oil":"suricata"}
]
        """)
            
        self.dummy_lookup_table = {}
        self.sources = []
        for item in dummy_data:
            oil_key = item['key']
            oil_source = item['oil']
            self.sources.append(oil_source)
            key = ':'.join([oil_source, oil_key])
            self.dummy_lookup_table[key] = item

    def get(self, source=[], key=None):

        # TEST CODE #######
        print(f"OIL MESSAGE REACHED {source=}")

        # Source needs to be a list
        if isinstance(source, str):
            source = [source]
        parser = reqparse.RequestParser()
        # Data source, e.g. citrix, azure, or okta
        parser.add_argument('source', action='append', default=source, location="args")
        # Key to search for
        parser.add_argument('key', action='append', default=[key], location="args")
        # Raw output or Elastic Common Schema
        parser.add_argument('raw', default=None, location="args")
        args = parser.parse_args()

        # Return raw results from the downstream API, or convert to ECS?
        schema = 'ecs' if args.raw == None else 'raw'

        data = self.oil_search(
                sources=args.source,
                keys=args.key,
                schema=schema
            )

        if data:            
            return { 'data' : data }, 200
        else:
            return { 'data' : data }, 404

    def post(self, source=[], key=None):
        # Source needs to be a list
        if isinstance(source, str):
            source = [source]
        parser = reqparse.RequestParser()
        # Data source, e.g. citrix, azure, or okta
        parser.add_argument('source', action='append', default=source, location="args")
        # Key to search for
        parser.add_argument('key', action='append', default=[key], location="args")
        # Raw output or Elastic Common Schema
        parser.add_argument('raw', default=None, location="args")
        args = parser.parse_args()

        # Return raw results from the downstream API, or convert to ECS?
        schema = 'ecs' if args.raw == None else 'raw'

        # text/plain means we're in bulk mode and should receive a list of IPs.
        # Otherwise, handle it like a normal request where we expect form data.
        if request.content_type != 'text/plain':
            return self.get(source=source, key=key)

        keys = request.data.decode('utf-8').rstrip().split()

        data = self.oil_search(
                sources=args.source,
                keys=keys,
                schema=schema
            )

        if data:
            return { 'data' : data }, 200
        else:
            return { 'data' : data }, 404

    def oil_search(self, redis=None, sources=[], keys=[], schema=None):
        # If we weren't given a specific source, check all of them
        if not sources:
            sources = self.sources

        data = []
        for source in sources:
            for key in keys:
                combined_key = ':'.join([source, key])
                print(f"{combined_key}")
                if combined_key in self.dummy_lookup_table:
                    data.append(self.dummy_lookup_table[combined_key])
        return data