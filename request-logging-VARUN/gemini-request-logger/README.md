# Gemini request logger for this project

These steps log one Antigravity CLI (`agy`) session in this project only.

They do not change `~/.gemini`, `~/.zshrc`, or any other project. The stand-in home folder is `gemini-request-logger/agy-home/`. Delete that folder when you are done.

You need a Gemini API key. A Google login is not used for this run.

Use two terminals. Leave Terminal 1 running, then start Terminal 2.

> **Note:** Run both commands from the folder containing `request-logger/` and `gemini-request-logger/`. All commands use `$PWD`, so they work automatically in any folder on your computer!

---

## Terminal 1 — start the logger

Run this in Terminal 1:

```bash
npx tsx request-logger/proxy.ts --force
```

If it asks questions, answer them like this:

1. **Which coding agent do you use?** `Antigravity CLI`
2. **Which model provider do you use with Antigravity CLI?** `Gemini API key`
3. **Remember this for next time?** `Yes`

Wait until the banner shows:

```text
Listening  http://localhost:8787
```

Leave this terminal open. Do not run the `agy` command that the banner prints (that command would use your real home folder). Use Terminal 2 instead.

---

## Terminal 2 — run agy through the logger

Open a second terminal in the same directory. Replace `paste-your-key-here` with your Gemini API key, then paste the whole block:

```bash
HOME="$PWD/gemini-request-logger/agy-home" \
GEMINI_API_KEY="paste-your-key-here" \
GOOGLE_GEMINI_BASE_URL="http://127.0.0.1:8787" \
agy
```

The backslashes must stay at the end of those lines. They join the block into one command.

What each part does:

- `HOME="$PWD/gemini-request-logger/agy-home"` makes `agy` read this local stand-in home instead of your real home folder. The `settings.json` in there tells `agy` to use `"modelProvider": "gemini"`, which turns off Google login for this run only.
- `GEMINI_API_KEY` is your key.
- `GOOGLE_GEMINI_BASE_URL` sends this run to the local logger.

The `agy` header should say **Gemini API key**, not your Google email. Then use `agy` as you normally would.

---

## Read the log

Each model call writes a file in:

```text
request-logger/logs/
```

Open the newest file ending in `.md` to see the system prompt, tool schemas, and messages.

---

## Stop

1. In Terminal 2, press **Ctrl+C** to quit `agy`.
2. In Terminal 1, press **Ctrl+C** to stop the logger.

Your normal `agy` outside this folder is untouched and still on Google login.

---

## Clean up & Reset

To clean up or reset the temporary home folder:

```bash
mkdir -p gemini-request-logger/agy-home/.gemini/antigravity-cli
printf '%s\n' '{
  "modelProvider": "gemini"
}' > gemini-request-logger/agy-home/.gemini/antigravity-cli/settings.json
```
