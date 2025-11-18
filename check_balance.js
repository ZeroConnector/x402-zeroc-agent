const { Connection, PublicKey } = require('@solana/web3.js');
const { getAssociatedTokenAddress, getAccount } = require('@solana/spl-token');
const fs = require('fs');

// Config
const RPC_URL = 'https://api.mainnet-beta.solana.com';
const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
const KEYPAIR_FILE = 'client-wallet.json';

async function check() {
  const connection = new Connection(RPC_URL);
  
  // Load Wallet
  if (!fs.existsSync(KEYPAIR_FILE)) {
    console.log('No wallet file found.');
    return;
  }
  const keyData = JSON.parse(fs.readFileSync(KEYPAIR_FILE, 'utf-8'));
  const walletPubkey = new PublicKey(keyData.publicKey);

  console.log('Wallet Address:', walletPubkey.toString());

  // Check SOL
  const solBalance = await connection.getBalance(walletPubkey);
  console.log(`SOL Balance: ${solBalance / 1e9} SOL`);

  // Check USDC
  try {
    const ata = await getAssociatedTokenAddress(USDC_MINT, walletPubkey);
    console.log('USDC ATA:', ata.toString());
    
    const account = await getAccount(connection, ata);
    console.log(`USDC Balance: ${Number(account.amount) / 1e6} USDC`);
  } catch (e) {
    console.log('Error checking USDC:', e.message);
    console.log('Likely no USDC Account exists or it is empty/uninitialized.');
  }
}

check();

