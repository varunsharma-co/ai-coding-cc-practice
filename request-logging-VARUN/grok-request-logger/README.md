# Grok request logger for this project

These steps log one Grok Build (`grok`) session in this project only.

They do not change `~/.grok`, `~/.zshrc`, or any other project. The stand-in home folder is `grok-request-logger/grok-home/`. Delete that folder when you are done.

You do **not** need an API key. Your existing Grok account login is used automatically.

Use two terminals. Leave Terminal 1 running, then start Terminal 2.

> **Note:** Run both commands from the folder containing `request-logger/` and `grok-request-logger/`. All commands use `$PWD`, so they work automatically in any folder on your computer!

---

## Terminal 1 — start the logger

Run this in Terminal 1:

```bash
npx tsx request-logger/proxy.ts --force
```

Answer the questions like this:

1. **Which coding agent do you use?** `Grok Build`
2. **Which model provider do you use with Grok Build?** `Grok account login (no API key)`
3. **Remember this for next time?** `Yes`

Wait until the banner shows:

```text
Listening  http://localhost:8787
```

Leave this terminal open. Use Terminal 2 to run Grok.

---

## Terminal 2 — run grok through the logger

Open a second terminal in the same directory, then paste the whole block:

```bash
GROK_HOME="$PWD/grok-request-logger/grok-home" \
GROK_CLI_CHAT_PROXY_BASE_URL="http://127.0.0.1:8787/v1" \
grok
```

The backslashes must stay at the end of those lines. They join the block into one command.

What each part does:

- `GROK_HOME="$PWD/grok-request-logger/grok-home"` makes Grok read this local folder instead of your real `~/.grok`. The `auth.json` inside provides your current login without asking for an API key.
- `GROK_CLI_CHAT_PROXY_BASE_URL` redirects Grok's chat requests to the local logger.
- `grok` starts the Grok Build CLI.

Now use Grok on this project as you normally would.

---

## Read the log

Each model call writes a file in:

```text
request-logger/logs/
```

Open the newest file ending in `.md` to see the system prompt, tool schemas, and messages.

---

## Stop

1. In Terminal 2, press **Ctrl+C** (or type `/quit`) to exit Grok.
2. In Terminal 1, press **Ctrl+C** to stop the logger.

Your normal Grok outside this project is untouched and still uses `~/.grok`.

---

## Clean up & Reset

To reset or prepare the temporary home folder on a new machine:

```bash
mkdir -p grok-request-logger/grok-home
cp ~/.grok/auth.json grok-request-logger/grok-home/auth.json
printf '%s\n' '[endpoints]
cli_chat_proxy_base_url = "http://127.0.0.1:8787/v1"
' > grok-request-logger/grok-home/config.toml
```
