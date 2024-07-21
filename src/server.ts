/*
 * Example SRV Record for Paymail:
 * -----------------------------------------------------------
 * Service: _bsvalias
 * Protocol: _tcp
 * Name: yourdomain.com (Replace with your actual domain)
 * Priority: 10
 * Weight: 10
 * Port: 443 (Assuming HTTPS)
 * Target: myDomain.com (Replace with your domain or the address of your server)
 * TTL: 3600 (1 hour, can be lower for testing)
 *
 * Adding the SRV Record:
 * 1. Log into your DNS provider's control panel.
 * 2. Navigate to the DNS management section.
 * 3. Add a new SRV record with the above details.
 *
 * Enabling DNSSEC:
 * 1. Log into your domain registrar's control panel.
 * 2. Go to the DNS settings for your domain.
 * 3. Look for an option to enable DNSSEC and activate it.
 * 4. If DNSSEC details are managed externally, enter the DS record details provided by your DNS hosting provider.
 * 5. Save your changes and allow time for propagation.
 */

import express from 'express'
import p2pDestinationsRoute from './server/p2pDestinations';
import receiveTransactionRoute from './server/receiveTransaction';
import publicProfileRoute from './server/publicProfile';
import pkiRoute from './server/pki';
import { PaymailRouter } from '@bsv/paymail';
import makePayment from './client/makePayment'
import bodyParser from 'body-parser'
import sendP2P from './client/sendP2P';

const app = express()
const DOMAIN = process.env.DOMAIN ?? 'localhost' // Replace with your actual domain
const baseUrl = 'https://' + DOMAIN


const routes = [publicProfileRoute, pkiRoute, p2pDestinationsRoute, receiveTransactionRoute]
const paymailRouter = new PaymailRouter({ baseUrl, basePath: '/api/paymail', routes })
app.use(paymailRouter.getRouter())
app.get('/api/pay/:paymail/:amount', makePayment)
app.use(bodyParser.json({ type: 'application/json' })).post('/api/update', sendP2P)

const PORT = 3000
app.listen(PORT, async () => {
  console.log(`Server is running on ${baseUrl}:${PORT}`)
})
