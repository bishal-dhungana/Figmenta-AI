/**
 * Figmenta Discord Bot
 * Real-time human reply handler
 * 
 * This bot listens for messages in the #human-escalation channel
 * and forwards human replies to the web chat via n8n webhook
 */

require('dotenv').config();
const { Client, GatewayIntentBits, Events } = require('discord.js');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
const N8N_WEBHOOK_URL = process.env.N8N_REPLY_WEBHOOK_URL;
const ESCALATION_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

// Supabase client for AI resume
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ozrszmkvkdrbqsnsyfxn.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96cnN6bWt2a2RyYnFzbnN5ZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NjA3NTgsImV4cCI6MjA4NDIzNjc1OH0.TSraEzfBPdLGDM_AJMn0nQzKp4ntVePhjS84RKE4vIk';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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

        // Check for AI resume commands
        const isAiResumeCommand = content.toLowerCase() === '/ai' ||
            content.toLowerCase() === 'ai resume' ||
            content.toLowerCase() === '/ai resume' ||
            content.toLowerCase() === '"ai resume"';

        if (isAiResumeCommand) {
            console.log('🤖 AI Resume command detected! Updating phase to ai_active...');

            // Update Supabase to set phase back to ai_active
            const { error } = await supabase
                .from('conversations')
                .update({ phase: 'ai_active' })
                .eq('session_id', sessionId);

            if (error) {
                console.error('❌ Failed to resume AI:', error);
                await message.reply('❌ Failed to resume AI. Please try again.');
            } else {
                console.log('✅ AI resumed successfully!');
                await message.reply(`✅ AI has been resumed for session \`${sessionId}\`. The customer can now chat with Fig1 again.`);
                await message.react('🤖');
            }
            return; // Don't forward this command to web chat
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
