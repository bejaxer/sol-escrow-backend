import express from 'express'
const router = express.Router()

import * as anchor from '@project-serum/anchor'
import { Program } from '@project-serum/anchor'
import * as web3 from '@solana/web3.js'
import { PublicKey, sendAndConfirmTransaction } from '@solana/web3.js'
import { getConnection, getPayer } from '@wrappers/blockchain'
import { loadJson } from '@utils/file'
import { SOL_VAULT_PDA_SEED } from '@config/constants'
import addresses from '@config/addresses.json'
import { log, successLog, warningLog, errorLog } from '@utils/log'
import { TypedBody, Lock } from '@interfaces/params'

router.get('/balance', async (req, res) => {
  try {
    log(req.body)

    const filepath = 'deps/programs/escrow/program.json'
    const idl = loadJson(filepath)

    const connection = getConnection()
    const fee_payer = getPayer()

    let solVaultPubkey: PublicKey
    let solVaultBump: number

    let provider = new anchor.Provider(connection, fee_payer as any, {
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
    ;[solVaultPubkey, solVaultBump] = await web3.PublicKey.findProgramAddress(
      [Buffer.from(anchor.utils.bytes.utf8.encode(SOL_VAULT_PDA_SEED))],
      program.programId
    )

    const vaultBalance = await connection.getBalance(solVaultPubkey)
    const userBalance = await connection.getBalance(fee_payer.publicKey)

    successLog(`Vault: ${vaultBalance}, User: ${userBalance}`)

    return res.json({ vault: vaultBalance, userBalance: userBalance })
  } catch (e) {
    errorLog(e)
    res.sendStatus(400)
  }
})

router.post('/lock', async (req: TypedBody<Lock>, res) => {
  try {
    log(req.body)

    const filepath = 'deps/programs/escrow/program.json'
    const idl = loadJson(filepath)

    const connection = getConnection()
    const fee_payer = getPayer()

    let solVaultPubkey: PublicKey
    let solVaultBump: number
    let userEscrowPubkey: PublicKey
    let userEscrowBump: number

    let provider = new anchor.Provider(connection, fee_payer as any, {
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
    ;[solVaultPubkey, solVaultBump] = await web3.PublicKey.findProgramAddress(
      [Buffer.from(anchor.utils.bytes.utf8.encode(SOL_VAULT_PDA_SEED))],
      program.programId
    )
    ;[userEscrowPubkey, userEscrowBump] =
      await web3.PublicKey.findProgramAddress(
        [fee_payer.publicKey.toBuffer()],
        program.programId
      )

    const txInstruction = await program.instruction.lock(
      new anchor.BN(req.body.amount),
      {
        accounts: {
          solVaultAccount: solVaultPubkey,
          userEscrowAccount: userEscrowPubkey,
          owner: fee_payer.publicKey,
          systemProgram: web3.SystemProgram.programId,
          rent: web3.SYSVAR_RENT_PUBKEY,
        },
      }
    )
    const tx = new web3.Transaction().add(txInstruction)
    await sendAndConfirmTransaction(connection, tx, [fee_payer])

    const vaultBalance = await connection.getBalance(solVaultPubkey)
    const userBalance = await connection.getBalance(fee_payer.publicKey)
    const escrowAccount = await program.account.escrowAccount.fetch(
      userEscrowPubkey
    )

    successLog(
      `Vault: ${vaultBalance}, User: ${userBalance}, Escrow: ${escrowAccount}`
    )

    return res.json({
      vault: vaultBalance,
      userBalance: userBalance,
      escrowAccount: escrowAccount,
    })
  } catch (e) {
    errorLog(e)
    res.sendStatus(400)
  }
})

router.post('/claim', async (req, res) => {
  try {
    log(req.body)

    const filepath = 'deps/programs/escrow/program.json'
    const idl = loadJson(filepath)

    const connection = getConnection()
    const fee_payer = getPayer()

    let solVaultPubkey: PublicKey
    let solVaultBump: number
    let userEscrowPubkey: PublicKey
    let userEscrowBump: number

    let provider = new anchor.Provider(connection, fee_payer as any, {
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
    ;[solVaultPubkey, solVaultBump] = await web3.PublicKey.findProgramAddress(
      [Buffer.from(anchor.utils.bytes.utf8.encode(SOL_VAULT_PDA_SEED))],
      program.programId
    )
    ;[userEscrowPubkey, userEscrowBump] =
      await web3.PublicKey.findProgramAddress(
        [fee_payer.publicKey.toBuffer()],
        program.programId
      )

    const txInstruction = await program.instruction.claim({
      accounts: {
        solVaultAccount: solVaultPubkey,
        userEscrowAccount: userEscrowPubkey,
        owner: fee_payer.publicKey,
        systemProgram: web3.SystemProgram.programId,
      },
    })
    const tx = new web3.Transaction().add(txInstruction)
    await sendAndConfirmTransaction(connection, tx, [fee_payer])

    const vaultBalance = await connection.getBalance(solVaultPubkey)
    const userBalance = await connection.getBalance(fee_payer.publicKey)

    successLog(`Vault: ${vaultBalance}, User: ${userBalance}`)

    return res.json({
      vault: vaultBalance,
      userBalance: userBalance,
    })
  } catch (e) {
    errorLog(e)
    res.sendStatus(400)
  }
})

export default router
