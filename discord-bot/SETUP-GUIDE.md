# 🚀 COMPLETE SETUP GUIDE - Discord Thread Reply System

## What This Does:
User says "Talk to someone" → Discord notification with thread → Human replies in thread → Reply appears in web chat instantly!

---

# YOUR ACTION STEPS (5 Steps Total)

---

## ✅ STEP 1: Enable Discord Bot Permissions (3 minutes)

1. Open: https://discord.com/developers/applications
2. Click your **Figmenta AI** bot
3. Click **"Bot"** in left sidebar
4. Scroll to **"Privileged Gateway Intents"**
5. Turn ON all three:
   - ✅ PRESENCE INTENT
   - ✅ SERVER MEMBERS INTENT
   - ✅ MESSAGE CONTENT INTENT
6. Click **Save Changes**

---

## ✅ STEP 2: Create n8n Webhook Workflow (5 minutes)

### Go to n8n and create a NEW workflow called "Discord Reply Receiver"

### Add these 3 nodes:

**NODE 1: Webhook**
- Type: Webhook
- HTTP Method: POST
- Path: `discord-reply`
- Response Mode: Using 'Respond to Webhook' node

**NODE 2: Supabase**
- Operation: Create
- Table: `messages`
- Fields:
  - session_id: `{{ $json.session_id }}`
  - role: `human`
  - content: `{{ $json.content }}`

**NODE 3: Respond to Webhook**
- Response Body: `{ "success": true }`

### Connect: Webhook → Supabase → Respond

### ACTIVATE the workflow!

### Copy the webhook URL (it should look like):
`https://figmenta-agent.app.n8n.cloud/webhook/discord-reply`

---

## ✅ STEP 3: Update Main Workflow to Create Threads (5 minutes)

In your main chat workflow, AFTER the "Discord Notification" node:

### Add: HTTP Request node (Create Thread)
- Method: POST
- URL: `https://discord.com/api/v10/channels/{{ $json.id }}/messages/{{ $json.id }}/threads`
- (Actually need message ID - see below)

**SIMPLER OPTION**: Just use the format in Discord messages.
When human wants to reply, they type: `@SESSION_ID: your message here`

The bot already handles this format!

---

## ✅ STEP 4: Install and Run Discord Bot (2 minutes)

Open terminal in VSCode and run:

```powershell
cd "c:\Users\Bishal\Desktop\Projects\ai agent\discord-bot"
npm install
npm start
```

You should see:
```
✅ Figmenta Bot ready! Logged in as FigmentaAI#xxxx
📡 Listening for messages in channel: 1462179562338386198
```

---

## ✅ STEP 5: Test the Full Flow (3 minutes)

1. Open your web chat: https://figmentaai.vercel.app/
2. Start a conversation, say: "I want to talk to someone"
3. Wait for Discord notification (it will show Session ID)
4. In Discord, reply using format: `@SESSION_ID: Hello from the team!`
5. Check web chat - message should appear!
6. Bot reacts with ✅ if successful

---

# 🎉 THAT'S IT!

Once everything is set up:
- Web chat → AI with discovery → Escalation → Discord notification
- Human replies in Discord → Instantly appears in web chat
- AI is paused while human is active

---

# HOSTING THE BOT (for 24/7 operation)

For demo: Run locally on your computer
For production: Deploy to Replit, Railway, or Render (free tier available)

---

# TROUBLESHOOTING

**Bot not responding?**
- Check if MESSAGE CONTENT INTENT is enabled
- Make sure bot is in the server

**Webhook not working?**
- Verify n8n workflow is ACTIVE
- Check webhook URL is correct in .env

**Messages not showing in web chat?**
- Check Supabase messages table
- Verify session_id matches
