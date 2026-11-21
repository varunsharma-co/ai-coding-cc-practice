# Terminal Support and Troubleshooting

Grok Build runs as a full-screen TUI. It relies on terminal support for color,
clipboard, keyboard input, mouse input, and full-screen display. Terminals,
multiplexers, containers, and SSH sessions can handle these features differently.

## Diagnose and Fix Terminal Problems

Run `/doctor` in Grok to check the current session and see available fixes. If
Grok cannot start, run `grok doctor` in your shell. Use `grok doctor --json`
for a machine-readable report.

Doctor checks the terminal, multiplexer, color support, keyboard and newline
behavior, and clipboard routes. Doctor does not open the microphone; `/voice`
in Grok is what uses it. `grok doctor` and `/doctor` show a Voice line only
while voice mode is on and audio capture is included. `grok doctor` reads only
local settings such as `GROK_VOICE_MODE` and `config.toml`, so it can show the
line where a server-side switch or the account's plan keeps `/voice` off.
`/doctor` in Grok shows it only when `/voice` can start.
The in-app command can also check live session details such as
notification focus tracking and sandbox profile conflicts. `grok doctor` also
reports a config file, requirements file, or setting that stops Grok from
starting. `/doctor` inside a session does not run that check. `grok doctor` and
`/doctor` both flag an older `[ui] vim_mode` or a retired `[ui] simple_mode`
line in `config.toml`. On Linux both show whether other processes can read
Grok's `/proc` files (`proc_protection`, off by default), which setting decided
it, and `off: <reason>` when it is on but Linux refused it. On macOS both flag a
`GROK_HOME` you set under `/tmp`, where the system deletes files unused for 3 days.

A report can contain issues or recommendations and still exit successfully.
`grok doctor --json` reports the same color capability when piped.

`/terminal-setup` remains an alias for `/doctor`.

When Doctor finds an explicit unhealthy tmux setting, `/doctor fix` lists the
available automatic fixes. Apply one named fix at a time, for example
`/doctor fix tmux-clipboard` or `grok doctor fix dcs-passthrough --yes`.
Doctor can persist these four tmux options:

- `terminal.tmux-clipboard` — `set -g set-clipboard on`
- `terminal.dcs-passthrough` — `set -wg allow-passthrough on`
- `terminal.tmux-extended-keys` — `set -g extended-keys on`
- `terminal.tmux-truecolor` — `set -as terminal-features ",*:RGB"` (not offered
  behind mosh-server 1.3.2 or older; see
  [Colors look wrong or lack truecolor](#colors-look-wrong-or-lack-truecolor))

On tmux 3.0 and later, outside control mode (`tmux -CC`), `/doctor` reports
`terminal.tmux-escape-time` when `escape-time` is above 50 ms. tmux holds each
Esc that long, so Esc reaches Grok late, a key pressed in that time arrives with
it as one Alt chord, and a quick `Esc Esc` counts as one press. Outside the vim
prompt (`[keys] vim = "all"`), Esc then a quick `s` stashes the draft, as
`Alt+S` does; [Escape](03-keyboard-shortcuts.md#escape) says how the vim prompt
reads the chord. tmux 3.2 and later switch mintty (WSLtty, and by default Git
Bash, MSYS2, and Cygwin) to an Esc they pass on at once, so there you can ignore
the finding. Doctor doesn't change the option:
add `set -sg escape-time 10` (tmux 3.5's default) to your tmux config, then
reload tmux with the command the finding shows.

On tmux 3.3 and later, when the Kitty keyboard protocol is not active,
Shift+Enter, `Ctrl+.`, and the `Ctrl+Enter` that
[sends now](03-keyboard-shortcuts.md#during-an-active-turn-agent-running) also
need tmux to know that the terminal you attach from sends extended keys
(`extkeys` in `terminal-features`).
tmux's default `xterm*` entry lacks it. Add a line whose pattern matches
that terminal's `TERM`, for example
`set -as terminal-features 'xterm*:extkeys'`. A client reads
`terminal-features` only when it attaches, so detach and reattach
(`refresh-client` is not enough), then
`tmux display -p '#{client_termfeatures}'` should list `extkeys`. On tmux
3.5 and later you also need `set -s extended-keys-format csi-u`.
Doctor sets neither `extkeys` nor `extended-keys-format`. Until tmux forwards
these keys, `Ctrl+Enter` loses its `Ctrl`, so while nothing else is queued the
footer offers send now as `Enter Enter`.

Grok asks tmux for modifyOtherKeys mode 2 rather than mode 1, because mode 1
still sends keys that have a control-character form as those bytes. That covers
Ctrl+/ (dashboard search) and Ctrl+[ and Ctrl+] (moving between agents; Ctrl+[
arrives as Esc). Grok turns the mode off when it exits and while an external
editor (`$EDITOR`) or pager (`$PAGER`, from `/transcript`) runs. Mode 2 also
encodes Ctrl+C and Ctrl+D, so if Grok is killed in a way it cannot catch (for
example `kill -9` or the out-of-memory killer), the shell left in that pane
gets them as escape sequences: Ctrl+C prints `^[[99;5u` instead of
interrupting. Running `printf '\e[>4m'` in that pane turns the mode off.

A tmux fix edits only the persistent config on the computer hosting the affected
tmux server, including remote sessions. Plain tmux uses the real
`$HOME/.tmux.conf`; Byobu-tmux uses its effective `BYOBU_CONFIG_DIR` and refuses
to guess if that directory is unavailable or unsafe. Grok preserves the file's
line endings and mode, makes a backup when changing an existing file, and
refuses conflicting or ambiguous direct assignments.

Grok deliberately does **not** run `tmux source-file` or change the live tmux
server. Reload with the exact command shown after apply, or detach and reattach,
then run `/doctor` again. Until reload, the live finding is expected to remain.
The conservative config scan checks direct global assignments only; review
sourced files, conditionals, plugins, and generated tmux setup yourself.

---

## Detected Terminals

Grok detects these terminal emulators from environment variables:

- **Apple Terminal**
- **Ghostty**
- **iTerm2**
- **Warp**
- **WezTerm**
- **Kitty**
- **Alacritty**
- **Rio**
- **Rex**
- **Herdr 2**, from the `HC_TERMINAL_ID` variable in its panes (its panes also report `TERM_PROGRAM=ghostty` or `herdr`)
- **foot** (Wayland-native, Linux)
- **VS Code**, **Cursor**, **Windsurf**, and **Zed** integrated terminals
- **JetBrains** IDE terminals
- **Grok Desktop**
- **VTE**-based terminals such as GNOME Terminal, GNOME Console, and Tilix
- **Windows Terminal**

Detection has these limitations:

- Inside tmux, variables that identify the outer terminal may not reach Grok.
- Over SSH, many terminal variables are not forwarded, including Rex's and
  Herdr 2's, so an SSH session started from a Rex or Herdr 2 pane is an
  unrecognized terminal. A pane of a Herdr 2 core running on the remote
  computer still sets `HC_TERMINAL_ID`, so Grok there detects Herdr 2.
- tmux's global environment reflects the first client attached to the server,
  not necessarily the current terminal.
- A Herdr 2 started from kitty, Alacritty, a VTE-based terminal, a JetBrains
  IDE, Windows Terminal, or a VS Code, Cursor or Windsurf terminal passes that
  terminal's variables on to its panes, which Grok then detects as that
  terminal; program status still reaches Herdr 2. Variables from Apple
  Terminal, iTerm2 or WezTerm don't change the detection. A
  terminal Grok does not recognize that sets no `TERM_PROGRAM` of its own,
  started from a Herdr 2 shell, is detected as Herdr 2. So is a Ghostty
  started from a Herdr 2 shell whose `term` setting names another terminal,
  such as `xterm-256color`: it loses Ghostty's notifications (OSC 777), its
  progress bar and its pointer shapes.

---

## Common Problems and Fixes

### Colors look wrong or lack truecolor

Run `/doctor`. A fully supported setup shows `color truecolor` and `themes all`.
If it does not, Doctor shows the detected limitation and the relevant fix.

Inside tmux there are two separate questions: what color Grok emits, and what
color survives the multiplexer. The `color` line answers the first. For the
second, when the attached client is not marked `RGB`, tmux rewrites every
24-bit color to the nearest color the outer terminal's terminfo advertises,
which can be as few as eight. Themes then look washed out even though `color`
reads `truecolor`. Doctor reports this as `terminal.tmux-truecolor`. Reload
your tmux config and then detach and reattach: the server reads the new option
only on reload, and a client fixes its color depth only at attach, so neither
step alone changes anything.

Over mosh, the mosh-server on the remote host matters too. mosh-server 1.3.2 and
older (Ubuntu 22.04 ships 1.3.2) can't show 24-bit color, so when tmux marks its
client `RGB`, colors come out wrong and get worse as the screen changes. On a
Linux host, behind such a server Grok uses 256 colors unless `FORCE_COLOR` is 3
or more, and Doctor reports `terminal.mosh-color` instead of
`terminal.tmux-truecolor`. Install mosh 1.4.0 or later on the host, start a new
mosh session and restart Grok to get truecolor back.

### Clipboard problems

Grok writes through up to three routes, shown in `/doctor` under **Clipboard**:

- **native** — the local operating-system clipboard.
- **tmux** — the tmux paste buffer when Grok runs inside tmux.
- **OSC 52** — an escape sequence that can cross tmux, containers, or SSH.

#### Wayland

Modern Wayland compositors can update the clipboard without keeping the
terminal focused. Older compositors may require Grok to remain focused until
the copy message appears. Grok shows a startup warning when this applies; run
`/doctor` for the detected status and steps.

`GROK_CLIPBOARD_NO_DATA_CONTROL=1` is an advanced fallback that disables the
data-control route. Copies then use command-line clipboard tools.

#### OSC 52 kill switch

Grok emits OSC 52 on Linux, in Rex panes, and across tmux,
SSH, or displayless containers when that route is enabled. In Rex, OSC 52 is
what reaches a Rex app attached from another computer. A terminal that does not implement OSC 52 may display the
encoded payload as text. Set `GROK_CLIPBOARD_NO_OSC52=1` before starting Grok to
disable that route. `/doctor` then shows `osc 52 off`; native and tmux routes are
unchanged.

#### Linux X11 selections

X11 **PRIMARY** and **CLIPBOARD** are separate:

- An unmodified middle click reads PRIMARY only when `DISPLAY` is set. Under
  XWayland, `xclip` or `xsel` must be on `PATH`.
- `Ctrl+V` reads CLIPBOARD and never falls back to PRIMARY.
- `Shift+Insert` remains the terminal's selected-text paste.

#### SSH and selected text

A remote Grok process normally cannot read the local terminal's selection. Use
terminal-native `Shift+Insert`, or hold `Shift` while middle-clicking when the
terminal uses that gesture to bypass mouse reporting.

When Grok cannot identify the outer terminal over SSH, it predicts that OSC 52
will be sent but marks the route as not verified. The copy toast then names the
backup file so you can retrieve the text. Run `/doctor` for other copy options.

#### Apple Terminal over SSH

Apple Terminal does not support OSC 52, so a remote copy cannot reach the local
clipboard. Each copy is still saved to a backup file (`~/.grok/last-copy.txt` by
default; override with `GROK_COPY_FILE`); the toast names that path when delivery
is unverified or the clipboard is unreachable. You can also use `/copy <file>` or
`/minimal`.

For direct clipboard forwarding, run the SSH command from the local computer
through `grok wrap`, for example `grok wrap ssh user@host`. The same command can
wrap container and pod shells. It also restores terminal modes after a dropped
connection.

Under `grok wrap`, a web link you open in Grok over SSH opens in the local
computer's browser. File links still can't open over SSH. This needs the SSH
server to accept `LC_*` variables (`AcceptEnv LC_*`), and a Grok version with
this support on both computers. Inside a remote tmux it also needs tmux 3.3 or
later and `set -g allow-passthrough on`. A `DISPLAY` or `BROWSER` set on a
Linux remote computer, or a `BROWSER` on a macOS one, takes precedence, so Grok
opens the link there instead. `grok wrap` doesn't tell Grok whether the page
opened, so Grok says “Sent to your laptop” and still shows the URL, without
copying it.

`grok wrap` opens only `http` and `https` links, at most about one a second,
only when it can open links itself (not on a remote computer with no display),
and only when the request carries a random token that it puts in
`LC_GROK_WRAP_OPEN`. The token stops text in files, logs and command output from
opening links. Grok doesn't pass it to the commands it runs, but any program
running as you on the remote computer can still read it, for example from your
shell or tmux, and write a request to Grok's terminal: the same trust as OSC 52
clipboard writes. Set `GROK_WRAP_OPEN_LINKS=0` where you run `grok wrap` to turn
this off.

A tmux pane keeps the token it started with, so after you reconnect through a
new `grok wrap`, the links that Grok in an existing pane sends don't open. Add
`set -ga update-environment LC_GROK_WRAP_OPEN` to `~/.tmux.conf` so that panes
created after you reattach get the new token. In an existing pane, run
`eval "$(tmux show-environment -s LC_GROK_WRAP_OPEN)"` before you start Grok.
After you reattach without `grok wrap`, run
`tmux set-environment -gu LC_GROK_WRAP_OPEN` and `unset LC_GROK_WRAP_OPEN` in
the pane before you start Grok, or some terminals print its link requests.

When an SSH session is not using `grok wrap`, Grok shows the one-time tip
“Run `/doctor` for details and fixes”. The tip stops appearing after the session
is launched through wrap. Turn it off with `/settings` → **Show contextual
hints** → **SSH wrap**, or set `ssh_wrap = false` under
`[ui.contextual_hints]` in `$GROK_HOME/config.toml`. This setting does not hide
the Doctor recommendation.

For repeated SSH use, Doctor offers `grok doctor fix ssh-wrap`. It also shows
the one-off command, the file that would change, and the cases where the alias
should be bypassed. The ID `terminal.ssh-wrap` remains accepted and appears in
JSON.

> **Warning**: `grok wrap` is experimental and may not work in every setup.

#### iTerm2

iTerm2 can require permission for OSC 52 clipboard access. Run `/doctor`; the
`terminal.iterm2-clipboard-permission` recommendation shows the setting to
check.

### Fullscreen or alternate screen does not activate

Zellij and tmux control mode can limit the alternate screen. Grok normally uses
inline mode in those environments. Run `/doctor` to see the detected condition.
You can configure `[terminal] alt_screen` in `~/.grok/pager.toml`, or run
`grok --no-alt-screen` to confirm inline mode works.

### Rows stay blank after a terminal clear

A clear done by the terminal itself erases rows without telling Grok, so they
stay blank until their content changes. In iTerm2, **Edit > Clear Buffer**
(`Cmd+K`) and **Edit > Clear to Start of Selection** (`Cmd+L`) do this. Clear to
Start of Selection needs an iTerm2 selection, made by Option-dragging or with
mouse reporting off.

Press `Ctrl+L` to redraw the screen. It redraws when nothing else on that screen
uses `Ctrl+L`, or when that action has nothing to do, such as adding to chat with
nothing selected or the VS Code family's send-now with nothing to send. When the
screen's own `Ctrl+L` action runs, such as the dashboard's directory picker or
quoting a selection into the prompt, the screen is not redrawn. Screens that
otherwise take every key, such as cards, viewers, dialogs, the tutorial and the
dashboard's session picker, let `Ctrl+L` through unless they use it (the next
question on a card, or a file at the cursor in a question's answer or the plan
feedback), so it redraws over them too. The permission card's reply field always
lets it through. The redraw
rewrites every cell without erasing first, so the screen does not flash. In
minimal mode (`--minimal`), `Ctrl+L` redraws only the part Grok still draws at
the bottom of the screen and clears the rows below it, and finished output that
the terminal cleared does not come back.

### Zellij keybindings interfere with Grok

Zellij can intercept Ctrl/Alt keys before they reach Grok. On Zellij 0.41 or
later, use the **Unlock-First (non-colliding)** preset:

1. Press `Ctrl+o`, then `c`.
2. Open **Change Mode Behavior**.
3. Select **Unlock-First (non-colliding)**.
4. Press `Enter` to apply it.

Press `Ctrl+g` when you need Zellij's own pane or session controls. In minimal
mode, if `Ctrl+G` still does not reach Grok, open the command palette and select
**Edit Prompt in External Editor**. This preserves the current draft; typing
`/edit-prompt` starts an empty editor draft because the command itself occupies
the composer.

### Ctrl+Enter does not interject in WezTerm

WezTerm ships with the Kitty keyboard protocol disabled. Run `/doctor` in Grok.
The `terminal.wezterm-kitty` finding shows the setting and restart step. Over
SSH, Doctor shows only the workaround that can work in the current session.
Apple Terminal uses `Ctrl+O` for interjection because it cannot distinguish the
modified Enter chord.

### Shift+Enter does not insert a newline in VS Code

VS Code, Cursor, and Windsurf terminals use xterm.js, which mis-encoded some
shifted keys under the Kitty keyboard protocol before version 6.1.0-beta.219.
Grok asks the terminal for its version at startup and negotiates the protocol
only when it reports xterm.js 6.1.0-beta.219 or later and confirms the protocol
is on (`terminal.integrated.enableKittyKeyboardProtocol`, on by default in
current VS Code). Shift+Enter then inserts a newline. Grok doesn't ask on
Windows or inside tmux, GNU screen, Zellij, or herdr (the multiplexer that came
before Herdr 2), which intercept the query.

Otherwise Shift+Enter can arrive as the same `CR` as Enter: with an older
xterm.js, with that setting off, on Windows or inside those multiplexers, in
Zed, and in VS Code reached over SSH when `TERM_PROGRAM` is not forwarded. Use
`Alt+Enter` to insert a newline; the footer shows it, and `/doctor` reports
`terminal.newline-fallback` with the detected explanation and workaround.

### Shift+Enter does not insert a newline in a terminal Grok can't identify

Grok identifies the terminal from environment variables such as `TERM_PROGRAM`
and `WT_SESSION`. Containers, `sudo` and SSH often drop them, and `/doctor` then
shows `terminal: Unknown`. Grok doesn't ask an unidentified terminal about the
Kitty keyboard protocol, because an older xterm.js (VS Code reached over SSH)
says yes and then mis-encodes shifted keys. Use `Alt+Enter` for a newline, or,
if you know your terminal supports the protocol (for example Windows Terminal
1.25 or later, kitty, WezTerm, Ghostty), opt in and restart Grok:

```toml
[ui]
kitty_keyboard = "query"
```

`GROK_KITTY_KEYBOARD=query` does the same for one session. Grok then asks the
terminal, and enables the protocol only if the terminal says it supports it;
Shift+Enter then inserts a newline. Windows Terminal 1.25 and later says yes
unless the profile's **Allow Kitty Keyboard Protocol** setting
(`compatibility.kittyKeyboardMode` in `settings.json`, on by default) is off.
The setting also lifts the Windows Terminal skip, so it helps once `WT_SESSION`
reaches Grok. It doesn't change the skips for terminals Grok knows mis-handle the
protocol, or for multiplexers that drop it. Native Windows consoles have no way
to ask, so the setting does nothing there. `/doctor` shows a `kitty keyboard
query` line with what the terminal answered.

### Cmd+Enter is not an advertised send or newline chord

`Cmd+Enter` is not an advertised send or newline chord. Grok advertises
only `Shift+Enter` and `Alt+Enter` as newline. Many terminals bind
Cmd+Enter to fullscreen, so `SUPER` is excluded from the newline matcher,
and a delivered `SUPER+Enter` does not match the agent's bare-Enter send
binding. When Kitty (or another protocol that can deliver `SUPER`) does
deliver `SUPER+Enter`, the composer still inserts a newline: the key
misses send and lands in the textarea, which treats any Enter as a line
break. Apple Terminal is a separate local path: CoreGraphics rescue
treats held Cmd as modified Enter and inserts a newline on what arrives
as bare Enter. Over SSH the Cmd modifier never arrives, so the chord
looks like bare Enter and sends.

The composer footer shows the working newline chord when the draft is
non-empty. Over SSH it prefers `Alt+Enter`. You can also type `\` then
Enter, or `/ml`. Do not expect Cmd+Enter to insert a newline on a remote
session.

### Cmd+Up and Cmd+Down don't reach Grok

`Cmd+↑` and `Cmd+↓` move to the start and end of the prompt only where the
terminal passes Cmd with an arrow. On macOS, kitty passes them in the
full-screen view; on its main screen, which minimal mode uses, it scrolls
with them instead. Ghostty (jump to prompt), iTerm2 and Apple Terminal
(scrollback), and VS Code-family terminals keep them for themselves. On
Linux and Windows the desktop may take `Super+↑/↓`.

`Ctrl+Home` and `Ctrl+End` do the same thing (`Ctrl+Fn+←/→` on a Mac
laptop), but some terminals take those too. Apple Terminal may need `⌃Home`
and `⌃End` mapped to `\033[1;5H` and `\033[1;5F` under Settings → Profiles
→ Keyboard. Windows Terminal scrolls with `Ctrl+Shift+Home/End`, and so does
kitty on its main screen, so those can't select there. VS Code-family
terminals on Windows scroll with `Ctrl+Home/End` on the main screen.
(Minimal mode uses the main screen.)

These come from each terminal's default key bindings, not from a test on
every terminal, so a binding you changed in your terminal's settings changes
them.

In VS Code and Cursor on macOS, to use `Cmd+↑/↓` in Grok, add this to
`keybindings.json`:

```json
[
  { "key": "cmd+up", "command": "workbench.action.terminal.sendSequence",
    "args": { "text": "\u001b[1;5H" }, "when": "terminalFocus" },
  { "key": "cmd+down", "command": "workbench.action.terminal.sendSequence",
    "args": { "text": "\u001b[1;5F" }, "when": "terminalFocus" }
]
```

The terminal then sends `Ctrl+Home` / `Ctrl+End` for `Cmd+↑/↓`, in Grok and
in every other program in that terminal.

### A key does the wrong thing

To see what Grok received for each key and what it did with it, start Grok
with an input log:

```sh
GROK_INPUT_LOG=/tmp/grok-keys.jsonl grok
```

Grok opens the file at startup and adds a JSON line for each key, mouse
button, wheel step, paste, and resize, except the voice dictation keys. A line
has the key and modifiers (`"key": "Char('k')", "mods": "CONTROL"`), the
`view`, the `pane` (or the card or dialog that took the key), and the
`outcome` (`Changed`, `Unchanged`, `Action`, or `ActionThenForward`) with the
`action` name. In a session, the first press of a double-press key, such as
quit, logs `Changed`. A key that runs an action and then types logs a second
line. Typed letters log as `Char`, a paste only as its length. A rerun or a
screen-mode restart appends after its own `start` line, but `GROK_INPUT_LOG=1`
starts a new `~/.grok/logs/input-log-<time>-<pid>.jsonl` each time.

A focus report, which the terminal sends when its window or pane gains or
loses focus, also logs a line: `"evt": "focus"` with `kind` `Gained` or
`Lost`, the `view`, and the `pane` that had the keys when it arrived. It has
no `outcome`; the next line's `pane` shows whether the report moved the keys.
A focus-in that arrives while the left mouse button is held waits for the
press to end: the release drops it, and any other end of the press applies it
just before that event, whose line still names the pane the keys were in.

```sh
jq -c 'select(.evt == "key") | {key, mods, pane, outcome, action, prompt_len}' /tmp/grok-keys.jsonl
```

In a session, `/debug log` turns the input and scroll logs on or off, and
`/debug dump` saves the most recent keys to
`~/.grok/logs/input-debug-<time>.json`.

`/debug tps` shows inter-token latency and tokens per second, `/debug fps`
the frame rate, and `/debug scroll` the scroll state. Each toggle adds or
removes that panel in `[ui] debug_panels` in `config.toml` (for example
`debug_panels = ["tps"]`), and the next session opens the listed panels. A
panel that `GROK_FPS` or `GROK_SCROLL_DEBUG` opens is not saved.

### Links over SSH

A click on a web link over SSH with no display or `BROWSER` shows a card
with the full address and why it can't open. Use **[Copy]** for the clean
address. A file link shows the same card. A terminal that opens OSC 8 links
itself keeps that click. In Apple Terminal, **[Copy]** reaches only the
backup file; see [Apple Terminal over SSH](#apple-terminal-over-ssh).

While Grok has the mouse, in Apple Terminal or a terminal Grok can't name (one
behind a tmux on your Mac included), the card also says how to let the terminal
open the link: "Apple Terminal: press Cmd+R, Cmd+double-click the URL, then
Cmd+R again". `Cmd+R` turns Terminal's mouse reporting off and back on, so Grok
gets the mouse again afterwards. For a link that isn't on screen, the notice in
the transcript shows the URL with the same line. `/doctor` and `grok doctor`
show why links don't open in a `links` row, such as `off (over SSH)`.


### Mouse scrolling stops working

If Grok stops receiving mouse input, re-enable mouse reporting in the terminal:

- **Apple Terminal**: **View → Allow Mouse Reporting** (`Cmd+R`).
- **iTerm2**: **Settings → Profiles → Terminal → Enable mouse reporting**.

### Voice dictation records nothing

On macOS, microphone permission belongs to the app hosting Grok (your terminal
or editor), not to Grok. When that app's access is off, `/voice` stops before
it records and names the app, for example **“Microphone access is off for
Ghostty.”** Open **System Settings → Privacy & Security → Microphone**, enable
that app, and restart it. When macOS names no app, the message says **your
terminal**.

On Windows, `/voice` stops with **“Windows denied microphone access.”** when
microphone access is off in Windows privacy settings. Open **Settings → Privacy
& security → Microphone** and turn on microphone access for desktop apps.

After about 10 seconds without a transcript, Grok stops capture and shows
**“No speech was detected. Voice stopped.”** with microphone fix steps. On
macOS, check that the terminal is enabled under **System Settings → Privacy &
Security → Microphone**, and restart it after a change. If access is already
on, check the input device and level under **System Settings → Sound → Input**
and try again.

Doctor does not open the microphone. `/voice` in Grok is what uses it, and Grok
shows an error if capture fails.

On macOS, each dictation uses a short-lived capture helper process so the audio
stack's memory is released when capture ends. If the helper itself may be the
problem, set `GROK_VOICE_CAPTURE=inprocess` to use the in-process fallback for
comparison.

### Byobu with GNU screen

Byobu on GNU screen has limited support. `/doctor` reports
`terminal.byobu-screen` and explains how to switch to Byobu's tmux backend.

### Arabic and Persian (RTL) text

Many terminals already reorder right-to-left text themselves (VTE-based
terminals, Terminal.app, Konsole, mlterm, and others). Grok Build therefore
**does not** reorder RTL by default.

If Arabic or Persian in **scrollback** (or list content) reads backwards,
enable app-side reordering in `~/.grok/pager.toml` (or project config):

```toml
[scrollback.display]
rtl_bidi = true
```

The setting reloads with appearance config (no full restart required). If text
looks correct with the default and becomes wrong after enabling this, turn it
back off — your terminal is already handling bidi.

When enabled:

- Reorders full content lines in scrollback, list content, and the fullscreen
  block viewer (plus the dashboard peek preview and hook popup, which mirror
  scrollback). Chrome, dropdowns, and modals stay logical so their hit-testing
  stays consistent.
- Leaves markdown table columns unchanged.
- Search highlights, selection/drag-copy, double-click word/URL selection, and
  link hit targets all map between the painted (visual) cells and the logical
  text of the same row, so on-screen highlights land on the right glyphs while
  clipboard paste stays in logical order.
- Base direction is resolved per painted row. A soft-wrapped continuation that
  starts with English can take a different base than the paragraph's first row.

This is not a full mirrored RTL UI.

### Links show their text but not their URL

In an agent reply, a thought, or a `/btw` answer, a markdown link normally
reads `text (url)`. Once hiding reaches your account, `[ui] link_urls = "auto"`
(the default) shows only the text in the terminals below, and the text still
links to the same URL. This applies only to web and email links whose text is
ASCII words with no `.`, `,`, `@`, `:`, or `/`, such as `the release notes`,
or the link's own address, such as `docs.example` for a link to
`https://docs.example/a`. Other links keep their URL, including any whose text
has a non-ASCII character, such as an accented letter.

- **iTerm2, Ghostty, Kitty, WezTerm, Rex, and Herdr 2**, once the terminal
  answers Grok's startup version query (XTVERSION) with its own name (Herdr 2
  answers as `ghostty` or `herdr`). Until then links show their URLs, and
  messages redraw once when the answer arrives.
- **VS Code 1.72 or later, Cursor, and Windows Terminal.**
- **On native Windows** (outside WSL), only Windows Terminal, VS Code, and
  Cursor, with two limits: Windows Terminal only in its own window, so a
  classic console (`conhost`) window started from it keeps URLs, and VS Code
  and Cursor only once their terminal answers the version query as `xterm.js`.

URLs always show inside tmux, GNU screen, Byobu, Zellij, cmux, and herdr; over
SSH; in a terminal inside Neovim, Vim, or Emacs; in minimal mode; in Warp; and
in any other terminal. They also always show in the subagent fullscreen view
and the dashboard peek preview.

Hiding is rolling out gradually. Until the rollout reaches your account, every
link keeps its URL and `/settings` has no **Link URLs** row. Set
`GROK_LINK_URL_HIDING=1` (or `[features] link_url_hiding = true` in
`config.toml`) to turn it on ahead of the rollout.

To keep URLs everywhere, set `[ui] link_urls = "show"` in `config.toml` or
`GROK_LINK_URLS=show`, or pick `show` for **Link URLs** in `/settings`.

A hidden URL is still at hand:

- **Drag** a selection that includes the end of the link's text, and it copies
  as `text (url)`.
- **`y`** on a reply or thought selected in the scrollback, with `[keys] vim`
  set to `nav` or `all`, copies it the same way.
- **`/copy`** copies a reply's markdown source, with every link written out.
- **The fullscreen block viewer** (`Enter`) shows every URL.
- **Point** at a link that a click opens (see the next item) to see its URL in
  the status bar. For any other link, hold Cmd (macOS) or Ctrl (elsewhere) with
  the pointer on it. VS Code, Cursor, Windsurf and Zed handle link hover
  themselves.
- **Click** the text of a link in a reply, or in a `/btw` answer in the
  transcript, in Grok on a local Mac: a card at the link shows its whole URL,
  with **[Open]** and **[Copy]**. Elsewhere the terminal keeps the click on a
  link Grok sent as an OSC 8 hyperlink.
- **`Cmd+click`** (macOS) or `Ctrl+click` (elsewhere) opens a link directly,
  in a thought and the open `/btw` panel too.

A link in a table whose text isn't its URL or email address, such as
`[the docs](…)`, `[docs.example](…)` or an image, shows only that text whether
hiding is on or off. So pointing at it where a click opens it, or holding Cmd
or Ctrl over it anywhere in the transcript, shows its URL in the status bar,
except in VS Code, Cursor, Windsurf and Zed, which handle link hover themselves,
and clicking it in a reply or a `/btw` answer, in Grok on
a local Mac, shows the card. A bare URL, an autolink or a link whose text is its
whole URL shows that URL and opens as before.

Your terminal's own selection, such as a Shift-drag, copies only the text on
screen.

---

## Still Stuck?

Run `/feedback` to report it.
