import { PaymailClient } from '@bsv/paymail'
import fireblocks from '../fireblocks/client'
import { TransferPeerPathType } from '@fireblocks/ts-sdk'
import { Utils, Script } from '@bsv/sdk'

const client = new PaymailClient()

async function makePayment (req, res) {
  try {
    // check the balance is enough to pay the amount in the request
    const balances = await fireblocks.vaults.getVaultBalanceByAsset({ assetId: 'BSV' })
    const satoshiBalance = Number(balances?.data?.total) * 100_000_000

    // parse out the params for who we are paying and how much.
    const { paymail, amount } = req.params
    const satoshis = Number(amount)
    console.log({ paymail, satoshis })

    if (satoshiBalance < satoshis + 1) throw Error('Insufficient funds: we have ' + satoshiBalance + ' satoshis, but need ' + satoshis + 1)

    // go get a set of destinations from the payee with p2pDest
    const p2pDest = await client.getP2pPaymentDestination(paymail, satoshis)

    // parse the outputs into destinations for fireblocks transaction
    const destinations = p2pDest.outputs.map(output => {
      const s = Script.fromHex(output.script)
      const address = Utils.toBase58Check(s.chunks[2].data)
      return {
        amount: String(output.satoshis / 100_000_000),
        destination: {
          type: TransferPeerPathType.OneTimeAddress,
          oneTimeAddress: {
            address,
          },
        }
      }
    })
    
    // create a transaction with the destinations from the vault id
    let transactionRequest = {
        assetId: "BSV",
        amount: String(satoshis / 100_000_000),
        source: {
            type: TransferPeerPathType.VaultAccount,
            id: '1',
        },
        destinations,
        note: "Pay " + satoshis + " sats to " + paymail + " " + p2pDest.reference,
    }

    console.log({ transactionRequest })

    const transaction = await fireblocks.transactions.createTransaction({ transactionRequest })
    return res.json(transaction.data)
  } catch (error) {
    return res.json({ error: error?.message || 'Failed to pay' })
  }
}

export default makePayment