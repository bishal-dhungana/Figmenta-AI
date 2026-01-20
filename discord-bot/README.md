# Figmenta Discord Bot

Real-time Discord reply handler for Figmenta AI Chat.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

3. Run the bot:
   ```bash
   npm start
   ```

## How It Works

1. Bot listens to #human-escalation channel
2. When a human replies (using `@session_id: message` format or in threads)
3. Bot extracts session ID and message
4. Forwards to n8n webhook
5. n8n saves to Supabase
6. Web chat shows it via Realtime!

## Hosting

Deploy to Replit, Railway, or any Node.js host for 24/7 operation.
