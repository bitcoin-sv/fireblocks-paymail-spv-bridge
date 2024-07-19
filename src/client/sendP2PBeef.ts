import { PaymailClient } from '@bsv/paymail'
import { Transaction } from '@bsv/sdk'

const client = new PaymailClient();

// (async () => {
//   const p2pDestination = await client.getP2pPaymentDestination(receiver, startingBalance - 1)
//   const tx = new Transaction()
//   await client.sendBeefTransactionP2P(receiver, tx.toHexBEEF(), p2pDestination.reference,
//     {
//       sender: sender.getPaymail(),
//       pubkey: sender.getIdentityKey(),
//       signature: client.createP2PSignature(tx.id('hex') as string, sender.getIdentityPrivateKey()),
//       note: 'hello world'
//     })
//   await sender.broadcastTransaction(tx)
//   mockUser1.processTransaction(tx, reference)
//   console.log('sender updated balance', await sender.getSatoshiBalance())
//   await sender.closeWallet()
// })()
