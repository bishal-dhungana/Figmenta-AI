# n8n Workflow: Discord Reply Receiver

Copy this prompt to n8n "Build with AI" to create the webhook that receives human replies:

---

## PROMPT FOR N8N:

```
Create a workflow called "Discord Reply Receiver" with these nodes:

1. WEBHOOK TRIGGER
- Name: Discord Reply Webhook
- HTTP Method: POST
- Path: discord-reply
- Response Mode: Respond immediately with success

2. SUPABASE - Save Human Message
- Operation: Create row
- Table: messages
- Fields:
  - session_id: {{ $json.session_id }}
  - role: "human"
  - content: {{ $json.content }}

3. SUPABASE - Update Conversation Phase
- Operation: Update rows
- Table: conversations
- Filter: session_id equals {{ $json.session_id }}
- Update fields:
  - phase: "human_active"

4. RESPOND TO WEBHOOK
- Response: { "success": true }

CONNECTIONS:
Webhook → Save Human Message → Update Conversation Phase → Respond

Use my existing Supabase account credentials.
```

---

## MANUAL SETUP:

If AI doesn't work, here are the exact nodes:

### Node 1: Webhook
- Type: Webhook
- Method: POST
- Path: `discord-reply`
- Response Mode: Using "Respond to Webhook" node

### Node 2: Supabase - Save Message
- Operation: Create
- Table: `messages`
- Fields:
  - session_id: `{{ $json.session_id }}`
  - role: `human`
  - content: `{{ $json.content }}`

### Node 3: Supabase - Update Phase
- Operation: Update
- Table: `conversations`
- Filter: session_id = `{{ $json.session_id }}`
- Fields:
  - phase: `human_active`

### Node 4: Respond to Webhook
- Body: `{ "success": true, "session_id": "{{ $json.session_id }}" }`

---

## AFTER SETUP:

1. Get the webhook URL (looks like: `https://xxx.app.n8n.cloud/webhook/discord-reply`)
2. Add this URL to your Discord bot's `.env` file as `N8N_REPLY_WEBHOOK_URL`
3. Activate the workflow
