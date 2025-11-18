# x402 Agent - Zero Connector AI Support

A specialized AI Agent protected by the **x402 Payment Protocol** on Solana. This agent serves as an expert support bot for the **Zero Connector** library ($zeroc), providing technical guidance, code examples, and integration support.

Built with [PayAI](https://payai.network) (x402 protocol) and powered by OpenRouter.

## Features

*   **x402 Payment Protection**: API endpoints are gated by micropayments (USDC/SOL) on Solana.
*   **Zero Connector Expert**: The AI system prompt is pre-loaded with the full [Zero Connector](https://github.com/zeroconnector) documentation.
*   **OpenRouter Integration**: Uses `google/gemini-3-pro-preview` (or other models) for high-quality responses.
*   **Dual Interface**:
    *   **Express Server**: Handles payment verification and AI routing.
    *   **CLI Client**: A reference implementation for interacting with the paid agent.

## Zero Connector Integration

This project is an adaptation and support tool for the **Zero Connector** library. It demonstrates how to build a paid AI service that specifically supports the Zero Connector ecosystem.

**Zero Connector ($zeroc)** is a powerful authentication library for Solana wallets that allows password-protected wallets without browser extensions.
*   **Pump.fun CA**: `6kP6Qjgo7Vke9HTe3tZ9DeRtKw2NDiE5fDABWEUspump`

## Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/ZeroConnector/x402-zeroc-agent.git
    cd x402-zeroc-agent
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Copy the example environment file and add your keys:
    ```bash
    cp env.example .env
    ```
    Edit `.env`:
    *   `OPENROUTER_API_KEY`: Your API key from OpenRouter.
    *   `TREASURY_WALLET_ADDRESS`: The Solana wallet that will receive payments.
    *   `SOLANA_RPC_URL`: (Optional) Custom RPC URL (Recommended for mainnet reliability).

## Usage Guide

### 1. Setup Client Wallet
Before you can use the agent, the client needs a wallet with funds.

1.  Run the client once to generate a new wallet file (`client-wallet.json`):
    ```bash
    node client.js "Init"
    ```
2.  The script will print your **Client Wallet Address**.
3.  **Fund this wallet**:
    *   Send ~0.002 SOL (for gas fees).
    *   Send at least 0.1 USDC (for payments).

### 2. Check Wallet Balance
We provide a helper script to verify your client wallet has received the funds and the RPC can see them.

```bash
node check_balance.js
```
*   **Success**: Shows your SOL and USDC balance.
*   **Failure**: If USDC balance is 0, wait for the transaction to confirm or check if you sent the correct token (Mainnet USDC).

### 3. Start the Server
The server listens for requests and gates them behind the x402 payment wall.

```bash
node server.js
```
*   The server runs on port 3000 by default.
*   Keep this terminal open.

### 4. Run the AI Client
In a new terminal, use the client to send prompts to the agent. The client automatically handles the 402 Payment Required response, signs the transaction, and resends the request with proof of payment.

```bash
node client.js "How do I install Zero Connector?"
```

**Example Interaction:**
```text
Client Wallet Address: 6NVm...
Checking USDC account: ...
Sufficient USDC available.
Sending request...
Payment verified!

--- AI Response ---
To install Zero Connector, run:
npm install zero-connector
...
-------------------
```

### Troubleshooting
*   **Fetch failed**: Ensure `node server.js` is running in a separate terminal.
*   **Insufficient USDC balance**: Run `node check_balance.js` to verify funds. Ensure you have the specific USDC Mainnet token (`EPjFW...`).
*   **Transaction failed**: Ensure you have enough SOL for gas (~0.002 SOL recommended).

## Configuration

### Payment Settings
Payment settings are configured in `server.js`:
*   **Token**: USDC (Mainnet)
*   **Price**: Default is set to `0.01 USDC`. You can change `PRICE_MICRO_UNITS` in `server.js`.

### AI Knowledge Base
The AI's knowledge base is stored in `zeroc_docs.js`. Update this file to feed new documentation or context into the agent.

## License

MIT

## Links

*   [PayAI Network](https://payai.network)
*   [Zero Connector](https://github.com/zeroconnector)
