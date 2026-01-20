/**
 * Figmenta Discord Bot
 * Real-time human reply handler
 * 
 * This bot listens for messages in the #human-escalation channel
 * and forwards human replies to the web chat via n8n webhook
 */

require('dotenv').config();
const { Client, GatewayIntentBits, Events } = require('discord.js');

// Configuration
const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
const N8N_WEBHOOK_URL = process.env.N8N_REPLY_WEBHOOK_URL;
const ESCALATION_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

// Create Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

// Track processed messages to avoid duplicates
const processedMessages = new Set();

// Bot ready
client.once(Events.ClientReady, (c) => {
    console.log(`✅ Figmenta Bot ready! Logged in as ${c.user.tag}`);
    console.log(`📡 Listening for messages in channel: ${ESCALATION_CHANNEL_ID}`);
});

// Listen for new messages
client.on(Events.MessageCreate, async (message) => {
    try {
        // Ignore bot messages
        if (message.author.bot) return;

        // Only process messages from escalation channel or its threads
        const isEscalationChannel = message.channel.id === ESCALATION_CHANNEL_ID;
        const isThread = message.channel.isThread() &&
            message.channel.parentId === ESCALATION_CHANNEL_ID;

        if (!isEscalationChannel && !isThread) return;

        // Avoid processing same message twice
        if (processedMessages.has(message.id)) return;
        processedMessages.add(message.id);

        // Clean up old processed messages (keep last 100)
        if (processedMessages.size > 100) {
            const arr = Array.from(processedMessages);
            processedMessages.clear();
            arr.slice(-50).forEach(id => processedMessages.add(id));
        }

        console.log(`📨 Human message received from ${message.author.username}`);

        // Extract session ID from thread name or message reference
        let sessionId = null;

        if (isThread) {
            // Thread name format: "Session: session_id_here"
            const threadName = message.channel.name;
            const match = threadName.match(/Session:\s*(.+)/i);
            if (match) {
                sessionId = match[1].trim();
            }
        } else {
            // Check if message is a reply - get session from parent message
            if (message.reference) {
                const repliedTo = await message.channel.messages.fetch(message.reference.messageId);
                const sessionMatch = repliedTo.content.match(/Session ID:\*\*\s*([^\s\n]+)/);
                if (sessionMatch) {
                    sessionId = sessionMatch[1].trim();
                }
            }

            // Or extract from message content (format: @session_id: message)
            const contentMatch = message.content.match(/^@([^:]+):\s*(.+)/s);
            if (contentMatch) {
                sessionId = contentMatch[1].trim();
            }
        }

        if (!sessionId) {
            console.log('⚠️ Could not extract session ID, skipping...');
            // Reply to user with instructions
            await message.reply('⚠️ Could not find session ID. Please reply in a thread or use format: `@session_id: your message`');
            return;
        }

        console.log(`🔗 Session ID: ${sessionId}`);

        // Get the actual message content
        let content = message.content;

        // If using @session format, extract just the message
        const formatMatch = content.match(/^@[^:]+:\s*(.+)/s);
        if (formatMatch) {
            content = formatMatch[1].trim();
        }

        // Send to n8n webhook
        const payload = {
            session_id: sessionId,
            content: content,
            author: message.author.username,
            author_id: message.author.id,
            message_id: message.id,
            channel_id: message.channel.id,
            timestamp: message.createdAt.toISOString()
        };

        console.log('📤 Sending to n8n webhook...');

        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log('✅ Message forwarded to web chat successfully!');
            // React to confirm
            await message.react('✅');
        } else {
            console.error('❌ Failed to forward message:', response.status);
            await message.react('❌');
        }

    } catch (error) {
        console.error('❌ Error processing message:', error);
    }
});

// Error handling
client.on('error', console.error);

// Login
client.login(DISCORD_TOKEN);
