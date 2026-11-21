# Gemini request logger for this project

These steps log one Antigravity CLI (`agy`) session in this project only.

They do not change `~/.gemini`, `~/.zshrc`, or any other project. The stand-in home folder is `gemini-request-logger/agy-home/` in this repo. Delete that folder when you are done.

You need a Gemini API key. A Google login is not used for this run.

Use two terminals. Leave Terminal 1 running, then start Terminal 2.

## Terminal 1 — start the logger

Paste this:

```bash
cd /Users/varun/Desktop/MProjects/Python/Misc/Practice/Matt-Pocock-Coding-Practice/ai-coding-crash-course
npm run request-logger
```

If it asks questions, answer them like this:

1. **Which coding agent do you use?** `Antigravity CLI`
2. **Which model provider do you use with Antigravity CLI?** `Gemini API key`
3. **Remember this for next time?** `Yes`

`Yes` is safe. The memory is stored only in this project, in `request-logger/.agent-choice.json`.

If it does not ask, and the banner does not say `Antigravity CLI (Gemini API key)`, stop it with Ctrl+C and paste this instead:

```bash
cd /Users/varun/Desktop/MProjects/Python/Misc/Practice/Matt-Pocock-Coding-Practice/ai-coding-crash-course
npm run request-logger -- --force
```

Then answer the three questions the same way.

Wait until the banner shows:

```text
Listening  http://localhost:8787
```

Leave this terminal open. Do not run the `agy` command that the banner prints. That command would use your real home folder. Use Terminal 2 instead.

## Terminal 2 — run agy through the logger

Open a second terminal. Replace `paste-your-key-here` with your Gemini API key, then paste the whole block:

```bash
cd /Users/varun/Desktop/MProjects/Python/Misc/Practice/Matt-Pocock-Coding-Practice/ai-coding-crash-course

HOME="/Users/varun/Desktop/MProjects/Python/Misc/Practice/Matt-Pocock-Coding-Practice/ai-coding-crash-course/gemini-request-logger/agy-home" \
GEMINI_API_KEY="paste-your-key-here" \
GOOGLE_GEMINI_BASE_URL="http://127.0.0.1:8787" \
agy
```

The backslashes must stay at the end of those lines. They join the block into one command.

What each part does:

- `HOME=...` makes this run read `gemini-request-logger/agy-home/` instead of your real home. The file `settings.json` in there already contains `"modelProvider": "gemini"`, which turns off Google login for this run only.
- `GEMINI_API_KEY` is your key. `agy` does not read a `.env` file.
- `GOOGLE_GEMINI_BASE_URL` sends this run to the logger.

The `agy` header should say **Gemini API key**, not your Google email. Then use `agy` on this project as you normally would.

## Read the log

Each model call writes a file in:

```text
request-logger/logs/
```

Open the newest file whose name ends in `.md`. That file shows the system prompt, the tool list, and the tool calls.

If the folder stays empty, check all three of these:

- Terminal 1 is still running and says it is listening on port `8787`.
- The `agy` header says **Gemini API key**.
- You started `agy` with the Terminal 2 command, not the command printed by the logger.

## Stop

1. In Terminal 2, press Ctrl+C to quit `agy`.
2. In Terminal 1, press Ctrl+C to stop the logger.

Your normal `agy` is still on Google login. This run never edited `~/.gemini`.

## Clean up

To drop the temporary home, delete this folder:

```text
gemini-request-logger/agy-home/
```

If you want to run the logger again later, paste this once from the project root, then repeat Terminal 1 and Terminal 2:

```bash
cd /Users/varun/Desktop/MProjects/Python/Misc/Practice/Matt-Pocock-Coding-Practice/ai-coding-crash-course
mkdir -p gemini-request-logger/agy-home/.gemini/antigravity-cli
printf '%s\n' '{
  "modelProvider": "gemini"
}' > gemini-request-logger/agy-home/.gemini/antigravity-cli/settings.json
```
