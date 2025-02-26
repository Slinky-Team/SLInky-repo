import re
import validators

from tld import get_tld, get_fld

from flask import request
from flask_restful import reqparse
from .auth import AuthenticatedResource

# Extract and refang a list of IOCs from free form text
class IOCExtractor(AuthenticatedResource):
    def __init__(self, internal_host_prefixes=[]):
        self.internal_host_prefixes = set()
        for prefix in internal_host_prefixes:
            self.internal_host_prefixes.add(prefix.lower())

    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('raw', default=None, location="args")
        args = parser.parse_args()
        
        if request.content_type == 'text/plain':
            text = request.data.decode('utf-8').rstrip()
        else:
            return { 'error' : "Content-type must be text/plain" }, 400

        data = self.extract_iocs(text)

        # Raw output just returns the IOCs
        if args.raw != None:
            data = [ x['threat']['indicator']['description'] for x in data ]

        if data:            
            return { 'data' : data }, 200
        else:
            return { 'data' : data }, 404

    def extract_iocs(self, text):
        # Some sets to avoid duplication of IOCs
        ips = set()
        urls = set()
        hostnames = set()
        emails = set()
        internal_hostnames = set()
        hashes = set()

        for line in text.split("\n"):
            # Strip leading/trailing whitespace
            line = line.strip()

            # Refang indicators
            line = self.refang(line)

            # Extract IPs
            #for ip in re.findall(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', line):
            # Make a regular expression
            # for validating an Ipv4
            ipv4 = '''(?:25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(?:
                        25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(?:
                        25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(?:
                        25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)'''
             
            # Make a regular expression
            # for validating an Ipv6
            ipv6 = '''(?:(?:[0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|
                    (?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:)
                    {1,6}:[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1
                    ,5}(?::[0-9a-fA-F]{1,4}){1,2}|(?:[0-9a-fA-F]{1,4}
                    :){1,4}(?::[0-9a-fA-F]{1,4}){1,3}|(?:[0-9a-fA-F]{
                    1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}|(?:[0-9a-fA
                    -F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}|[0-9a
                    -fA-F]{1,4}:(?:(?::[0-9a-fA-F]{1,4}){1,6})|:(?:(?::[0
                    -9a-fA-F]{1,4}){1,7}|:)|fe80:(?::[0-9a-fA-F]{0,
                    4}){0,4}%[0-9a-zA-Z]{1,}|::(?:ffff(?::0{1,4}){0,1}
                    :){0,1}(?:(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9
                    ])\.){3,3}(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0
                    -9])|(?:[0-9a-fA-F]{1,4}:){1,4}:(?:(?:25[0-5]|(?:2[0-4]
                    |1{0,1}[0-9]){0,1}[0-9])\.){3,3}(?:25[0-5]|(?:2[0-4]
                    |1{0,1}[0-9]){0,1}[0-9]))'''

            for ip in re.findall(ipv4, line):
                ips.add(ip)
            
            for ip in re.findall(ipv6, line):
                ips.add(ip)

            # Extract URLs
            if re.search(r'https?://', line):
                # http://blah.com/blah
                for url in re.findall(r'https?://\S+', line):
                    urls.add(url)
            else:
                # blah.com/blah
                for url in re.findall(r'[a-zA-Z0-9-\.]+\.[a-zA-Z]{2,}/\S+', line):
                    url = 'http://' + url
                    urls.add(url)

            # Extract hostnames
            for hostname in re.findall(r'[a-zA-Z0-9-\.]+\.[a-zA-Z]{2,}', line):
                hostnames.add(hostname)
            
            # Extract email addresses
            for email in re.findall(r'[\w\-\.\+]+@[a-zA-Z0-9-\.]+\.[a-zA-Z]{2,}', line):
                emails.add(email)

            # Extract internal hostnames
            for token in line.split():
                prefix = token[:4].lower()
                if prefix in self.internal_host_prefixes:
                    internal_hostnames.add(token)

            # Extract hashes
            # SHA256
            for hash in re.findall(r'\b[a-fA-F0-9]{64}\b', line):
                hashes.add(hash)
            # SHA1
            for hash in re.findall(r'\b[a-fA-F0-9]{40}\b', line):
                hashes.add(hash)
            # MD5
            for hash in re.findall(r'\b[a-fA-F0-9]{32}\b', line):
                hashes.add(hash)

        # Validate and return the data
        iocs = []
        for ip in ips:
            if validators.ipv4(ip):
                #iocs.append({'type' : 'ip', 'ioc' : ip})
                iocs.append({
                    'threat' : {
                        'indicator' : {
                            'ip' : ip,
                            'type' : 'ipv4-addr',
                            'description' : ip
                            }
                        }
                    })
            elif validators.ipv6(ip):
                iocs.append({
                    'threat' : {
                        'indicator' : {
                            'ip' : ip,
                            'type' : 'ipv4-addr',
                            'description' : ip
                            }
                        }
                    })
        
        for email in emails:
            username, hostname = email.split('@', 2)
            tld = get_tld(hostname, fail_silently=True, fix_protocol=True)
            fld = get_fld(hostname, fail_silently=True, fix_protocol=True)
            if not validators.domain(hostname) or not tld or not fld:
                continue
            iocs.append({
                'threat' : {
                    'indicator' : {
                        'email' : {
                            'address' : email
                        },
                        'type' : 'email-addr',
                        'description' : email
                        }
                    }
                })

        for url in urls:
            tld = get_tld(url, fail_silently=True)
            fld = get_fld(url, fail_silently=True)
            if not validators.url(url):
            #or not tld or not fld:
                continue
            else:
                iocs.append({
                    'threat' : {
                        'indicator' : {
                            'url' : url,
                            'type' : 'url',
                            'descrurltion' : url
                            }
                        }
                    })
                # Extract hostname from URL
                m = re.search(r'https?://([^/:]+)[/:]', url)
                if m:
                    hostname = m.group(1)
                    hostname = hostname.lower()
                    hostnames.add(hostname)

        for hostname in hostnames:
            hostname = hostname.lower()
            tld = get_tld(hostname, fail_silently=True, fix_protocol=True)
            fld = get_fld(hostname, fail_silently=True, fix_protocol=True)
            if not validators.domain(hostname) or not tld or not fld:
                continue
            else:
                iocs.append({
                    'threat' : {
                        'indicator' : {
                            'domain-name' : hostname,
                            'type' : 'domain-name',
                            'description' : hostname
                            }
                        }
                    })
        
        for hostname in internal_hostnames:
            hostname = hostname.lower()
            iocs.append({
                'threat' : {
                    'indicator' : {
                        'domain-name' : hostname,
                        'type' : 'domain-name',
                        'description' : hostname
                        }
                    }
                })

        for _hash in hashes:
            if len(_hash) == 32:
                iocs.append({
                    'threat' : {
                        'indicator' : {
                            'type' : 'file',
                            'description' : _hash,
                            'file' : {
                                'hash' : {
                                    'md5' : _hash
                                    }
                                }
                            }
                        }
                    })
            elif len(_hash) == 40:
                iocs.append({
                    'threat' : {
                        'indicator' : {
                            'type' : 'file',
                            'description' : _hash,
                            'file' : {
                                'hash' : {
                                    'sha1' : _hash
                                    }
                                }
                            }
                        }
                    })
            elif len(_hash) == 64:
                iocs.append({
                    'threat' : {
                        'indicator' : {
                            'type' : 'file',
                            'description' : _hash,
                            'file' : {
                                'hash' : {
                                    'sha256' : _hash
                                    }
                                }
                            }
                        }
                    })

        return iocs

    def refang(self, ioc):
        # Turn www[dot]site[dot]com into www.site.com
        ioc = ioc.replace("[dot]", ".")
        # Turn www(dot)site(dot)com into www.site.com
        ioc = ioc.replace("(dot)", ".")
        # Turn 1.2.3[,]4 into 1.2.3.4
        ioc = ioc.replace("[,]", ".")
        # Turn 1.2.3[.]4 into 1.2.3.4
        ioc = ioc.replace("[.]", ".")
        # Turn bad.guy .com into bad.guy.com
        ioc = ioc.replace(" .", ".")
        # Turn hxxp into http
        ioc = ioc.replace("hxxp", "http")
        return ioc
