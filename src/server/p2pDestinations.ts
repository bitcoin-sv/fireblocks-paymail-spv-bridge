import { P2PKH } from '@bsv/sdk'
import { P2pPaymentDestinationRoute } from '@bsv/paymail'
import { fetchUser } from '../mockUser.js'
import 'dotenv/config'
import { Fireblocks, BasePath, TransferPeerPathType } from '@fireblocks/ts-sdk'

const { DEPOSITS } = process.env
const script = new P2PKH().lock(DEPOSITS)

const p2pDestinationsRoute = new P2pPaymentDestinationRoute({
  domainLogicHandler: async (params, body) => {
    const { name, domain } = P2pPaymentDestinationRoute.getNameAndDomain(params)
    const user = await fetchUser(name, domain)
    const { reference } = user.getPaymailDestination()
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
