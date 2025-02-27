import ipaddress
import json

from flask_restful import reqparse
from .auth import AuthenticatedResource

class PassiveDNS(AuthenticatedResource):
    """
    Perform a FarSight DNSDB passive DNS lookup.
    """
    def __init__(self, farsight_api_key=None):
        return

    def get(self, ip_or_host=None, function=None):
        parser = reqparse.RequestParser()
        parser.add_argument('ip', action='append', default=[], location="args")
        parser.add_argument('host', action='append', default=[], location="args")
        parser.add_argument('limit', type=int, default=100, location="args")
        parser.add_argument('raw', default=None, location="args")
        args = parser.parse_args()

        summarize = False
        if function == 'summary':
            summarize = True
        elif function:
            return { 'error' : f'Invalid URI path /_{function}' }, 400

        # Return raw results from the downstream API, or convert to ECS?
        schema = 'ecs' if args.raw == None else 'raw'

        # Did we get a URI string argument?  E.g.
        #   /pdns/1.1.1.1
        #   /pdns/www.example.com
        #   /pdns/1.1.1.1/_summary
        if ip_or_host:
            # Check to see if this is a valid IP
            try:
                ip = ipaddress.ip_address(ip_or_host)
                data = self.pdns_query(ips=[ip_or_host],
                        summarize=summarize, limit=args.limit,
                    )
            except:
                # If ipaddress.ip_address() threw an exception, this must be a
                # hostname instead.
                data = self.pdns_query(hosts=[ip_or_host],
                        summarize=summarize, limit=args.limit,
                    )
        else:
            # Must be keyword arguments. E.g.
            # /pdns?ip=1.1.1.1&ip=8.8.8.8&host=www.example.com
            data = self.pdns_query(ips=args['ip'], hosts=args['host'],
                    summarize=summarize, limit=args.limit,
                )
        
        if data:            
            return { 'data' : data }, 200
        else:
            return { 'data' : data }, 404

    def post(self, ip_or_host=None, function=None):
        return self.get(ip_or_host, function)

    def pdns_query(self, ips=[], hosts=[], summarize=False, limit=100):
        """Return FarSight API results in Elastic Common Schema normalized
           form"""
        data = []
        print("pdns_query", ips, hosts)
        for ip in ips:
            if ip == '1.2.3.4':
                if summarize:
                    data = json.loads("""
                    [{"host":{"ip":["1.2.3.4"]},"count":728573,"num_results":10000,"event":{"start":"2010-04-09T20:52:29Z","end":"2025-01-23T01:15:53Z"}}]
                    """)
                else:
                    data = json.loads("""
                    [{"dns":{"answers":[{"data":"1.2.3.4","name":"a.internal-test-ignore.biz","type":"A","count":1346,"event":{"start":"2019-11-06T22:54:18Z","end":"2025-01-23T00:23:21Z"}},{"data":"1.2.3.4","name":"b.internal-test-ignore.biz","type":"A","count":1346,"event":{"start":"2019-11-06T22:54:18Z","end":"2025-01-23T00:23:21Z"}},{"data":"1.2.3.4","name":"ns1.37cw.com","type":"A","count":1,"event":{"start":"2023-03-11T22:50:20Z","end":"2023-03-11T22:50:20Z"}},{"data":"1.2.3.4","name":"ns2.37cw.com","type":"A","count":1,"event":{"start":"2023-03-11T22:50:20Z","end":"2023-03-11T22:50:20Z"}},{"data":"1.2.3.4","name":"ns1.45mov.com","type":"A","count":1,"event":{"start":"2023-03-11T22:50:20Z","end":"2023-03-11T22:50:20Z"}}]}}]
                    """)
        
        for host in hosts:
            if host == 'a.internal-test-ignore.biz':
                if summarize:
                    data = json.loads("""
                    [{"host":{"name":["a.internal-test-ignore.biz"]},"event":{"start":"2012-12-05T19:25:28Z","end":"2025-01-22T12:10:18Z"},"count":53878,"num_results":3}]
                    """)
                else:
                    data = json.loads("""
                    [{"dns":{"answers":[{"data":"1.2.3.4","name":"a.internal-test-ignore.biz","type":"A","count":1346,"event":{"start":"2019-11-06T22:54:18Z","end":"2025-01-23T00:23:21Z"}},{"data":"1.2.3.4","name":"a.internal-test-ignore.biz","type":"A","count":1736,"event":{"start":"2012-05-09T01:02:10Z","end":"2017-09-18T01:02:53Z"}},{"data":"1.2.3.4","name":"a.internal-test-ignore.biz","type":"A","count":50796,"event":{"start":"2012-12-05T19:25:28Z","end":"2025-01-22T12:10:18Z"}}]}}]
                    """)
        return data
