# Count FAKEula

## Installation/Usage

```
unzip count-fakeula-2025-01-24.zip
cd count-fakeula
python3 -m venv venv
source venv/bin/activate
pip install –r requirements.txt
python main.py -d
```

# Example Queries

## IOC extraction

```
curl -s -u user:pass -XPOST -H 'Content-Type: text/plain' http://localhost:7000/extract --data-binary @test-input.txt
```

## Observed Indicator List (OIL)

### Azure authentication logs

```
curl -s -u 'user:pass' http://localhost:7000/oil/azure/1.2.3.4
curl -s -u 'user:pass' http://localhost:7000/oil/azure/abob
curl -s -u 'user:pass' http://localhost:7000/oil/azure/alice.bob@example.com
```

### CoxSight (passively generated asset inventory from security logs)

```
curl -s -u 'user:pass' http://localhost:7000/oil/coxsight/1.2.3.4
curl -s -u 'user:pass' http://localhost:7000/oil/coxsight/laptop1
```

### Email

```
curl -s -u 'user:pass' http://localhost:7000/oil/email/1.2.3.4
curl -s -u 'user:pass' http://localhost:7000/oil/email/alice.bob@example.com
curl -s -u 'user:pass' http://localhost:7000/oil/email/charlie@example.com
```

### Helios/Suricata (intrusion detection systems)

```
curl -s -u 'user:pass' http://localhost:7000/oil/helios/1.2.3.4
curl -s -u 'user:pass' http://localhost:7000/oil/suricata/1.2.3.4
```

### Netflow (enterprise network traffic)

```
curl -s -u 'user:pass' http://localhost:7000/oil/netflow/1.2.3.4
```

### Okta authentication logs

```
curl -s -u 'user:pass' http://localhost:7000/oil/okta/1.2.3.4
curl -s -u 'user:pass' http://localhost:7000/oil/okta/alice.bob@example.com
```

### Prisma VPN logs

```
curl -s -u 'user:pass' http://localhost:7000/oil/prisma/1.2.3.4
```

### Query all sources

```
curl -s -u 'user:pass' http://localhost:7000/oil/1.2.3.4
```

### Query specific sources

```
curl -s -u 'user:pass' 'http://localhost:7000/oil/1.2.3.4?source=azure&source=okta'
```

## Asset inventory

```
curl -s -u 'user:pass' http://localhost:7000/asset/server
curl -s -u 'user:pass' http://localhost:7000/asset/server.example.com
curl -s -u 'user:pass' http://localhost:7000/asset/10.0.0.1
```

## Carbon Black Response

### Search for processes that have sent traffic to 1.2.3.4 (Note: too slow for bulk lookups)

```
curl -s -u 'user:pass' http://localhost:7000/cbr/1.2.3.4
```

### Return information about a host running CBR

```
curl -s -u 'user:pass' http://localhost:7000/cbr/sensor/host1
curl -s -u 'user:pass' http://localhost:7000/cbr/sensor/192.168.0.1
```

### Return information about a binary based on file hash

```
curl -s -u 'user:pass' http://localhost:7000/cbr/binary/F88ADB10AB5313D4FA33416F6F5FB4FF
curl -s -u 'user:pass' http://localhost:7000/cbr/binary/3B26493A5BADBA73D08DE156E13F5FD16D56B750585182605E81744247D2C5BD
```

## GeoIP - Fully functional, so should work with any IP

```
curl -s -u 'user:pass' http://localhost:7000/geo/1.2.3.4
```

## LDAP - Active Directory lookups

```
curl -s -u 'user:pass' http://localhost:7000/ldap/abob
curl -s -u 'user:pass' http://localhost:7000/ldap/alice.bob@example.com
```

## Passive DNS

### Queries for data

```
curl -s -u 'user:pass' http://localhost:7000/pdns/1.2.3.4
curl -s -u 'user:pass' http://localhost:7000/pdns/a.internal-test-ignore.biz
```

### Queries for result counts

```
curl -s -u 'user:pass' http://localhost:7000/pdns/1.2.3.4/_summary
curl -s -u 'user:pass' http://localhost:7000/pdns/a.internal-test-ignore.biz/_summary
```

## VPN/Proxy/Data Center Hosting checks

```
curl -s -u 'user:pass' http://localhost:7000/vpn/1.2.3.4
curl -s -u 'user:pass' http://localhost:7000/vpn/8.8.8.8
```
