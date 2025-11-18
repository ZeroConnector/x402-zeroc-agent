const express = require('express');
const cors = require('cors');
const { X402PaymentHandler } = require('x402-solana/server');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('x402 Agent Server is Running');
});

// Initialize OpenRouter client
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'https://zeroc.com', // Placeholder
    'X-Title': 'x402 Agent',
  },
});

const ZERO_CONNECTOR_DOCS = require('./zeroc_docs');

// Initialize x402 Payment Handler
// Note: Facilitator URL is from docs. 
// Treasury address must be a valid base58 string in production.
const x402 = new X402PaymentHandler({
  network: 'solana', // Mainnet
  treasuryAddress: process.env.TREASURY_WALLET_ADDRESS,
  facilitatorUrl: 'https://facilitator.payai.network',
  rpcUrl: process.env.SOLANA_RPC_URL,
});

// Constants
const PRICE_USDC_CENTS = 1; // 1 cent
const PRICE_MICRO_UNITS = "10000"; // 0.01 USDC (6 decimals)
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // Mainnet USDC

app.post('/api/zeroc-x402-demo', async (req, res) => {
  try {
    console.log('Received request for /api/zeroc-x402-demo');
    
    // 1. Extract payment header
    const paymentHeader = x402.extractPayment(req.headers);

    // 2. Create payment requirements
    const paymentRequirements = await x402.createPaymentRequirements({
      price: {
        amount: PRICE_MICRO_UNITS,
        asset: {
          address: USDC_MINT
        }
      },
      network: 'solana',
      config: {
        description: 'AI Agent Request (0.01 USDC)',
        resource: `http://localhost:${PORT}/api/zeroc-x402-demo`,
        discoverable: true,
      }
    });

    // 3. If no payment header, return 402
    if (!paymentHeader) {
      console.log('No payment header, returning 402');
      const response = x402.create402Response(paymentRequirements);
      return res.status(response.status).json(response.body);
    }

    // 4. Verify payment
    console.log('Verifying payment...');
    const verified = await x402.verifyPayment(paymentHeader, paymentRequirements);
    
    if (!verified) {
      console.log('Payment verification failed');
      return res.status(402).json({ error: 'Invalid payment' });
    }

    console.log('Payment verified!');

    // 5. Process Business Logic (AI Agent)
    // Get input from body or header. User mentioned "terminal input" via "header" or body.
    // We'll check body first, then header.
    const userPrompt = req.body.prompt || req.headers['x-agent-input'] || 'Hello, who are you?';

    console.log(`Processing prompt: ${userPrompt}`);

    const completion = await openai.chat.completions.create({
      model: 'google/gemini-3-pro-preview',
      messages: [
        {
          role: 'system',
          content: `You are the Zero Connector AI Agent, an expert on the Zero Connector ($zeroc) authentication library for Solana.
          
          Your knowledge base:
          ${ZERO_CONNECTOR_DOCS}
          
          If asked about Zero Connector, answer based on this documentation.
          If asked unrelated questions, you can still answer them helpfuly but prioritize Zero Connector context.
          `,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const aiResponse = completion.choices[0].message.content;

    // 6. Settle payment
    console.log('Settling payment...');
    await x402.settlePayment(paymentHeader, paymentRequirements);

    // 7. Return response
    res.json({ 
      success: true, 
      data: aiResponse 
    });

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`x402 Agent Server running on port ${PORT}`);
  console.log(`Ensure TREASURY_WALLET_ADDRESS is set in .env`);
});

