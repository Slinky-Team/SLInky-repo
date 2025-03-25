# Carbon Black Response query endpoint

from flask import request
from flask_restful import reqparse
from .auth import AuthenticatedResource

import ipaddress
import re
import json

class CarbonBlackResponse(AuthenticatedResource):
    def __init__(self, profiles=[], internal_host_prefixes=[]):
        return

    # Handle get requests
    def get(self, query_type='process', ioc=None):
        parser = reqparse.RequestParser()
        parser.add_argument('ip', action='append', default=[], location="args")
        parser.add_argument('domain', action='append', default=[], location="args")
        parser.add_argument('sensor', action='append', default=[], location="args")
        parser.add_argument('file_hash', action='append', default=[], location="args")
        parser.add_argument('start', default=None, location="args")
        parser.add_argument('end', default=None, location="args")
        parser.add_argument('raw', default=None, location="args")
        parser.add_argument('limit', default=10, location="args")
        args = parser.parse_args()

        # Return raw results from the downstream API, or convert to ECS?
        schema = 'ecs' if args.raw == None else 'raw'

        ips = []
        md5_hashes = []
        sha256_hashes = []
        domains = []
        sensors = []
        data = []

        # Did we get an IOC as part of the URI path rather than a list of
        # parameters?  If so, we need to figure out what type of IOC it is.
        if ioc:
            # Regular expressions for file hashes
            md5 = r'^[a-fA-F0-9]{32}$'
            sha1 = r'^[a-fA-F0-9]{40}$'
            sha256 = r'^[a-fA-F0-9]{64}$'

            # Is it an IP?
            if self.is_ip(ioc):
                ips = [ioc]
            # Is it a hash?
            elif re.match(md5, ioc):
                md5_hashes=[ioc]
            elif re.match(sha1, ioc):
                return {
                    'error' : f'{ioc} looks like a sha1 hash.  CBR only supports md5 and sha256.'
                    }, 400
            elif re.match(sha256, ioc):
                sha256_hashes=[ioc]
            else:
                # Must be a domain
                domains=[ioc]

        # Split file_hashes up into md5 and sh256
        for file_hash in args['file_hash']:
            if re.match(md5, ioc):
                md5_hashes.append(file_hash)
            elif re.match(sha1, ioc):
                return {
                    'error' : f'{ioc} looks like a sha1 hash.  CBR only supports md5 and sha256.'
                    }, 400
            elif re.match(sha256, ioc):
                sha256_hashes.append(file_hash)

        # Set the query type appropriately if we have sensors
        if args['sensor']:
            sensors = args['sensor']
            query_type = 'sensor'

        # Run queries based on the requested or inferred query type
        if query_type == 'binary':
            if len(md5_hashes) == 0 and len(sha256_hashes) == 0:
                return {
                    'error' : 'Binary query requires at least one MD5 or SHA-256 hash.'
                }, 400
            if '3B26493A5BADBA73D08DE156E13F5FD16D56B750585182605E81744247D2C5BD' in sha256_hashes or 'F88ADB10AB5313D4FA33416F6F5FB4FF' in md5_hashes:
                data = json.loads("""
[
    {
      "file": {
        "hash": {
          "md5": "F88ADB10AB5313D4FA33416F6F5FB4FF"
        },
        "name": "ysoserial.exe",
        "accessed": "2022-04-27T11:50:32.029Z",
        "hosts": [
          {
            "name": "host1",
            "id": "17864"
          }
        ],
        "code_signature": {
          "exists": false
        }
      },
      "labels": {
        "url": "https://cbr.example.com/#/binary/F88ADB10AB5313D4FA33416F6F5FB4FF"
      }
    }
  ]
                """)

        elif query_type == 'process':
            if '1.2.3.4' in ips:
                data = json.loads("""
[
    {
      "process": {
        "command_line": "/usr/local/java/java_base/bin/java -Dp=executionserver -server -d64 -verbose:gc",
        "entity_id": "00003094-0000-13ad-01d8-6a476fb04ab2",
        "executable": "/bw/local/java/jdk1.8.0_312/bin/java",
        "name": "java",
        "pid": 5037,
        "start": "2022-05-17T23:40:05.647Z",
        "uptime": 53818,
        "hash": {
          "md5": "fb8b6d549055579989a7184077408342"
        },
        "parent": {
          "name": "bash",
          "pid": 5028,
          "entity_id": "00003094-0000-13a4-01d8-6a476faec8c6-000000000001"
        },
        "user": {
          "name": "alice",
          "id": null
        },
        "host": {
          "name": "host1",
          "type": "workstation",
          "ip": [
            "192.168.0.1"
          ],
          "os": {
            "family": "linux"
          }
        },
        "code_signature": {
          "exists": false
        }
      },
      "labels": {
        "url": "https://cbr.example.com/#/analyze/00003094-0000-13ad-01d8-6a476fb04ab2/1652830876949?cb.legacy_5x_mode=false"
      }
    }
  ]
                """)

        elif query_type == 'sensor':
            if 'host1' in domains or '192.168.0.1' in ips:
                data = json.loads("""
    [
        {
            "sensor": {
                "hostname": "host1",
                "id": 78065,
                "ip": [
                    "192.168.0.1"
                ],
                "mac": [
                    "00:00:00:00:00:01"
                ],
                "name": "host1.example.com",
                "uptime": 593924,
                "os": {
                    "full": "Windows 10 Enterprise, 64-bit",
                    "version": "007.003.000.18311"
                }
            },
            "labels": {
                "url": "https://cbr.example.com/#/host/78065"
            }
        }
    ]
                """)
        else:
            return {
                'error' : f'Invalid query type {query_type}.  Query type must be "process", "binary", or "sensor"'
            }, 400

        if data:            
            return { 'data' : data }, 200
        else:
            return { 'data' : data }, 404

    def is_ip(self, ip):
        """Check to see if something is an IP or not"""
        try:
            ip = ipaddress.ip_address(ip)
            return True
        except:
            return False
