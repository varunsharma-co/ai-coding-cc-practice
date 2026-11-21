# Grok request logger for this project

These steps log one Grok Build (`grok`) session in this project only.

They do not change `~/.grok`, `~/.zshrc`, or any other project. The stand-in home folder is `grok-request-logger/grok-home/` in this repo. Delete that folder when you are done.

You do **not** need an API key. Your existing Grok account login is used automatically.

Use two terminals. Leave Terminal 1 running, then start Terminal 2.

## Terminal 1 — start the logger

Paste this:

```bash
cd /Users/varun/Desktop/MProjects/Python/Misc/Practice/Matt-Pocock-Coding-Practice/ai-coding-crash-course
npm run request-logger -- --force
```

Answer the questions like this:

1. **Which coding agent do you use?** `Grok Build`
2. **Which model provider do you use with Grok Build?** `Grok account login (no API key)`
3. **Remember this for next time?** `Yes`

`Yes` is safe. The memory is stored only in this project, in `request-logger/.agent-choice.json`.

Wait until the banner shows:

```text
Listening  http://localhost:8787
```

Leave this terminal open. Use Terminal 2 to run Grok.

## Terminal 2 — run grok through the logger

Open a second terminal, then paste the whole block:

```bash
cd /Users/varun/Desktop/MProjects/Python/Misc/Practice/Matt-Pocock-Coding-Practice/ai-coding-crash-course

GROK_HOME="/Users/varun/Desktop/MProjects/Python/Misc/Practice/Matt-Pocock-Coding-Practice/ai-coding-crash-course/grok-request-logger/grok-home" \
GROK_CLI_CHAT_PROXY_BASE_URL="http://127.0.0.1:8787/v1" \
grok
```

The backslashes must stay at the end of those lines. They join the block into one command.

What each part does:

- `GROK_HOME=...` makes Grok read `grok-request-logger/grok-home/` instead of your real home folder. The `auth.json` file inside uses your current login without asking for an API key.
- `GROK_CLI_CHAT_PROXY_BASE_URL` sends Grok's chat requests to the logger.
- `grok` starts the Grok Build CLI.

Now use Grok on this project as you normally would.

## Read the log

Each model call writes a file in:

```text
request-logger/logs/
```

Open the newest file whose name ends in `.md`. That file shows the system prompt, the tool list, and the tool calls.

If the folder stays empty, check both of these:

- Terminal 1 is still running and says it is listening on port `8787`.
- You started `grok` with the Terminal 2 command.

## Stop

1. In Terminal 2, press Ctrl+C (or type `/quit`) to exit Grok.
2. In Terminal 1, press Ctrl+C to stop the logger.

Your normal Grok outside this project is untouched and still uses `~/.grok`.

## Clean up

To drop the temporary home, delete this folder:

```text
grok-request-logger/grok-home/
```

If you want to run the logger again later, paste this once from the project root, then repeat Terminal 1 and Terminal 2:

```bash
cd /Users/varun/Desktop/MProjects/Python/Misc/Practice/Matt-Pocock-Coding-Practice/ai-coding-crash-course
mkdir -p grok-request-logger/grok-home
cp ~/.grok/auth.json grok-request-logger/grok-home/auth.json
printf '%s\n' '[endpoints]
cli_chat_proxy_base_url = "http://127.0.0.1:8787/v1"
' > grok-request-logger/grok-home/config.toml
```
