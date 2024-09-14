# Install

You need node.js installed - this was built with v21.5.0

```bash
npm i
```

## Create an .env file

```javascript
AVATAR_URL="https://i.imgur.com/8zeyWBR.png"
FIREBLOCKS_API_KEY="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
FIREBLOCKS_SECRET="-----BEGIN PRIVATE KEY-----
replace this with a real key
-----END PRIVATE KEY-----
"
DOMAIN="<your-domain>"
WEBHOOK_SECRET="<use-some-private-key-in-wif-format>"
```

# Setup

1. Get a Fireblocks account ($500/month).
2. Set up a Vault and pick BSV as the asset.
3. Set the "allow one time addresses" policy to true.
4. Set up a TAP to allow any sender to your vault, and allow sending to any address from that vault, so long as it's BSV.
5. Set up their mobile app and do the backup key recovery process.
6. Create an API key and set it to be Editor level priviledges.


## Localhost
Set up a reverse proxy using ngrok to use the code as is locally.

```
ngrok http 3000
```

That will give you a URL which proxies to your localhost at port 3000. Copy that URL to use as DOMAIN value your .env file. You can update the values above to your liking. 

## DNS records for personal domain

If you're using a server and your own domain, you can add a paymail service record to allow clients to securely lookup your host by domain. Your domain should have DNSSEC enabled.

type: SRV  
service: _bsvalias._tcp  
priority: 10 10   
port: 443  
host: ip4-address

## Webhooks

To generate a WEBHOOK_SECRET just do:

```javascript
import { PrivateKey } from '@bsv/sdk'
PrivateKey.fromRandom().toWif()
```

You need to give Fireblocks that value by setting up a webhook on their console with the topic "Transactions".

The FIREBLOCKS_API_KEY you should grab from the Fireblocks web console dev area. The FIREBLOCKS_SECRET is the key file they allow you to download on creation, copy pasted in.

# Use

To run it
```bash
npm run server
```

### Deposit into Fireblocks Vault
To deposit funds from another wallet you just pay using paymail to: `vault@<your-domain>`.

### Withdraw from Fireblocks Vault
To withdraw funds to a paymail wallet you hit the endpoint: `http://localhost:3000/api/pay/<your-paymail>/<amount-in-satoshis>`

Supports:

- p2pdestinations
- p2p beef transaction
- p2p rawtx (fallback)

```json
{
  "bsvalias": "1.0",
  "capabilities": {
    "f12f968c92d6": "https://<your-domain>/api/paymail/public-profile/{alias}@{domain.tld}",
    "pki": "https://<your-domain>/api/paymail/id/{alias}@{domain.tld}",
    "2a40af698840": "https://<your-domain>/api/paymail/p2p-payment-destination/{alias}@{domain.tld}",
    "5f1323cddf31": "https://<your-domain>/api/paymail/receive-transaction/{alias}@{domain.tld}",
    "6745385c3fc0": false
  }
}
```
