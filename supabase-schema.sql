-- =============================================
-- Figmenta Chat - Supabase Database Schema
-- Run this in Supabase SQL Editor
-- VERSION 2: Fixed ordering issues
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. CONVERSATIONS TABLE (Create First)
-- =============================================
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT UNIQUE NOT NULL,
    user_email TEXT,
    phase TEXT DEFAULT 'discovery',
    discord_thread_id TEXT,
    discord_channel_id TEXT,
    human_agent_id TEXT,
    human_takeover_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. MESSAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. DISCOVERY DATA TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS discovery_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID,
    session_id TEXT NOT NULL,
    project_type TEXT,
    brand_name TEXT,
    industry TEXT,
    budget TEXT,
    timeline TEXT,
    questions_asked JSONB DEFAULT '[]'::jsonb,
    questions_answered INTEGER DEFAULT 0,
    all_questions_asked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. CREATE INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_discord_thread ON conversations(discord_thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_discovery_session ON discovery_data(session_id);

-- =============================================
-- 5. AUTO-UPDATE TRIGGER FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================
-- 6. ROW LEVEL SECURITY (Allow all for now)
-- =============================================
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_data ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow all for conversations" ON conversations;
DROP POLICY IF EXISTS "Allow all for messages" ON messages;
DROP POLICY IF EXISTS "Allow all for discovery_data" ON discovery_data;

-- Create permissive policies
CREATE POLICY "Allow all for conversations" ON conversations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for messages" ON messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for discovery_data" ON discovery_data FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- 7. ENABLE REALTIME
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
