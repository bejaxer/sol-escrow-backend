import * as web3 from '@solana/web3.js'
import fs from 'fs'

export function loadKeypair(keypair: string): any {
  return <any>JSON.parse(fs.readFileSync(keypair).toString())
}

export function loadWallet(keypair: string): web3.Keypair {
  const loaded = web3.Keypair.fromSecretKey(
    new Uint8Array(loadKeypair(keypair))
  )
  console.log(`wallet loaded: ${loaded.publicKey}`)
  return loaded
}
