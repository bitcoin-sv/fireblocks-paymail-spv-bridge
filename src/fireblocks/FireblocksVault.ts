import jwt from 'jwt-simple'
import { OP, P2PKH, Transaction, ARC, PrivateKey, LockingScript } from '@bsv/sdk'
import fireblocks from './client'
import 'dotenv/config'

class FireblocksVault {
  private readonly alias: string
  private readonly domain: string
  private readonly avatarUrl: string
  private readonly secret: string
  private readonly pkiPrivKey: PrivateKey
  private readonly pki: string
  private counter: number

  constructor (alias, domain, avatarUrl, jwtSecret = 'secret') {
    this.alias = alias
    this.domain = domain
    this.avatarUrl = avatarUrl
    this.secret = jwtSecret
    this.counter = 0
    this.pkiPrivKey = PrivateKey.fromRandom()
    this.pki = this.pkiPrivKey.toPublicKey().toString()
  }

  getIdentityPrivateKey() {
    return this.pkiPrivKey
  }

  getIdentityKey () {
    return this.pki
  }

  getAlias () {
    return this.alias
  }

  getAvatarUrl () {
    return this.avatarUrl
  }

  async getPaymailDestination() {
    try {
        const reference = this.getReferenceToken(this.counter++)
        const vaults = await fireblocks.vaults.getAssetWallets()
        const vault = vaults.data.assetWallets.find(wallet => wallet.assetId === 'BSV')
        const response = await fireblocks.vaults.createVaultAccountAssetAddress({ vaultAccountId: vault.vaultId, assetId: 'BSV' })
        if (!response?.data?.address) throw Error('No address was generated')
        const script = new P2PKH().lock(response.data.address)
        if (
          script.chunks[0].op !== OP.OP_DUP ||
          script.chunks[1].op !== OP.OP_HASH160 ||
          script.chunks[2].data.length !== 20 ||
          script.chunks[3].op !== OP.OP_EQUALVERIFY ||
          script.chunks[4].op !== OP.OP_CHECKSIG
        ) throw Error('Not P2PKH')
        return { reference, script: script.toHex() }
    } catch (error) {
        console.log({ error })
    }
}

  processTransaction (tx: Transaction, reference: string) {
    console.log('Transaction processed', tx.id('hex'))
  }

  getReferenceToken = (path) => jwt.encode(path, this.secret, 'HS512')

  getDecodedReferenceToken = (jwtToken) => jwt.decode(jwtToken, this.secret)

  getPaymail () {
    return this.alias + '@' + this.domain
  }
}


const fireblocksPaymailVault = new FireblocksVault('deposits', process.env.DOMAIN, process.env?.AVATAR_URL || 'https://i.imgur.com/8zeyWBR.png')

export { fireblocksPaymailVault }

export default FireblocksVault
