import { P2PKH, OP } from '@bsv/sdk'
import { P2pPaymentDestinationRoute } from '@bsv/paymail'
import { fireblocksPaymailVault } from '../fireblocks/FireblocksVault.js'
import 'dotenv/config'

const p2pDestinationsRoute = new P2pPaymentDestinationRoute({
  domainLogicHandler: async (params, body) => {
    if (typeof body?.satoshis !== 'number') throw new Error('satoshi amount must be a number')
    if (body.satoshis < 1) throw new Error('satoshi amount must be greater than 0')
    const { script, reference } = await fireblocksPaymailVault.getPaymailDestination()
    return {
      outputs: [
        {
          script,
          satoshis: body.satoshis
        }
      ],
      reference
    }
  }
})

export default p2pDestinationsRoute
