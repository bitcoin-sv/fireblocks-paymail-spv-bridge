import { PaymailClient } from '@bsv/paymail'


const client = new PaymailClient();

async function makePayment (req, res) {
  try {
    // get the vault id which holds BSV and check the balance is enough to pay the amount in the request
    
    // parse out the params for who we are paying and how much.

    // go get a set of destinations from the payee with p2pDest

    // parse the outputs into destinations for fireblocks transaction

    // create a transaction with the destinations from the vault id

    return res.json({ message: 'Payment sent' })
  } catch (error) {
    return res.json({ error: error?.message || 'Failed to pay' })
  }
}

export default makePayment