# Figmenta AI Chat Agent

An intelligent AI chat agent for Figmenta, a creative digital agency. The agent collects project information through natural conversation and can escalate to human team members via Discord.

## 🚀 Features

- **AI-Powered Chat**: Conversational AI assistant (Fig1) that collects project requirements
- **Discovery Flow**: Gathers 5 key data points (Project Type, Brand Name, Industry, Budget, Timeline)
- **Smart Intent Detection**: AI classifies when users want to talk to a human
- **Discord Integration**: Escalates conversations to team members during business hours
- **Real-time Updates**: Supabase Realtime for instant message delivery
- **Business Hours Logic**: CET timezone awareness (Mon-Fri, 9AM-6PM)

## 🛠 Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: n8n (workflow automation)
- **Database**: Supabase (PostgreSQL + Realtime)
- **AI**: NVIDIA API (OpenAI-compatible)
- **Notifications**: Discord Bot API

## 📁 Project Structure

```
├── index.html              # Landing page
├── styles.css              # Styling with dark theme
├── chat-widget.js          # Chat widget functionality
├── config.js               # Configuration (API keys, settings)
├── supabase-schema.sql     # Database schema
└── n8n-workflows/
    └── main-chat-workflow.json  # n8n workflow export
```

## 🔧 Setup

### 1. Supabase Setup
1. Create a Supabase project
2. Run the SQL in `supabase-schema.sql`
3. Enable Realtime on the `messages` table
4. Copy your project URL and anon key to `config.js`

### 2. n8n Setup
1. Import `n8n-workflows/main-chat-workflow.json`
2. Configure credentials:
   - Supabase API
   - OpenAI API (with NVIDIA endpoint)
   - Discord Bot
3. Update the webhook URL in `chat-widget.js`
4. Activate the workflow

### 3. Discord Setup
1. Create a Discord bot at https://discord.com/developers
2. Add bot to your server
3. Create a #human-escalation channel
4. Update channel ID in the n8n workflow

### 4. Deploy
1. Host the frontend on Vercel/Netlify
2. Ensure n8n workflow is active

## 📝 Configuration

Update `config.js` with your credentials:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `N8N_WEBHOOK_URL`
- `DISCORD_CHANNEL_ID`

## 🎯 How It Works

1. User visits the website and opens chat
2. AI (Fig1) greets user and starts discovery conversation
3. AI collects: Project Type, Brand Name, Industry, Budget, Timeline
4. After collecting info, AI asks for email
5. User can request to "talk to someone"
6. AI detects intent and escalates to Discord
7. Team member receives notification with session details
8. Human can reply through Supabase (appears in web chat)

## 📄 License

MIT License - Created for Figmenta
