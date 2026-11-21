# Portable Request Logger (VARUN)

A portable, self-contained version of Matt Pocock's **Request Logger** with custom support for:
- **Grok Build** (`grok`) — works using your account login (no API key required).
- **Antigravity CLI** (`agy`) — works using a Gemini API key.

Everything in this folder is **project-isolated**: it never modifies your global `~/.gemini` or `~/.grok` configurations, and it uses `$PWD` so you **never have to change folder paths manually**.

---

## Folder Structure

```text
request-logging-VARUN/
├── README.md                      <-- This guide
├── request-logger/                <-- The proxy engine (zero config needed)
│   ├── logs/                      <-- Where all readable .md logs are saved
│   └── package.json
├── grok-request-logger/           <-- Grok Build instructions & isolated config
│   ├── README.md
│   └── grok-home/
└── gemini-request-logger/         <-- Antigravity CLI instructions & isolated config
    ├── README.md
    └── agy-home/
```

---

## How to use this in ANY project

1. **Copy this entire folder** (`request-logging-VARUN/`) into your desired project directory.
2. Open your terminal and `cd` into it:
   ```bash
   cd path/to/your-project/request-logging-VARUN
   ```
3. Follow the quick steps below for either **Grok Build** or **Antigravity CLI**.

---

## Quick Start: Grok Build

### Terminal 1 — Start the logger
```bash
npx tsx request-logger/proxy.ts --force
```
- Select: **`Grok Build`**
- Provider: **`Grok account login (no API key)`**
- Remember: **`Yes`**

### Terminal 2 — Run Grok
```bash
GROK_HOME="$PWD/grok-request-logger/grok-home" \
GROK_CLI_CHAT_PROXY_BASE_URL="http://127.0.0.1:8787/v1" \
grok
```

---

## Quick Start: Antigravity CLI

### Terminal 1 — Start the logger
```bash
npx tsx request-logger/proxy.ts --force
```
- Select: **`Antigravity CLI`**
- Provider: **`Gemini API key`**
- Remember: **`Yes`**

### Terminal 2 — Run Antigravity CLI
```bash
HOME="$PWD/gemini-request-logger/agy-home" \
GEMINI_API_KEY="your-gemini-api-key" \
GOOGLE_GEMINI_BASE_URL="http://127.0.0.1:8787" \
agy
```

---

## Viewing the Logs

Every turn creates a readable Markdown file in:
```text
request-logger/logs/
```
Open the newest `.md` file to see:
- `<system-prompt>`: All agent instructions.
- `<tools>`: Schemas of every tool available to the model.
- `<messages>`: Conversation turns and tool calls.
- `<response>`: Model reply and token count.
