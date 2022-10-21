import { loadWallet } from '@utils/wallet'
import { Connection, Signer } from '@solana/web3.js'

const fee_payer = loadWallet(process.env.FEE_PAYER_KEY_PATH)
const connection = new Connection(process.env.RPC_ENDPOINT, 'recent')

export function getPayer(): Signer {
  return fee_payer
}

export function getConnection(): Connection {
  return connection
}
