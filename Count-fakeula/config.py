
# The Count-SOCula API users and associated tokens
auth_tokens = {
    'user' : 'pass'
}

# OIL sources
oil_conf = []

geoip_country_file = 'GeoLite2-Country.mmdb'
geoip_asn_file = 'GeoLite2-ASN.mmdb'

vpn_check_server = None
vpn_check_port = None
vpn_database = None
vpn_http_url = None
vpn_http_username = None
vpn_http_password = None

# CBR API creds go in /etc/carbonblack/credentials.response within the container
cbr_profiles = [ 'server', 'workstation', 'server2' ]

# The IOC extractor will recognize strings starting with these prefixes as
# hostnames even if they don't have a fully qualified name
internal_host_prefixes = [
    'desk', 'work', 'lap'
]

# LDAP credentials to search Active Directory
ldap_user = None
ldap_pass = None
ldap_server = None
ldap_port = None
ldap_use_ssl = None
ldap_verify = None

# API Key to authentication to FarSight
farsight_api_key = None
