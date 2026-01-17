/**
 * Figmenta Chat Widget - Fig1 AI Assistant
 * Handles chat functionality with Supabase integration
 */

// ===== Load Supabase Client =====
const SUPABASE_URL = 'https://ozrszmkvkdrbqsnsyfxn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96cnN6bWt2a2RyYnFzbnN5ZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NjA3NTgsImV4cCI6MjA4NDIzNjc1OH0.TSraEzfBPdLGDM_AJMn0nQzKp4ntVePhjS84RKE4vIk';
const N8N_WEBHOOK_URL = 'https://figmenta-agent.app.n8n.cloud/webhook/chat';

// Session keys
const SESSION_KEY = 'figmenta_session_id';
const MESSAGES_KEY = 'figmenta_messages';

// Welcome message
const WELCOME_MESSAGE = "Hi! I'm Fig1, Figmenta's AI assistant. I'd love to learn more about your project and how we can help. What type of project are you looking to work on?";

// ===== State =====
let state = {
    sessionId: null,
    isOpen: false,
    isTyping: false,
    messages: [],
    phase: 'discovery',
    humanActive: false,
    supabaseClient: null,
    realtimeChannel: null,
};

// ===== Supabase Client Initialization =====
async function initSupabase() {
    // Load Supabase from CDN if not already loaded
    if (typeof window.supabase === 'undefined') {
        await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
    }

    state.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase client initialized');

    // Subscribe to realtime messages
    subscribeToMessages();
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// ===== Realtime Subscription =====
function subscribeToMessages() {
    if (!state.supabaseClient || !state.sessionId) return;

    state.realtimeChannel = state.supabaseClient
        .channel('messages-channel')
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `session_id=eq.${state.sessionId}`
            },
            (payload) => {
                console.log('New message received:', payload);
                const newMessage = payload.new;

                // Only show messages from HUMAN (team member replies)
                // Don't show 'assistant' here - we get those from webhook response
                // Don't show 'user' here - we already added those when sending
                if (newMessage.role === 'human') {
                    hideTypingIndicator();
                    addHumanMessage(newMessage.content);
                    state.humanActive = true;
                }
                // Ignore 'assistant' and 'user' roles from realtime
                // to prevent duplicates (they're already shown from other sources)
            }
        )
        .subscribe();
}

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', async () => {
    initSession();
    loadMessages();
    await initSupabase();
});

function initSession() {
    let sessionId = localStorage.getItem(SESSION_KEY);
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem(SESSION_KEY, sessionId);
    }
    state.sessionId = sessionId;
    console.log('Session initialized:', sessionId);
}

function loadMessages() {
    const savedMessages = localStorage.getItem(MESSAGES_KEY);
    if (savedMessages) {
        state.messages = JSON.parse(savedMessages);
        renderMessages();
    }
}

function saveMessages() {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(state.messages));
}

// ===== Chat UI Functions =====
function toggleChat() {
    state.isOpen = !state.isOpen;
    const popup = document.getElementById('chat-popup');
    const chatToggle = document.getElementById('chat-toggle');
    const chatIcon = document.getElementById('chat-icon');
    const closeIcon = document.getElementById('close-icon');

    if (state.isOpen) {
        popup.classList.remove('hidden');
        chatToggle.classList.add('hidden'); // Hide the entire toggle button
        chatIcon.classList.add('hidden');
        closeIcon.classList.remove('hidden');

        if (state.messages.length === 0) {
            setTimeout(() => {
                addBotMessage(WELCOME_MESSAGE);
            }, 500);
        }

        scrollToBottom();
    } else {
        popup.classList.add('hidden');
        chatToggle.classList.remove('hidden'); // Show toggle button again
        chatIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
    }
}

function openChat() {
    if (!state.isOpen) {
        toggleChat();
    }
}

function scrollToBottom() {
    const messagesContainer = document.getElementById('chat-messages');
    setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
}

function renderMessages() {
    const container = document.getElementById('chat-messages');
    container.innerHTML = '';

    state.messages.forEach(msg => {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${msg.role}`;
        messageEl.innerHTML = parseMarkdown(msg.content);
        container.appendChild(messageEl);
    });

    scrollToBottom();
}

function addMessage(role, content) {
    state.messages.push({ role, content, timestamp: Date.now() });

    const container = document.getElementById('chat-messages');
    const messageEl = document.createElement('div');
    messageEl.className = `message ${role}`;

    // Parse markdown to HTML
    messageEl.innerHTML = parseMarkdown(content);
    container.appendChild(messageEl);

    saveMessages();
    scrollToBottom();
}

// Simple markdown parser for chat messages
function parseMarkdown(text) {
    if (!text) return '';

    // Escape HTML first to prevent XSS
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Convert **bold** to <strong>
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Convert *italic* to <em>
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Convert URLs to clickable links
    html = html.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank" rel="noopener" style="color: #818cf8; text-decoration: underline;">$1</a>'
    );

    // Convert newlines to <br>
    html = html.replace(/\n/g, '<br>');

    return html;
}

function addBotMessage(content) {
    addMessage('bot', content);
}

function addUserMessage(content) {
    addMessage('user', content);
}

function addHumanMessage(content) {
    addMessage('human', content);
}

function showTypingIndicator() {
    if (state.isTyping) return;

    state.isTyping = true;
    const container = document.getElementById('chat-messages');
    const typingEl = document.createElement('div');
    typingEl.className = 'typing-indicator';
    typingEl.id = 'typing-indicator';
    typingEl.innerHTML = '<span></span><span></span><span></span>';
    container.appendChild(typingEl);
    scrollToBottom();
}

function hideTypingIndicator() {
    state.isTyping = false;
    const typingEl = document.getElementById('typing-indicator');
    if (typingEl) {
        typingEl.remove();
    }
}

// ===== Message Handling =====
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();

    if (!message) return;

    input.value = '';
    addUserMessage(message);
    showTypingIndicator();

    try {
        console.log('Sending message to n8n:', message);
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                session_id: state.sessionId,
                timestamp: new Date().toISOString(),
            }),
        });

        console.log('Response status:', response.status);

        // Get the raw text first to debug
        const rawText = await response.text();
        console.log('Raw response:', rawText);

        if (!rawText || rawText.trim() === '') {
            console.warn('Empty response from n8n - check Respond to Webhook node');
            hideTypingIndicator();
            addBotMessage("I received your message! Let me process that... (If this keeps happening, the AI might be warming up)");
            return;
        }

        // Parse JSON
        const data = JSON.parse(rawText);
        hideTypingIndicator();

        if (data.response) {
            addBotMessage(data.response);
        } else if (data.output) {
            // Alternative field name
            addBotMessage(data.output);
        } else {
            console.log('Response data:', data);
            addBotMessage("I'm processing your request...");
        }

        if (data.phase) {
            state.phase = data.phase;
        }

        if (data.human_active !== undefined) {
            state.humanActive = data.human_active;
        }

        // Handle quick replies if provided
        if (data.quick_replies && data.quick_replies.length > 0) {
            showQuickReplies(data.quick_replies);
        }

    } catch (error) {
        console.error('Error sending message:', error);
        hideTypingIndicator();

        // Check if it's a network/CORS error
        if (error.message.includes('Failed to fetch')) {
            console.error('Network or CORS error - check if n8n workflow is active');
        }

        // Fallback to demo mode
        showDemoResponse(message);
    }
}

// ===== Quick Replies =====
function showQuickReplies(replies) {
    const container = document.getElementById('chat-messages');
    const quickRepliesEl = document.createElement('div');
    quickRepliesEl.className = 'quick-replies';
    quickRepliesEl.id = 'quick-replies';

    replies.forEach(reply => {
        const button = document.createElement('button');
        button.className = 'quick-reply-btn';
        button.textContent = reply.label;
        button.onclick = () => handleQuickReply(reply.value);
        quickRepliesEl.appendChild(button);
    });

    container.appendChild(quickRepliesEl);
    scrollToBottom();
}

function handleQuickReply(value) {
    // Remove quick replies
    const quickRepliesEl = document.getElementById('quick-replies');
    if (quickRepliesEl) {
        quickRepliesEl.remove();
    }

    // Send as message
    const input = document.getElementById('chat-input');
    input.value = value;
    sendMessage();
}

// ===== Demo Mode (for testing without backend) =====
const demoState = {
    questionsAsked: 0,
    questions: [
        "Great choice! Could you tell me a bit about your brand? What's the name of your company or brand?",
        "Nice to meet you! What industry are you operating in? This helps us understand your target audience better.",
        "Wonderful! Do you have an approximate budget in mind for this project?",
        "Almost there! What's your ideal timeline for completing this project?",
        "Perfect! I've gathered all the details. Before I connect you with our team, could you share your email address?",
        "Great! I see one of our team members is available. Would you like to 'Talk to someone now' or 'Email later'?"
    ]
};

function showDemoResponse(userMessage) {
    setTimeout(() => {
        hideTypingIndicator();

        if (demoState.questionsAsked < demoState.questions.length) {
            addBotMessage(demoState.questions[demoState.questionsAsked]);
            demoState.questionsAsked++;
        } else {
            addBotMessage("Thank you! Our team will be in touch shortly. Is there anything else I can help you with?");
        }
    }, 1500);
}

// ===== Utility Functions =====
function clearChat() {
    state.messages = [];
    demoState.questionsAsked = 0;
    localStorage.removeItem(MESSAGES_KEY);
    renderMessages();
}

function resetSession() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(MESSAGES_KEY);
    location.reload();
}

// Export for console debugging
window.FigmentaChat = {
    state,
    demoState,
    clearChat,
    resetSession,
    addBotMessage,
    addHumanMessage,
};
