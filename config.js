/**
 * Figmenta Chat Configuration
 * Contains all API keys and endpoints
 * 
 * IMPORTANT: Copy this file to config.local.js and add your actual credentials there
 * OR use environment variables in production
 */

const CONFIG = {
    // ===== Supabase Configuration =====
    // Get these from your Supabase project settings
    SUPABASE_URL: 'YOUR_SUPABASE_URL',
    SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY',

    // ===== n8n Configuration =====
    N8N_INSTANCE_URL: 'YOUR_N8N_INSTANCE_URL',
    N8N_WEBHOOK_CHAT: 'YOUR_N8N_WEBHOOK_URL/webhook/chat',

    // ===== AI Configuration (NVIDIA API - OpenAI Compatible) =====
    AI_BASE_URL: 'https://integrate.api.nvidia.com/v1',
    AI_API_KEY: 'YOUR_NVIDIA_API_KEY',
    AI_MODEL: 'nvidia/llama-3.1-nemotron-70b-instruct',

    // ===== Discord Configuration =====
    DISCORD_BOT_TOKEN: 'YOUR_DISCORD_BOT_TOKEN',
    DISCORD_CHANNEL_ID: 'YOUR_DISCORD_CHANNEL_ID',

    // ===== Business Hours (CET) =====
    BUSINESS_HOURS: {
        timezone: 'Europe/Rome',
        start: 9,
        end: 18,
        days: [1, 2, 3, 4, 5],
    },

    // ===== Session Configuration =====
    SESSION_KEY: 'figmenta_session_id',
    MESSAGES_KEY: 'figmenta_messages',

    // ===== AI Agent Persona =====
    AGENT_NAME: 'Fig1',
    AGENT_DESCRIPTION: 'Figmenta AI Assistant',

    // ===== Discovery Questions =====
    DISCOVERY_QUESTIONS: [
        {
            id: 'project_type',
            question: "What type of project are you looking to work on? (e.g., branding, website, social media campaign)",
            field: 'project_type'
        },
        {
            id: 'brand_name',
            question: "What's the name of your brand or company?",
            field: 'brand_name'
        },
        {
            id: 'industry',
            question: "What industry are you operating in?",
            field: 'industry'
        },
        {
            id: 'budget',
            question: "Do you have an approximate budget in mind for this project?",
            field: 'budget'
        },
        {
            id: 'timeline',
            question: "What's your ideal timeline for completing this project?",
            field: 'timeline'
        }
    ],

    // ===== Messages =====
    MESSAGES: {
        welcome: "Hi! I'm Fig1, Figmenta's AI assistant. I'd love to learn more about your project and how we can help. What type of project are you looking to work on?",
        askEmail: "Perfect! I've got all the details about your project. Before I connect you with our team, could you share your email address?",
        insideHours: "Great! I see one of our team members is available right now. Would you like to:\n\n1️⃣ **Talk to someone now** - Get connected immediately\n2️⃣ **Email later** - We'll reach out within 24 hours",
        outsideHours: "Our team is currently offline (we're available Mon-Fri, 9AM-6PM CET). I'd be happy to collect any additional details and forward them to our team. They'll reach out to you first thing!",
        humanConnecting: "Connecting you with a team member now. Please hold on...",
        humanTimeout: "I apologize, but our team members are currently busy. Would you like to leave additional details for us to follow up on, or try again later?",
        humanJoined: "A team member has joined the chat!",
        jobsRedirect: "For job inquiries, please email us at hr@figmenta.com. Is there anything else I can help you with regarding our services?",
        outOfScope: "I'm here to help with Figmenta's digital services. Is there anything specific about branding, web development, or digital marketing I can help you with?"
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
