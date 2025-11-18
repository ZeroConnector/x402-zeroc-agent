const { Connection, Keypair, VersionedTransaction, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction } = require('@solana/web3.js');
const { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, getAccount, TokenAccountNotFoundError } = require('@solana/spl-token');
const { createX402Client } = require('x402-solana/client');
const bs58 = require('bs58').default || require('bs58');
const fs = require('fs');
const path = require('path');

// Polyfill window for x402-solana client in Node.js
if (typeof window === 'undefined') {
  global.window = global;
}

// Configuration
const SERVER_URL = 'http://localhost:3000/api/zeroc-x402-demo';
const KEYPAIR_FILE = 'client-wallet.json';
const RPC_URL = 'https://api.mainnet-beta.solana.com';
const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

async function checkUsdcBalance(connection, keypair, amountNeeded) {
  const wallet = keypair.publicKey;
  const ata = await getAssociatedTokenAddress(USDC_MINT, wallet);
  
  console.log(`Checking USDC account: ${ata.toString()}`);
  
  let balance = BigInt(0);
  
  try {
    const account = await getAccount(connection, ata);
    balance = account.amount;
  } catch (e) {
    console.log('Debug: Error fetching USDC account:', e.message);
    // Don't suppress error if it's not a "Not Found" error
    if (!(e instanceof TokenAccountNotFoundError || e.name === 'TokenAccountNotFoundError')) {
        // It might be an RPC error, let's warn but assume it might exist
        console.log('RPC Error checking balance. Proceeding cautiously...');
    }
  }

  console.log(`Current USDC Balance (micro-units): ${balance.toString()} / Needed: ${amountNeeded.toString()}`);

  if (balance < amountNeeded) {
    console.log('\nWARNING: Insufficient USDC balance!');
    console.log(`Please send at least 0.01 USDC to: ${wallet.toString()}`);
    console.log('The script might fail or hang if you don\'t have funds.\n');
  } else {
    console.log('Sufficient USDC available.');
  }
}

async function main() {
  // 1. Load or Create Wallet
  let keypair;
  let needsSave = false;


  if (fs.existsSync(KEYPAIR_FILE)) {
    const fileContent = fs.readFileSync(KEYPAIR_FILE, 'utf-8');
    const parsed = JSON.parse(fileContent);

    if (Array.isArray(parsed)) {
      // Old format: just an array
      const secretKey = new Uint8Array(parsed);
      keypair = Keypair.fromSecretKey(secretKey);
      needsSave = true;
    } else if (parsed.secretKey) {
      // New format: object
      const secretKey = new Uint8Array(parsed.secretKey);
      keypair = Keypair.fromSecretKey(secretKey);
    } else {
      throw new Error('Invalid wallet file format');
    }
  } else {
    keypair = Keypair.generate();
    needsSave = true;
    console.log('Created new wallet.');
  }

  if (needsSave) {
    const walletData = {
      publicKey: keypair.publicKey.toString(),
      secretKey: Array.from(keypair.secretKey),
      privateKeyBase58: bs58.encode(keypair.secretKey)
    };
    fs.writeFileSync(KEYPAIR_FILE, JSON.stringify(walletData, null, 2));
    console.log('Updated wallet file with additional info.');
  }

  console.log(`Client Wallet Address: ${keypair.publicKey.toString()}`);
  console.log('Ensure this wallet has at least 0.002 SOL (0.001 for payment + fees)');

  // 2. Create Wallet Adapter for Node.js
  const connection = new Connection(RPC_URL);
  // Check for USDC balance (10000 = 0.01 USDC)
  await checkUsdcBalance(connection, keypair, BigInt(10000));

  const walletAdapter = {
    address: keypair.publicKey.toString(),
    signTransaction: async (tx) => {
      // x402 client passes a VersionedTransaction
      tx.sign([keypair]);
      return tx;
    },
  };

  // 3. Create x402 Client
  const client = createX402Client({
    wallet: walletAdapter,
    network: 'solana', // Mainnet
    maxPaymentAmount: BigInt(2000000), // 0.002 SOL limit
  });

  // 4. Get User Input
  const prompt = process.argv[2] || 'Tell me a joke about Solana.';
  console.log(`Sending prompt: "${prompt}"`);

  try {
    // 5. Make Request
    console.log('Sending request...');
    const response = await client.fetch(SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Agent-Input': prompt, // Send as header as requested
      },
      body: JSON.stringify({ prompt }), // Also sending in body just in case
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('\n--- AI Response ---');
    console.log(result.data);
    console.log('-------------------\n');

  } catch (error) {
    console.error('Error:', error.message);
    if (error.message.includes('402')) {
      console.log('Payment required but failed to auto-handle?');
    }
  }
}

main();
