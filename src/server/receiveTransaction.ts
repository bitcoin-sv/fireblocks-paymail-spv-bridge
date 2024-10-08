import { PaymailClient, ReceiveTransactionRoute } from '@bsv/paymail'
import { SatoshisPerKilobyte, Transaction, WhatsOnChain, ARC, isBroadcastFailure, Utils, PublicKey } from '@bsv/sdk'
import fireblocks from '../fireblocks/client'

const receiveTransactionRoute = new ReceiveTransactionRoute({
  domainLogicHandler: async (params, body) => {
    try {
      const tx = Transaction.fromHex(body.hex)
      const response = await (await fetch('https://beef.xn--nda.network/api', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawtx: tx.toHex() })
      })).json()
      if (!response?.beef) throw Error('Invalid conversion to BEEF')
      const beefTx = Transaction.fromHexBEEF(response.beef)
      const valid = await beefTx.verify(new WhatsOnChain(), new SatoshisPerKilobyte(1))
      if (!valid) throw Error('SPV rejected transaction')
      const arcResponse = await beefTx.broadcast(new ARC('https://arc.taal.com'))
      if (isBroadcastFailure(arcResponse)) throw Error('ARC rejected transaction ' + arcResponse.description + ' ' + arcResponse?.more)
      
      // wait 5 seconds
      await new Promise(resolve => setTimeout(resolve, 5000))

      // update the transaction with the confirmation threshold
      try {
        const setTransactionConfirmationThreshold = await fireblocks.transactions.setConfirmationThresholdByTransactionHash({ 
          txHash: tx.id('hex'), 
          setConfirmationsThresholdRequest: {
            numOfConfirmations: 0
          }
        })
        console.log({ setTransactionConfirmationThreshold })
      } catch (error) {
        console.log({ error })
      }
      return {
        txid: tx.id('hex'), note: 'deposit successful'
      }
    } catch (error) {
      console.log({ error })
      return { error: error?.message || 'Failed to process transaction' }
    }
  },
  verifySignature: false,
  paymailClient: new PaymailClient()
})

export default receiveTransactionRoute
