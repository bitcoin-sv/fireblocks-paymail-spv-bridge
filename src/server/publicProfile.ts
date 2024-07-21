import { PublicProfileRoute } from '@bsv/paymail'
import { fireblocksPaymailVault } from '../fireblocks/FireblocksVault'

const publicProfileRoute = new PublicProfileRoute({
  domainLogicHandler: async (params) => {
    const { name, domain } = PublicProfileRoute.getNameAndDomain(params)
    return {
      name: 'Vault',
      domain,
      avatar: fireblocksPaymailVault.getAvatarUrl()
    }
  }
})

export default publicProfileRoute
