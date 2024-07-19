
import { PublicKeyInfrastructureRoute } from '@bsv/paymail'
import { fireblocksPaymailVault } from '../fireblocks/FireblocksVault'

const pkiRoute = new PublicKeyInfrastructureRoute({
  domainLogicHandler: async (params) => {
    const { name, domain } = PublicKeyInfrastructureRoute.getNameAndDomain(params)
    return {
      bsvalias: '1.0',
      handle: `${name}@${domain}`,
      pubkey: fireblocksPaymailVault.getIdentityKey()
    }
  }
})

export default pkiRoute
