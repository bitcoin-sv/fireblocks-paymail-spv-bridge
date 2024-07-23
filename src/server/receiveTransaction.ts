import { PaymailClient, ReceiveTransactionRoute } from '@bsv/paymail'
import { SatoshisPerKilobyte, Transaction, WhatsOnChain, ARC, isBroadcastFailure, Utils, PublicKey } from '@bsv/sdk'
import fireblocks from '../fireblocks/client'
const client = new PaymailClient()

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
      const sender = {
        paymail: body?.metadata?.sender || '',
        pubkey: body?.metadata?.pubkey || '',
        signature: body?.metadata?.signature || '',
        note: body?.metadata?.note || '',
        reference: body?.reference || '',
        name: '',
      }
      
      try {
        const profile = await client.getPublicProfile(sender.paymail)
        if (profile.name) sender.name = profile.name
      } catch (error) {
        console.log({ error })
      }

      let senderInfo = ''
      if (sender.paymail) senderInfo += sender.paymail + '|'
      if (sender.signature) senderInfo += sender.signature + '|'
      if (sender.name) senderInfo += sender.name + '|'
      if (sender.pubkey) senderInfo += PublicKey.fromString(sender.pubkey).toAddress() + '|'
      if (sender.note) senderInfo += sender.note + '|'
      if (sender.reference) senderInfo += sender.reference + '|'

      senderInfo = senderInfo.slice(0, 128).split('|').slice(0,-1).join('|')
      // get the vault account
      const vaults = await fireblocks.vaults.getAssetWallets()
      const vault = vaults.data.assetWallets.find(wallet => wallet.assetId === 'BSV')
      // update the transaction with the reference and associated sender.
      await Promise.all(tx.inputs.map(async input => {
        try {
          const pubkey = Utils.toHex(input.unlockingScript.chunks[1].data)
          const address = PublicKey.fromString(pubkey).toAddress()
          const updateVaultAccountAssetAddress = await fireblocks.vaults.updateVaultAccountAssetAddress({ 
            vaultAccountId: vault.vaultId, 
            assetId: 'BSV',
            addressId: address,
            updateVaultAccountAssetAddressRequest: { 
              description: senderInfo,
            },
          })
          console.log({ updateVaultAccountAssetAddress })
        } catch (error) {
          console.log({ error })
        }
      }))
      // wait 10 seconds
      await new Promise(resolve => setTimeout(resolve, 5000))
      // update the transaction with the confirmation threshold
      try {
        const setTransactionConfirmationThreshold = await fireblocks.transactions.setTransactionConfirmationThreshold({ 
        txId: tx.id('hex'), 
          setConfirmationsThresholdRequest: {
            numOfConfirmations: 1
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
