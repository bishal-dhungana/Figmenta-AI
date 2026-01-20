# Deploy Discord Bot to Oracle Cloud (Free Tier)

## Prerequisites
- Oracle Cloud account with VM instance running
- SSH access to the VM
- Node.js 18+ installed on VM

---

## Step 1: Connect to Your Oracle VM

```bash
ssh -i your-key.pem ubuntu@YOUR_VM_IP
```

---

## Step 2: Install Node.js (if not installed)

```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Install Node.js
nvm install 20
nvm use 20
```

---

## Step 3: Upload Bot Files

### Option A: Git Clone (recommended)
```bash
cd ~
git clone https://github.com/bishal-dhungana/Figmenta-AI.git
cd Figmenta-AI/discord-bot
```

### Option B: SCP from local
```bash
# From your local terminal
scp -i your-key.pem -r "c:\Users\Bishal\Desktop\Projects\ai agent\discord-bot" ubuntu@YOUR_VM_IP:~/
```

---

## Step 4: Create .env File on Server

```bash
cd ~/Figmenta-AI/discord-bot
nano .env
```

Paste your environment variables:
```
DISCORD_BOT_TOKEN=YOUR_TOKEN_HERE
N8N_REPLY_WEBHOOK_URL=https://figmenta-agent.app.n8n.cloud/webhook/discord-reply
DISCORD_CHANNEL_ID=1462179562338386198
```

Save: `Ctrl+X`, then `Y`, then `Enter`

---

## Step 5: Install Dependencies

```bash
npm install
```

---

## Step 6: Install PM2 (Process Manager)

PM2 keeps your bot running 24/7 and auto-restarts on crash:

```bash
npm install -g pm2
```

---

## Step 7: Start Bot with PM2

```bash
pm2 start bot.js --name figmenta-bot
```

---

## Step 8: Configure Auto-Start on Reboot

```bash
pm2 startup
pm2 save
```

---

## Useful PM2 Commands

| Command | Description |
|---------|-------------|
| `pm2 list` | Show all running processes |
| `pm2 logs figmenta-bot` | View bot logs |
| `pm2 restart figmenta-bot` | Restart the bot |
| `pm2 stop figmenta-bot` | Stop the bot |
| `pm2 monit` | Real-time monitor |

---

## Verify Bot is Running

```bash
pm2 list
```

You should see:
```
│ id │ name          │ status │ restart │
│ 0  │ figmenta-bot  │ online │ 0       │
```

---

## 🎉 Done!

Your Discord bot now runs 24/7 on Oracle Cloud!
