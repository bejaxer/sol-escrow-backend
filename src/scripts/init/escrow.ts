import '@wrappers/dotenv'
import * as anchor from '@project-serum/anchor'
import { Program } from '@project-serum/anchor'
import * as web3 from '@solana/web3.js'
import { PublicKey, sendAndConfirmTransaction } from '@solana/web3.js'
import { getConnection, getPayer } from '@wrappers/blockchain'
import { loadJson } from '@utils/file'
import { SOL_VAULT_PDA_SEED } from '@config/constants'
import addresses from '@config/addresses.json'

const filepath = 'deps/programs/escrow/program.json'
const idl = loadJson(filepath)

const connection = getConnection()
const fee_payer = getPayer()

let solVaultPubkey: PublicKey
let solVaultBump: number

let provider = new anchor.Provider(getConnection(), getPayer() as any, {
  preflightCommitment: 'confirmed',
  commitment: 'confirmed',
})

let program: Program
function setProvider(p: anchor.Provider) {
  provider = p
  anchor.setProvider(p)
  program = new anchor.Program(idl, addresses.escrow, p)
}
setProvider(provider)

async function init() {
  ;[solVaultPubkey, solVaultBump] = await web3.PublicKey.findProgramAddress(
    [Buffer.from(anchor.utils.bytes.utf8.encode(SOL_VAULT_PDA_SEED))],
    program.programId
  )

  const txInstruction = await program.instruction.initialize({
    accounts: {
      solVaultAccount: solVaultPubkey,
      initializer: fee_payer.publicKey,
      systemProgram: web3.SystemProgram.programId,
      rent: web3.SYSVAR_RENT_PUBKEY,
    },
  })
  const tx = new web3.Transaction().add(txInstruction)
  await sendAndConfirmTransaction(connection, tx, [fee_payer])
  console.log('Successed!')
}

init()
