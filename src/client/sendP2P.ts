import { PaymailClient, P2pReceiveBeefTransactionCapability } from '@bsv/paymail'
import fireblocks from '../fireblocks/client'
import jwt from 'jwt-simple'
import { fireblocksPaymailVault } from 'src/fireblocks/FireblocksVault'

const client = new PaymailClient()

const update = {
  title: 'Transaction - Signed, BSV Association',
  description: 'Signed',
  createdAt: 'Sat Jul 20 2024 20:20:50 GMT+0000 (Coordinated Universal Time)',
  workspace: 'BSV Association',
  event: 'Signed',
  subject: 'Transaction',
  user: 'create-transactions BSV Association',
  userId: '3ee8e3c7-dac4-41e5-adff-89fb6662c635',
  eventKey: 'transaction',
  txId: '775cc542-4543-456d-bdf8-256febff23b9',
  signedBy: 'Darren Kellenschwiler',
  initiatedBy: 'create-transactions BSV Association',
  netAmount: '0.00001000',
  notificationSubject: 'Transaction Signed',
  category: 'Transactions',
  categoryId: '8'
}

async function sendP2P (req, res) {
  try {
    console.log(req.body)
    const decoded = jwt.decode(req.headers['x-webhook-secret'], process.env.WEBHOOK_SECRET)
    console.log({ decoded })
    if(decoded.exp > Math.floor(Date.now() / 1000) ) throw Error('Invalid webhook secret')
    console.log({ waiting: '10 seconds' })
    // pause for 10 seconds to ensure WoC has the tx
    await new Promise(resolve => setTimeout(resolve, 10000))
    const update = await fireblocks.transactions.getTransaction({ txId: req.body.txId })
    console.log({ update })

    if (!update?.data?.txHash) throw Error('No txHash in update')
    if (!update?.data?.note) throw Error('No note in update')
    const txid = update.data.txHash
    const paymail = update.data.note.split(' ')[4]
    const reference = update.data.note.split(' ')[5]

    console.log({ txid, paymail })

    const rawtx = await (await fetch(`https://api.whatsonchain.com/v1/bsv/main/tx/${txid}/hex`)).text()

    console.log({ rawtx })
    
    // if the recipient has beef capability send beef otherwise send rawtx
    let hasBeefCapability = false
    try {
        await client.ensureCapabilityFor(paymail.split('@')[1], P2pReceiveBeefTransactionCapability.getCode())
        hasBeefCapability = true
    } catch (error) {
        console.log(error?.message || 'No beef capability')
    }

    console.log({ hasBeefCapability })
    
    let beef = ''
    if (hasBeefCapability) {
        try {
            const response = await (await fetch('https://beef.xn--nda.network/api', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rawtx })
            })).json()
            if (!response?.beef) throw Error('Invalid conversion to BEEF')
            beef = response.beef
        } catch (error) {
            hasBeefCapability = false
            console.log(error?.message || 'Failed to convert to BEEF')
        }
    }

    console.log({ beef })

    let sendResponse
    const metadata = {
        sender: fireblocksPaymailVault.getPaymail(),
        pubkey: fireblocksPaymailVault.getIdentityKey(),
        signature: client.createP2PSignature(txid, fireblocksPaymailVault.getIdentityPrivateKey()),
        note: 'Withdrawal'
    }
    if (hasBeefCapability) {
        sendResponse = await client.sendBeefTransactionP2P(paymail, beef, reference, metadata)
    } else {
        sendResponse = await client.sendTransactionP2P(paymail, rawtx, reference, metadata)
    }
    
    console.log({ sendResponse })
    // TODO: think about how to handle failures

    return res.json({ success: true })
  } catch (error) {
    return res.json({ error: error?.message || 'Failed to pay' })
  }
}

export default sendP2P