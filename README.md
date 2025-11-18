# x402 Agent - Zero Connector AI Support

A specialized AI Agent protected by the **x402 Payment Protocol** on Solana. This agent serves as an expert support bot for the **Zero Connector** library ($zeroc), providing technical guidance, code examples, and integration support.

Built with [PayAI](https://payai.network) (x402 protocol) and powered by OpenRouter.

## 🚀 Features

*   **x402 Payment Protection**: API endpoints are gated by micropayments (USDC/SOL) on Solana.
*   **Zero Connector Expert**: The AI system prompt is pre-loaded with the full [Zero Connector](https://github.com/zeroconnector) documentation.
*   **OpenRouter Integration**: Uses `google/gemini-3-pro-preview` (or other models) for high-quality responses.
*   **Dual Interface**:
    *   **Express Server**: Handles payment verification and AI routing.
    *   **CLI Client**: A reference implementation for interacting with the paid agent.

## 🛠️ Zero Connector Integration

This project is an adaptation and support tool for the **Zero Connector** library. It demonstrates how to build a paid AI service that specifically supports the Zero Connector ecosystem.

**Zero Connector ($zeroc)** is a powerful authentication library for Solana wallets that allows password-protected wallets without browser extensions.
*   **Pump.fun CA**: `6kP6Qjgo7Vke9HTe3tZ9DeRtKw2NDiE5fDABWEUspump`

## 📦 Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/x402-agent.git
    cd x402-agent
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
    *   `SOLANA_RPC_URL`: (Optional) Custom RPC URL.

## 🏃 Usage

### 1. Start the Server
The server listens for payment-protected requests.

```bash
node server.js
```

### 2. Run the Client
The CLI client automatically handles wallet creation (if needed), checks for USDC balance, and performs the x402 payment flow.

**Prerequisites for Client:**
*   The client generates a local wallet in `client-wallet.json`.
*   You must fund this wallet with **SOL** (for gas) and **USDC** (for payments).

```bash
node client.js "How do I install Zero Connector?"
```

**Example Output:**
```text
Client Wallet Address: 6NVm...
Checking USDC account: ...
Sufficient USDC available.
Sending request...
Payment verified!

--- AI Response ---
To install Zero Connector, run:
npm install zero-connector

For PostgreSQL support...
-------------------
```

## 🔧 Configuration

### Payment Settings
Payment settings are configured in `server.js` and `client.js`:
*   **Token**: USDC (Mainnet)
*   **Price**: Configurable (Default: 0.01 USDC)

### System Prompt
The AI's knowledge base is stored in `zeroc_docs.js`. You can update this file to feed new documentation into the agent.

## 📜 License

MIT

## 🔗 Links

*   [PayAI Network](https://payai.network)
*   [Zero Connector](https://github.com/zeroconnector)

