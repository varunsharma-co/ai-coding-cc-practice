# Keyboard Shortcuts

Reference for key bindings in the Grok Build TUI. Bindings are built in and cannot currently be remapped.

---

## Input Modes

The `[keys] vim` setting controls how you navigate the scrollback, and with `all` how you edit the prompt:

- **Off** (default): Arrow keys for navigation, `Shift+Arrow` for turn navigation, and `Space` to focus the prompt. Any other character you type in the scrollback focuses the prompt and goes to it as if you typed it there, except `?`, which opens the command palette. While a card or a plan approval waits, `Tab` returns to it, `?` still opens the command palette, and other typed characters, `Space` included, are ignored.
- **Nav** (opt-in): `j`/`k` for navigation, `H`/`L` for selected-turn navigation, `J`/`K` for viewport-top turn jumps (same as the timeline arrows), `h`/`l` for fold, `e`/`E` for expand/collapse, and `i`/`Tab`/`Space` to focus the prompt. While a card or a plan approval waits, only `Tab` returns to it: `i` and `Space` do nothing.
- **All**: Nav, plus vim editing in the agent prompt. Each draft starts in Insert mode, where keys type as usual, and `Esc` enters Normal mode, where keys are the commands in [Vim Normal mode](#vim-normal-mode), and `v` or `Shift+v` there starts [Vim Visual mode](#vim-visual-mode). The prompt's info line shows `NORMAL`, `INSERT`, `VISUAL`, or `VISUAL LINE`. The cursor is a block in Normal and Visual mode and a bar in Insert mode.

To turn on vim navigation, set `vim = "nav"` under `[keys]` in `~/.grok/config.toml`, run `/vim-mode nav`, or pick **Navigation** in `/settings` → **Vim keys**. For prompt vim as well, set `all`, run `/vim-mode all`, or pick **All**. Bare `/vim-mode` toggles between off and `all`; from `nav`, it turns vim keys off. See [Configuration](05-configuration.md) for details.

The tables below document bindings with vim keys off and on. The "Key" column shows the binding with vim keys on, and the "Alt Key" column shows the equivalent with vim keys off (arrow keys, etc.).

> **Vim-mode required**: Single-letter and `Shift+letter` bindings in the
> **Scrollback** context (`j/k`, `h/l`, `g/G`, `L/H`, `y/Y`, `o/O`, `r`,
> `x`, `e/E`, and the `i` insert-mode alt) require `[keys] vim = "nav"` or
> `"all"` in `~/.grok/config.toml` (or `/vim-mode` to toggle). Arrow keys,
> `Tab`, `Esc`, `Space`, `PageUp/Down`, and every `Ctrl+letter` shortcut
> work with vim keys off and on.

---

## Navigation (Scrollback Focused)

Move through conversation entries in the scrollback pane.

| Key | Alt Key | Action |
|-----|---------|--------|
| `j` | `Down` | Select next entry |
| `k` | `Up` | Select previous entry |
| `⇧L` | `Shift+Right` | Jump to next turn (user prompt) |
| `⇧H` | `Shift+Left` | Jump to previous turn (user prompt) |
| `⇧J` | | Jump to next turn at viewport top |
| `⇧K` | | Jump to previous turn at viewport top |
| `g` | | Go to top of scrollback |
| `⇧G` | | Go to bottom of scrollback |
| `Ctrl+K` | | Scroll up one line (without changing selection) |
| `Ctrl+J` | | Scroll down one line (without changing selection) |
| `PageUp` | | Scroll up one page (selection moves to the top of the viewport) |
| `PageDown` | | Scroll down one page (selection moves to the bottom of the viewport) |
| `Ctrl+U` | | Scroll up half page |
| `Ctrl+D` (`Shift+D` in VSCode) | | Scroll down half page |

`PageUp` and `PageDown` also scroll the conversation while the ordinary prompt
is focused, without moving focus or changing the draft. An active prompt
history, `@` file search, slash menu, or completion dropdown keeps the keys for
its own navigation.

---

## View (Scrollback Focused)

Control how entries are displayed in the scrollback.

| Key | Alt Key | Action |
|-----|---------|--------|
| `h` | `Left` | Collapse selected entry |
| `l` | `Right` | Expand selected entry |
| `e` | | Toggle fold on selected entry |
| `⇧E` | | Expand all / collapse all entries |
| `Ctrl+E` | | Expand/collapse all thinking blocks |
| `r` | | Toggle raw markdown on selected entry |

Setting `respect_manual_folds = true` under `[scrollback.scroll]` in
`pager.toml` (opt-in, off by default — see
[Configuration](05-configuration.md)) makes a hand-folded block pinned:
streaming updates and finish events (for example a thinking block ending)
leave it alone instead of resetting it, and expanding a block while
auto-scroll is following the tail stops following so you can read; resume
with `⇧G`, `j` at the last entry, scrolling past the bottom, or sending a new
prompt. `⇧E` clears all pins, and `Ctrl+E` clears pins on thinking blocks.

### Block Content

| Key | Action |
|-----|--------|
| `y` | Copy block content to clipboard |
| `⇧Y` | Copy block metadata (e.g., the shell command) to clipboard; in the fullscreen viewer of a reply or thought, the code block under the cursor |
| `Enter` | Open the selected block in the fullscreen viewer, or expand or fold a long user message in place |
| `Ctrl+F` | Open the selected block in the fullscreen viewer, or expand or fold a long user message in place (alt binding) |
| `Ctrl+L` | Quote the selected block into the prompt as a `>` blockquote and focus the prompt. When text is still highlighted after a mouse selection, quote only that text. With nothing to quote, or while a [card](#blocking-cards) or plan approval waits on you, it redraws the screen instead. The footer shows it as `add to chat`: ahead of the selection hints while text is highlighted, otherwise after a selected block's fold and open hints |

---

## Focus

Switch between the prompt input and scrollback pane.

| Key | Alt Key | Context | Action |
|-----|---------|---------|--------|
| `Tab` | `Space` (and `i` in vim mode) | Scrollback focused | Focus the prompt input |
| `Tab` | | Prompt focused, prompt suggestion showing, vim keys off (or minimal mode) | Accept the suggestion |
| `→` | `Ctrl+→` | Prompt focused, prompt suggestion showing | Accept the whole suggestion |
| `Tab` | | Prompt focused on a typed command name the slash menu doesn't list (with vim keys on, only in Insert mode), while a session that just opened is still loading its skills | Stay in the prompt. Once the skills load, `Tab` completes the command if it is one of them, and otherwise focuses the scrollback |
| `Tab` | | Prompt focused, otherwise | Focus the scrollback (vim keys on or off) |
| `Tab` | `Shift+Tab` (backwards) | A blocking card is focused (question, permission prompt, cancel-turn panel) | Walk that card's rows, wrapping round at the ends. Focus stays in the card |
| `Tab` | | Scrollback, tasks pane or dock focused with a card or a plan approval parked | Hand the keyboard back to it (the bar's focus hint names it). `Space` and `i` don't: each keeps what it means in that pane |
| `Enter` | | Prompt focused | Send the current prompt (in vim's Insert or Normal mode, unless a vim key is pending; see [Vim Normal mode](#vim-normal-mode); in [Visual mode](#vim-visual-mode) it only leaves the mode). On an empty prompt in a session's full-screen view, open the feedback draft whose row shows **Press Enter to review and send** |

**Esc is not a focus key.** It follows the clear / rewind semantics below, and it never cancels a running turn (`Ctrl+C` does). Under `off` and `nav`, nothing about Esc depends on `[keys] vim`; `all` adds the prompt's vim modes (see [Escape](#escape)). Overlays, modals, slash/file dropdowns, a visible prompt suggestion, voice, search, and selection still steal Esc first.

## Blocking cards

Four surfaces block the agent on your answer and take over the keyboard while
they are open: the **question card** (`ask_user_question`), the **MCP
elicitation card** (`x.ai/mcp/elicit`), the **permission prompt**, and the
**cancel-turn panel**. When more than one is open the permission prompt has the
keyboard first, then the cancel-turn panel, then question, then elicitation —
and the shortcuts bar always shows the keys of whichever one is receiving them.

They share one contract:

- `Tab` / `Shift+Tab` walk that card's rows and wrap at both ends. They never
  move focus out of the card, so the cursor is always somewhere you can see.
- `Esc` steps back out, one rung at a time: it clears whatever the card has
  pending first, and only once there is nothing left to clear does it leave.
  Where it leaves to is the one thing that differs per card — the question card
  and the permission prompt park the keyboard in the scrollback so you can
  scroll up and read the context behind them (the card stays on screen), while
  the cancel-turn panel's "keep running" closes the panel and leaves the
  turn (and any subagents) running. Enter or `1`–`4` still pick a
  cancel-and-subagent choice.
- With the keyboard parked, the shortcuts bar shows the scrollback's own keys,
  and its focus hint names the card rather than the prompt: `Tab:
  question`. That hint is pinned, so a narrow bar can never trim away the only
  route back.
- A permission prompt also waits while the tasks pane or dock has the keyboard,
  so a background run whose agents keep asking can be stopped with `x` on its
  row. It waits if it is in front when the pane gets the keyboard, or if it
  opens while the pane itself has the keys. A question, an MCP form, the
  cancel-turn panel or the plan approval that has the keyboard there keeps it,
  as anywhere else, and a permission prompt that opens in front of one of them
  takes the keyboard.
- Once the pane has parked a permission prompt, the cards in front keep waiting
  until the keyboard leaves the pane: the card behind the prompt once it closes,
  and a question, MCP form, plan approval or permission prompt that opens later.
  A plan approval that waits there does not open its plan preview on its own,
  even once the keyboard leaves the pane. On the approval, `Tab` moves to its
  prompt, where `a` types, and a second `Tab` opens the plan. Until you have
  seen the plan, `a` on the approval opens it instead of approving, and Enter
  on notes you have written opens it instead of sending them. Clicking its
  status line opens it too. The one exception is the cancel-turn
  panel you open with `Ctrl+C`: when it opens in front it has the keyboard until
  it closes, and then the cards behind it wait again. A plan approval that
  arrives while the panel is open waits behind it. A permission prompt that
  opens in front of the open panel takes the keyboard and keeps it until you
  answer it (and any permission prompts queued behind it), even if the panel
  closes; then the cards behind wait again. While a permission prompt or a plan
  approval still waits, the panel opens but waits too and the pane keeps the
  keyboard; a waiting permission prompt stays drawn in front of it. Answer that
  first to reach the panel, or press `Ctrl+C` again to cancel the turn. That
  press stops or keeps the subagents as `Enter` on the panel's selected choice
  would.
- From the scrollback, `Ctrl+G` moves the keyboard to the tasks pane; with the
  dock enabled `Ctrl+G` only shows or hides the dock, so click the dock instead.
  The pane's bar pins the route back: `Tab` returns to the card, or to a waiting
  plan approval (`plan approval`). `Esc` goes to the scrollback: the dock stays
  on screen, but the tasks pane closes, so its rows are gone until `Ctrl+G`
  opens it again.
- Inside the dashboard's session overlay there is one more rung: once the
  keyboard is parked, the next `Esc` returns to the dashboard, leaving the card
  pending, and the bar shows `Esc/Ctrl+\` for it. (`Ctrl+\` still leaves from
  any state.)

### MCP elicitation card (`x.ai/mcp/elicit`)

Shown when an MCP server asks for user input (form fields or URL consent).
The title always includes the MCP server name.

| Key | Action |
|-----|--------|
| `↑` / `↓`, `j` / `k`, `Tab` | Move between fields / actions |
| `Space` / `Enter` on a field | Edit text, or toggle boolean / enum |
| `←` / `→` on actions | Accept vs Decline |
| `Enter` on Accept | Submit (form validates first; URL opens the browser) |
| `d` / Decline | Decline the request |
| `Esc` | Step back: leave text editing first, then park focus in the scrollback (`Tab` returns). Only while waiting on an accepted URL does it dismiss the card |
| `Ctrl+C` | Cancel the request |
| `o` | Reopen URL while waiting for completion |

### Question card (`ask_user_question`)

| Key | Action |
|-----|--------|
| `↑` / `↓`, `j` / `k` | Move between answers (clamped at the ends) |
| `Tab` / `Shift+Tab` | Walk this question's answers in a loop — off the last answer back to the first. It never carries you into another question |
| `←` / `→`, `h` / `l`, `[` / `]` | Previous / next question |
| `1`–`9`, `a`–`f` | Pick that answer directly; on a multi-select, toggle its checkbox and keep the card open |
| `z` | Jump to the free-text row and start typing |
| `Space` | Toggle the focused answer (multi-select), or start typing on the free-text row |
| `Enter` | Select and advance, submit on the last question, or edit the free-text row. A multi-select with picks advances or submits as toggled, without adding the focused answer |
| `Esc` | Unselect this question's answer; with nothing selected, park focus in the scrollback (`Tab` returns). Inside the dashboard's session overlay the next `Esc` returns to the dashboard. The shortcuts bar names whichever rung is live |
| `y` | Copy the focused answer |
| `Shift+X` | Dismiss the question (the agent continues without an answer) |
| `Ctrl+F` | Fullscreen the card |
| `Ctrl+E` | Expand or collapse every thinking block in the transcript behind the card, as in the [scrollback](#view-scrollback-focused), so you can read the agent's thinking before you answer. The card keeps the keyboard, your place and any answer you marked. With no thinking block on show it does nothing. Minimal mode keeps its own `Ctrl+E` (see [Agent-Level](#agent-level)) |

The `/feedback` form is the one exception to this table: its report box has no
answers to walk, so it has its own keys (below).

While typing a free-text answer, `Enter` submits. `Esc` returns to the answer
rows, and `↑` on the answer's first line moves to the answer above; both keep
what you typed. Every other key goes to the text field.

### `/feedback` form

| Key | Action |
|-----|--------|
| `Ctrl+Tab` / `Ctrl+Shift+Tab` | Switch between the Write and Drafts tabs |
| `Esc` | Close the form (a focused label row or an open confirm is dismissed first) |

Write tab:

| Key | Action |
|-----|--------|
| `Enter` | Send the report |
| `Shift+Tab` | Open the Drafts tab. Use it where `Ctrl+Tab` arrives as a plain `Tab`, as in tmux. The trace question ignores it; use `Ctrl+Tab` there |
| `Tab` | Focus the label rows above the report box (a loaded draft's **Title** row comes first; `↑` / `↓` move between rows); `Tab` again returns to the report box |
| `←` / `→` | Pick a value on a focused type/task/failure row |

A loaded draft's **Title** row edits the title the report is sent with: type or
paste there, and `←` / `→`, `Home` / `End`, `Backspace` and `Delete` work as in a
text field. `Enter`, `Tab`, `Shift+Tab` or `Esc` returns to the report box. A
blank title reads `(first line of the report)`, and sends the report's first
non-blank line, cut to 80 characters, as the title.

Drafts tab:

| Key | Action |
|-----|--------|
| `↑` / `↓`, `j` / `k` | Select a saved draft |
| `g` / `G`, `Home` / `End` | Select the first or last draft |
| `Enter`, or a click on the draft | Load the selected draft into Write |
| `Tab` / `Shift+Tab` | Return to the Write tab, from the list or the search field |
| `d` | Delete the selected draft (confirm with `y`) |
| `/` | Search the drafts |

When a trace upload can be offered, `Enter` on the report first shows an upload
question (`↑`/`↓` choose, `Enter` sends with your choice, `Esc` skips the
upload and still sends the report).

### Permission prompt

The first approval prompt after Grok starts highlights "allow once" unless `[ui] default_selected_permission` picks another row (see [Configuration](05-configuration.md)).

| Key | Action |
|-----|--------|
| `↑` / `↓`, `j` / `k` | Move between options (clamped at the ends) |
| `Tab` / `Shift+Tab` | Walk the options in a loop |
| `1`–`9` | Choose that option directly. The always-approve row, always the last, has no number, so pick it with the cursor and `Enter`. The other rows keep their usual numbers, so a prompt's numbers can skip one, and the skipped number does nothing |
| `Enter` | Choose the focused option |
| `←` / `→` | Widen / narrow the scope an "always" answer would remember |
| `e` | Edit the always-allow pattern by hand (bash prompts) |
| `Ctrl+F` | Expand / collapse the full arguments or command, and Auto-review's explanation; on a prompt that starts or resumes a subagent, open the subagent's task prompt instead (see [Interactive Approvals](22-permissions-and-safety.md#interactive-approvals-and-where-they-persist)) |
| `Esc` | Park focus in the scrollback (`Tab` returns). It never answers or dismisses the request |
| `Ctrl+C` | Cancel the request |

Typing on the "No" row starts a message back to the agent instead; `Enter`
sends it and `Esc` returns to the options.

The send-now key does nothing on the options or while editing an always-allow pattern.

### Cancel-turn panel

`Ctrl+C` while subagents are running asks what to do with them. The panel opens on **Continue to run**, so `Enter` cancels the turn, including a wait on a subagent, and leaves the subagents running; a subagent the turn was waiting on moves to the background. `Ctrl+X` in the dashboard's details view opens it the same way, on **Continue to run**; on a panel it opened, any choice you pick also drops the session's queued prompts, while a `Ctrl+C` there keeps them, as `Ctrl+C` always does. The choices, in order, are **Stop running**, **Continue to run**, **Always continue** and **Always stop**, and `1`–`4` pick them. With the panel open, another `Ctrl+C`, a click on `[stop]` or the dashboard's `Ctrl+X` stops or keeps the subagents as `Enter` on the selected choice would. While a cancel is still pending ("Cancelling…"), a click on `[stop]`, the palette's **Cancel turn**, or `Ctrl+C` in a session another computer runs sends it again, keeping or stopping the subagents as the first one did; on the workspace dashboard, `Ctrl+X` or `/exit` in the details view does too. In a session on this computer, `Ctrl+C` while cancelling arms quit instead. In every session, once the cancel has settled, so does a `Ctrl+C` within 1000ms of one that cancelled a turn: after a turn's cancel, the second press of a double press does not cancel the queued prompt that starts next. A choice picked on the panel with `Enter`, a number or a click opens no such window. In a subagent's view in the details view, these cancels are still the session's: `Ctrl+X` closes the view and cancels the session's turn as above, never only that subagent, so the panel's choice or a saved preference decides whether that subagent stops too. The row stop in the dashboard's list never opens the panel: it stops the session's subagents too. In the workspace dashboard's details view, `Ctrl+X` and `/exit` with no turn to cancel leave running subagents alone, except in the confirmed stop of a run paused at its agent budget. A subagent stops with its own ✗ or `[stop]`, with **Stop running** on the panel, or with a saved **Always stop**. A saved **Always stop** or **Always continue** skips the panel.

| Key | Action |
|-----|--------|
| `↑` / `↓`, `j` / `k`, `Tab` / `Shift+Tab` | Move between the choices |
| `1`–`4`, `Enter` | Confirm that choice |
| `Esc` | Keep everything running. This resolves the panel, so it is never a dead end and never needs to park |

## Escape

| State | Gesture | Effect |
|--------|---------|--------|
| `[keys] vim = "all"`, prompt in Insert mode | `Esc` | Enter Normal mode. Nothing else: no clear, rewind or mid-turn hint. |
| `[keys] vim = "all"`, prompt in Visual mode | `Esc` | Leave Visual mode for Normal mode, as in Insert mode. |
| `[keys] vim = "all"`, Normal mode, non-empty prompt | `Esc` | No-op, idle or mid-turn. Clear with `Ctrl+C`. |
| `[keys] vim = "all"`, Normal mode, empty prompt | `Esc` | The rows below apply. |
| Turn running (every mode and pane) | `Esc` | Does **not** cancel. Shows a "Press Ctrl+c to cancel the turn" toast; the draft is untouched. Use `Ctrl+C` (or palette / other cancel entry points). |
| Turn cancelling | `Esc` | Swallowed no-op. `Ctrl+C` in this state escalates toward quit. |
| Idle + non-empty prompt (text or image chips), **prompt focused** | **2× `Esc` within 800ms** | Clear the prompt; the cleared draft is stashed (`Ctrl+S`, `Alt+S`, or `Ctrl+Z` pressed right after the clear restores it, images included). First press shows “press again to clear”. |
| Idle + empty prompt + conversation messages, **prompt or scrollback focused** | **2× `Esc` within 800ms** | Open the rewind picker (same as `/rewind`). First press is silent (no toast). |
| Idle + empty + no messages, **or scrollback focused with a draft / moded (`!` `#`) composer / pending needs-input overlay / open history search** | `Esc` | Swallowed no-op (does not focus scrollback). Clear is prompt-pane only; rewind requires an empty Normal-mode composer, no pending overlay, and no open history search. Reading the scrollback never mutates your draft, your composer mode, a question awaiting an answer, or an in-progress search. |

**Mid-turn Esc grace:** for about a second after a mid-turn Esc, the idle rewind arm stays suppressed — mashing Esc at a turn that then ends cannot silently open the rewind picker. Only the rewind arm is held; every other Esc behavior is unaffected.

**Steal-Esc (runs before the mid-turn hint and clear / rewind):** overlays, modals, slash/file/completion dropdowns, a visible prompt suggestion (Esc dismisses it and keeps what you typed; in the dashboard's session overlay, Esc on an empty prompt returns to the dashboard instead), history search, scrollback search, text selection, link highlight, voice, and **Bash / Remember mode exit** when the prompt is empty (Esc leaves `!` / `#` mode and returns to the normal prompt, even while a turn is running). Bare `/feedback` opens the feedback form; Esc closes it.

**Prompt vim (`[keys] vim = "all"`):** vim takes `Esc` after the steal-Esc owners above and before clear / rewind. The dashboard session overlay's return to the dashboard is the exception: it comes after vim and waits for Normal mode with no count, `g`, operator, find, `r`, or text object pending, not Visual mode, so from Insert mode it takes two presses, or three with a prompt suggestion showing, because in Insert mode the suggestion's `Esc` comes first and dismisses it. Clearing or sending the prompt, focusing it from another pane, and a card arriving start the next draft in Insert mode; a card's own text input never uses vim. In Normal mode `Ctrl+R` redoes, as in vim; in Insert mode it still opens the session picker. `u` undoes an insert and everything typed in it as one change: `Ctrl+Z` while you type still undoes a word at a time, and `Esc` folds what is left of the insert into that one change. Newline keys, a paste or drop, `Ctrl+Y` (except where it is the queue key; see [Agent-Level](#agent-level)), dictation, a quoted reply, `/history` search and `Tab` completion in `!` mode enter Insert mode as `a` does, so their text continues after the cursor. After you stop dictation, the next `Esc` enters Normal mode even while the last words are still arriving: their preview moves to the Normal cursor, and they then land as `a` does, which returns the prompt to Insert mode. Where the whole recording is transcribed after you stop, that `Esc` discards the recording instead, though right after a very short recording it can still enter Normal mode. The queued-prompt editor doesn't use vim: while you edit a queued row, keys type as in Insert mode. On macOS and Linux without the kitty keyboard protocol, a terminal sends `Esc` and the key typed right after it as one `Alt` chord, which vim reads as both keys: `Alt+B` / `Alt+F` / `Alt+D` in Insert mode leave Insert, and `Esc` then a quick `Enter` inserts a newline instead of sending. `Alt+Z` still redoes.

**Ctrl+C vs Esc:** with a non-empty draft while a turn is running, Ctrl+C clears the draft and keeps the turn; a second Ctrl+C on an empty prompt cancels. Esc never cancels: mid-turn it only points you at Ctrl+C and leaves the draft alone. Idle non-empty Ctrl+C clears in one press; Esc requires two presses within 800ms. The two clears differ in what they leave behind: `Esc Esc` stashes the draft, so `Ctrl+S` (or `Ctrl+Z` pressed right after) brings it back, while `Ctrl+C` discards it (`Ctrl+Z` still undoes that clear, text only).

---

## Vim Normal mode

With `[keys] vim = "all"`, the agent prompt has vim, a subagent's included. The dashboard's dispatch input and peek reply, the welcome screen's prompt, and the `/feedback` form don't. In Normal mode, the keys below are commands.

| Key | Action |
|-----|--------|
| `Esc` | Enter Normal mode, or cancel a pending count, `g`, operator, find, `r`, or text object; otherwise as in [Escape](#escape) |
| `h` | Move left |
| `Backspace` | Move left, wrapping to the line above |
| `l` | Move right |
| `Space` | Move right, wrapping to the line below |
| `j` | Move down a line |
| `k` | Move up a line |
| `0` | Go to the line start |
| `^` | Go to the first non-blank |
| `$` | Go to the line end |
| `gg` | Go to the first line, or line N |
| `Shift+g` | Go to the last line, or line N |
| `w` | Go to the next word start |
| `b` | Go back to the previous word start |
| `e` | Go to the next word end |
| `Shift+w` | Go to the next WORD start |
| `Shift+b` | Go back to the previous WORD start |
| `Shift+e` | Go to the next WORD end |
| `f` | Wait for a character, then go to its next match on the line |
| `t` | Wait for a character, then go to just before its next match on the line |
| `Shift+f` | Wait for a character, then go back to its previous match on the line |
| `Shift+t` | Wait for a character, then go back to just after its previous match on the line |
| `;` | Repeat the last `f`, `t`, `Shift+f`, or `Shift+t` |
| `,` | Repeat the last `f`, `t`, `Shift+f`, or `Shift+t` the other way |
| `i` | Insert before the cursor |
| `a` | Insert after the cursor |
| `Shift+i` | Insert before the first non-blank |
| `Shift+a` | Insert at the line end |
| `o` | Open a line below, with the same indent, and insert there |
| `Shift+o` | Open a line above, with the same indent, and insert there |
| `d` | Delete over a motion; `dd` takes the line |
| `c` | Change over a motion: delete it and insert; `cc` takes the line and keeps its indent |
| `y` | Yank (copy) over a motion; `yy` takes the line |
| `x` / `Delete` | Delete the character under the cursor |
| `Shift+x` | Delete the character before the cursor |
| `Shift+d` | Delete to the line end |
| `Shift+c` | Change to the line end |
| `s` | Change the character under the cursor |
| `Shift+s` | Change the line |
| `r` | Wait for a character, then replace the character under the cursor with it; `Enter` puts a line break in its place |
| `~` | Switch the case of the character under the cursor and move right |
| `Shift+j` | Join the line below to this one: drop its indent and put one space between (none before a `)`) |
| `Shift+y` | Yank the line |
| `p` | Put after the cursor, or below the line for whole lines |
| `Shift+p` | Put before the cursor, or above the line for whole lines |
| `u` | Undo a change: a Normal-mode edit, or an insert with everything typed before `Esc` |
| `Ctrl+r` | Redo an undone change (in Insert mode, `Ctrl+r` opens the session picker) |
| `.` | Repeat the last change, with the text an insert typed |
| `v` | Select characters in [Visual mode](#vim-visual-mode) |
| `Shift+v` | Select lines in [Visual mode](#vim-visual-mode) |

`Shift+g` means a capital `G` (`⇧G` in the scrollback tables above), and so on; `Ctrl+r` is the `Ctrl+R` chord the other tables name. A word is a run of letters, digits, and `_`, or a run of other non-blank characters; a WORD is any run of non-blank characters. Deleted and yanked text goes to the prompt's own register, not the system clipboard.

Digits `1` to `9` start a count, and `0` extends one. A count repeats the command after it, as in `3j`, `2x`, or `3u`, except that `gg` and `Shift+g` go to line N; `$`, `Shift+d`, `Shift+c`, `Shift+s`, `Shift+y`, `dd`, `cc`, and `yy` cover N lines; `Shift+j` joins N lines, at least two, keeping the chips on them; `r` replaces N characters, only when the line has that many left and none is a chip, and `~` switches up to N, stopping at the line end or a chip; and `^`, `i`, `a`, `Shift+i`, `Shift+a`, `o`, `Shift+o`, `v`, and `Shift+v` ignore it. While a count is pending, `Delete` removes its last digit. `d`, `c`, and `y` wait for a motion, which can carry its own count, or their own key again (`dw`, `d2w`, `dgg`, `dd`). A count before the operator multiplies the one before the motion, so `2d3w` deletes six words. Any other key cancels the operator, and a command such as `o` then does nothing. `g` waits the same way for a second `g`. A count before a find takes a later match (`2f,`). With an operator, `f` and `Shift+f` take the match and `t` and `Shift+t` stop beside it (`df,`, `dt,`). A find stays on the cursor's line and never matches a chip; with no match, the cursor stays and an operator does nothing. After `t` or `Shift+t`, `;` and `,` without a count skip a match right beside the cursor.

`.` repeats the last edit, an insert with the text typed in it included (`cw`, `foo`, `Esc`, then `.` on another word changes it to `foo`), but not motions, yanks, `u`, or `Ctrl+r`, so after `u` it repeats the change you undid. A count before `.` replaces the change's count, and later presses of `.` keep it (`2dw`, then `3.` deletes three words, and `.` three more). After an insert that edited outside the text it typed, such as `Backspace` or an undo past where it started, `.` does nothing until the next change.

`d`, `c`, and `y` also take a text object: `i` or `a`, then `w` or `Shift+w` for the word or WORD under the cursor, `"`, `'`, or `` ` `` for a quoted string on its line, or `(` / `)` / `b`, `[` / `]`, `{` / `}` / `Shift+b`, or `<` / `>` for the bracketed block around the cursor, or else the next one after it, across lines (`ciw`, `daw`, `ci"`, `da(`). `i` takes what's inside; `a` adds the quotes or brackets, or the blanks after a word or string (the blanks before it when none follow, though `aw` never takes the indent). On blanks, `iw` takes the blanks and `aw` the word after them too. A quoted string runs from the last quote before the cursor to the next one after it, or else is the first pair after the cursor; with the cursor on a quote, quotes pair from the line start. A quote or bracket after an odd run of backslashes doesn't count. When a block's text starts on a line of its own and its closing bracket starts a line, `i` takes those whole lines, so `ci{` leaves an empty line inside the braces. A count takes that many words, a run of blanks counting as one for `i`, or the block that many levels out, and no block when none is around the cursor; on a quote, a count of 2 includes the quotes. With no such object the operator does nothing, and a text object never splits a chip or counts one as a quote or bracket.

Any other character does nothing in Normal mode, `/`, `@`, `!`, and `#` included: the slash menu, the `@` file picker, Bash mode, and, where it's on, Remember mode open only from Insert mode. Other keys that type no character, and chords with `Ctrl`, `Alt`, or `Cmd`, keep their prompt meaning, except that `Ctrl+H` works as `Backspace` and a character typed with `AltGr` on Windows counts as that character. On macOS and Linux without the kitty keyboard protocol, vim reads `Alt+S` as `Esc` then `s`, so it runs `s` instead of stashing; `Ctrl+S` still stashes, and [Escape](#escape) lists the other keys this changes. `Enter` still sends, or adds a newline in multiline mode, but a trailing `\` continues the line only in Insert mode. With a key pending, `Enter` goes to vim instead: after `r` it puts a line break in place of the character, and after anything else it cancels, as `Esc` does.

Rewinding from Insert mode takes three `Esc` presses, or four with a prompt suggestion showing; [Escape](#escape) has the full order. Inside tmux, a high `escape-time` delays `Esc` and can join it to the next key as one `Alt` chord; [Terminal Support](21-terminal-support.md#diagnose-and-fix-terminal-problems) has the `/doctor` finding and the fix.

## Vim Visual mode

In Normal mode, `v` starts Visual mode, which selects the characters from where it started to the cursor, and `Shift+v` starts Visual line mode, which selects the whole lines between them. The prompt's info line shows `VISUAL` or `VISUAL LINE`, and the selection is highlighted. In Visual mode, the keys below act on the selection.

| Key | Action |
|-----|--------|
| `Esc` / `Enter` | Leave Visual mode; `Enter` sends nothing |
| `v` | Select characters; from `v`, leave Visual mode |
| `Shift+v` | Select lines; from `Shift+v`, leave Visual mode |
| `o` / `Shift+o` | Go to the other end of the selection |
| `d` / `x` / `Delete` | Delete the selection |
| `Shift+x` / `Shift+d` | Delete the selected lines |
| `c` / `s` | Change the selection: delete it and insert |
| `Shift+c` / `Shift+s` / `Shift+r` | Change the selected lines, keeping the first one's indent |
| `y` | Yank (copy) the selection |
| `Shift+y` | Yank the selected lines |
| `p` | Put in place of the selection, which then goes to the register |
| `Shift+p` | Put in place of the selection, keeping the register |
| `~` | Switch the case of the selection |
| `u` | Make the selection lowercase |
| `Shift+u` | Make the selection uppercase |
| `r` | Wait for a character, then replace each selected character with it |
| `Shift+j` | Join the selected lines, at least two |

Every Normal-mode motion moves the cursor, one end of the selection, and takes a count as in Normal mode (`vw`, `v3j`, `vf,`). The arrow keys, `Home`, and `End` work as `h`, `l`, `k`, `j`, `0`, and `$`. The cursor can rest on a line break, and the selection then takes it: `$` goes there, `l` steps onto it from the line's last character, `j` and `k` stop there on a line too short for the cursor's column, `w` and `e` stop at the end of the last line, and `Backspace` and `Space` stop on each line break they cross.

`i` or `a`, then a text object, selects that object when one character is selected (`viw`, `va(`), and otherwise widens the selection: `iw` and `aw` by the next word or blanks, `i(` and `a(` to the block around it, a level further out once more than one character inside it is selected, and `i"` and `a"` to the quoted string, with its quotes once its inside is selected. A text object turns a line selection into a character selection.

An operator ends Visual mode. A delete, change or yank of characters lands at the selection's start, and a delete of lines as `dd` does; `c` and its family start Insert mode there, and the change with what you type is one undo step. A yank of lines (`Shift+y`, or `y` in Visual line mode), and in Visual line mode `~`, `u`, and `Shift+u`, land on the cursor when its line is above the other end's and on the top line's start otherwise; in Visual line mode `r` always lands on the top line's start, and in Visual mode `y`, `~`, `u`, `Shift+u`, and `r` land at the selection's start. `Shift+j` lands as in Normal mode. `p` and `Shift+p` put the register as `p` does: lines put over characters go on lines of their own, and characters put over lines take their place, a line each time. With an empty register they delete the selection. Only `p` and `Shift+p` take a count, which puts that many times. `u` here makes text lowercase; undo is `u` in Normal mode, and it puts the cursor back where the edit started. After an edit in Visual mode, `.` repeats nothing; after a yank, it still repeats the change before.

A paste of text or an image, bracketed, `Ctrl+V`, `Cmd+V`, or `Ctrl+Shift+V`, replaces the selection and goes on in Insert mode. `Cmd+X` cuts it and `Cmd+C` copies it; both leave Visual mode for Normal mode, the copy with the text still highlighted, as the composer's copy keeps it. Any other character, `Shift+i`, `Shift+a`, and `.` included, and `Ctrl+R` do nothing and keep Visual mode. Other keys and chords leave Visual mode first and then act as in Normal mode, and so do a click in the prompt and moving to another pane. A selection never splits a chip, and `r`, `~`, `u`, and `Shift+u` leave chips as they are.

Unlike vim:

- `Enter` leaves Visual mode without moving the cursor, and `r` then `Enter` cancels the `r`.
- After an edit, `.` repeats nothing, where vim repeats it on a region of the same size.
- `Shift+i`, `Shift+a`, `gv`, `>`, `<`, `gu`, `gU`, `g~`, and `gJ` do nothing, and a count before `v` or `Shift+v` is dropped.
- `iw` and `aw` on a wider selection stop at the line end.
- `c`, `Shift+c`, `Shift+s`, and `Shift+r` on lines keep the first line's indent, as vim does only with `autoindent`.
- A selected line break or empty line shows no highlight cell.
- `Ctrl+V` still pastes, so there is no block Visual mode.

---

## Agent-Level

Actions that affect the agent session, available from the agent screen.

| Key | Context | Action |
|-----|---------|--------|
| `Ctrl+P` | Agent screen | Open the command palette |
| `?` (Shift+/) | Agent screen | Open the command palette (alt binding) |
| `Ctrl+M` | Agent screen | Open the model picker / switch model |
| `Ctrl+M` | Prompt focused | Toggle multiline input mode |
| `Ctrl+C` | Agent screen | Cancel the current turn (or clear non-empty draft first; see Escape table) |
| `Ctrl+O` | Agent screen | Copy the latest reply's markdown source, with every link written out, the same as `/copy`. While a `/btw` answer shows its open button, open that side session instead. On Apple Terminal, `Ctrl+O` is also the send-now key and sends while there is something to send |
| `Ctrl+R` | Agent screen | Open the session picker (resume a previous session, same as `/resume`); in prompt vim's Normal mode it redoes instead ([Vim Normal mode](#vim-normal-mode)) |
| `Ctrl+;` (alt: `Ctrl+'`) | Agent screen | Toggle the prompt queue pane (when non-empty). Some terminals use another key; see the queue key note below. |
| `Shift+Tab` | Prompt focused | Cycle mode (Normal → Plan → Auto-review (when enabled) → Always-approve) |
| `Ctrl+B` | Agent screen | Send the running foreground command to the background |
| `Ctrl+T` | Agent screen | Toggle the todos pane |
| `Ctrl+G` | Agent screen (full TUI) | Toggle the tasks pane |
| `Ctrl+G` | Ordinary composer (minimal mode) | Edit the current draft in an external editor without sending it. If the terminal reserves this chord, choose **Edit Prompt in External Editor** from the command palette. |
| `Ctrl+E` | Minimal mode | With a draft in the prompt, move the cursor to the end of the line, as `Ctrl+A` moves it to the start. On an empty prompt, re-print the most recent folded block (collapsed thinking or truncated tool output) in full, the same as `/expand`; each press reaches one block further back. |
| `/plugins` (or `/hooks`) | Prompt focused | Open the extensions modal (it has no key binding) |
| `↑` | Prompt focused (empty prompt, normal input mode) | With prompts queued, move focus into the queue pane with the last row highlighted (`e` edits it, `Enter` sends it now); `↑` on its top row continues into history, and `↓` from the newest entry comes back to it. Otherwise open the history panel with your last prompt filled in; `↑`/`↓` step through entries (each lands in the input), `↓` at the newest closes the panel, and typing edits the recalled prompt in place. Recalled `!` shell commands re-enter shell mode. `↓` never opens history. |
| `Ctrl+S` (alt: `Alt+S`) | Prompt focused | Stash / pop the draft, `git stash`-style. With text or images in the composer: stash it and start fresh. On an empty composer: restore the newest stash (images and `!` shell mode included). After restore, the cursor is at the end of the restored draft. `Ctrl+Z` pressed right after the stash restores it too (any other key you type into the prompt disarms that). A chord-stashed draft also **restores automatically after you send your next prompt** (a double-Esc-cleared draft stays stashed, since that gesture is a discard). One draft at a time: a new stash replaces the old one. |
| `!` | Prompt focused | Enter shell mode (type `!` on an empty prompt) |
| `Ctrl+.` (alt: `Ctrl+X`) | Agent screen | Open the keyboard shortcuts help |
| `F2` (alt: `Ctrl+,` / `Cmd+,`) | Agent screen | Open the settings modal |

**Note:** While a **subagent fullscreen view** is open, the composer is hidden, unless you can message that subagent. Then the composer sends to the subagent on the root composer's keys: `Enter` queues or steers as `follow_up_behavior` says, the send-now chord steers without cancelling its turn, and `Ctrl+M` toggles multiline mode. `Ctrl+L` (the child's selected block or highlighted text) and block-viewer `Enter` (its line) quote into that composer and keep the view open; for a subagent you cannot message, they quote into your prompt and close the view. Root-only chords (`Ctrl+P`, `Ctrl+M` from the transcript, `Ctrl+R`, `Ctrl+B`, settings, Shift+Tab) do nothing, except that in the composer's vim Normal mode `Ctrl+R` redoes. `Ctrl+O` copies the subagent's latest reply; on Apple Terminal, where it is also the send-now chord, it steers from the composer while there is something to send. `Ctrl+C` stops the **subagent**, as its row's kill button does, except under a workflow run or in a session on another computer. `q` / `Esc` closes the view. `Ctrl+Q` still quits (`Ctrl+D` on VS Code family). See [Viewing Subagents in the TUI](16-subagents.md#fullscreen-framed-view-the-child-transcript).

**Note:** `Ctrl+M` is context-dependent. When the prompt is focused, it toggles multiline input mode. Otherwise, it opens the model picker.

**Note:** While a draft is stashed, the prompt's top border reads `Stashed` (next to the `/rename` title, if you set one). Minimal mode draws no border, so it prints a line in the scrollback each time you stash or restore. The stash lives in memory only: it is gone when you quit, and it does not travel to a resumed session. A new stash replaces the old one; the replaced draft is discarded.

**Note:** External editing works in every render mode: minimal mode binds `Ctrl+G`, and the full TUI uses `/edit-prompt` or the command palette. Grok resolves `$VISUAL`, then `$EDITOR`, then `vi`. Values may include quoted arguments. Saving replaces only the draft (the final newline editors append on save is stripped); an empty file clears it. Drafts with pasted/file/image chips must be edited in the composer so attachments are not flattened.

**Note:** The queue key is `Ctrl+4` in the local macOS VS Code family, and `Ctrl+Y` where `Ctrl+;` can't arrive: Grok on native Windows in Warp (not WSL or SSH), WSL in Windows Terminal, and local WSL in the Windows console or, by assumption, a terminal Grok can't recognize. `Ctrl+;` and `Ctrl+'` stay bound. `Ctrl+'` is a fallback for native Windows consoles that drop `Ctrl` only on `;`; in the setups above it doesn't arrive either. With `Ctrl+Y` as the queue key, the full-TUI prompt no longer pastes back cut text with it, and in minimal mode it shows the queue. In WSL, `Ctrl+;` stays the queue key once Grok negotiates the kitty keyboard protocol, which [`[ui] kitty_keyboard = "query"`](21-terminal-support.md#shiftenter-does-not-insert-a-newline-in-a-terminal-grok-cant-identify) asks the terminal for. A multiplexer that answers the kitty query, such as zellij, can negotiate it too, but on an older console `Ctrl+;` may still not reach Grok through it.

**Note:** On VS Code / Cursor / Windsurf / Zed integrated terminals, VTE, Apple Terminal, Windows Terminal, JetBrains, tmux with `extended-keys off`, screen, and similar no-KKP setups, Grok advertises **`Ctrl+X`** as the primary shortcuts-cheatsheet key. Those terminals get **`Ctrl+X`** inside tmux too, because tmux passes on only what the terminal sends. In tmux without the Kitty keyboard protocol, `Ctrl+.` also needs tmux 3.3+, `extended-keys on`, a client that lists `extkeys`, and on 3.5+ `extended-keys-format csi-u`; otherwise Grok advertises `Ctrl+X`. **`Ctrl+X` always works** as a classic control character even when `Ctrl+.` does not. Run `/doctor` if modified keys misbehave in tmux.

**Note:** On keyboard layouts that type `.` or `4` with Shift, such as French AZERTY, `Ctrl+.` and `Ctrl+4` work in Ghostty, kitty, WezTerm (with `enable_kitty_keyboard = true`), iTerm2, foot and Alacritty, when Grok gets the Kitty keyboard protocol (see the tmux note above). There, a `Ctrl+\` typed with AltGr does not reach Grok, so press `Ctrl+4` to open the dashboard. In the VS Code family and on Windows, press `Ctrl+X` for the shortcuts help.

---

## Image Paste & Drag-and-Drop

| Action | macOS | Linux | Windows |
|---|---|---|---|
| Drag image from file manager into the prompt | Finder ✓ | Files / Dolphin ✓ | Explorer ✓ |
| Copy a file in the file manager, then paste | `Cmd+V` | `Ctrl+V` | `Ctrl+V` |
| Screenshot or "Copy Image" in clipboard, then paste | `Ctrl+V` | `Ctrl+V` | **`Alt+V`** |

Non-image files insert their absolute path as text instead of a chip.

When Grok has a record of what a prompt sent, each `[Image #N]` in its transcript row shows whether the image went with it: highlighted if it did, struck through if only the placeholder text went. A placeholder with no send record, for example in a resumed session, keeps its usual look.

On macOS, `Cmd+V` also pastes a screenshot in some terminals. Apple Terminal and default iTerm2 keep `Cmd+V` for their own paste and send Grok nothing for a screenshot.

> **`Alt+V` on Windows** is grok-specific. Windows Terminal's default `Ctrl+V` only pastes plain text and silently drops image clipboards; `Alt+V` bypasses the interceptor. To use `Ctrl+V` for images too, add `{ "command": null, "keys": "ctrl+v" }` to `actions` in your Windows Terminal `settings.json`.

### Linux PRIMARY and CLIPBOARD

Linux X11 has two independent text selections:

- `Ctrl+V` reads **CLIPBOARD**, the explicit copy/cut selection. It never falls back to PRIMARY. To put text there with `xclip`, use `printf %s "text" | xclip -selection clipboard`.
- An unmodified middle click in Grok reads **PRIMARY**, the current mouse selection, only when `DISPLAY` is non-empty. Pure X11 can use its native reader fallback; XWayland requires `xclip` or `xsel` on `PATH` so Grok reads the X11 selection rather than Wayland PRIMARY. The press is handled once; the release does not paste again.
- `Shift+Insert` is the terminal-native way to paste selected text. Many terminals also use `Shift+middle click` to bypass application mouse reporting.

Over SSH, the remote Grok process usually cannot access the terminal's local X11 selection. Use terminal-native `Shift+Insert` or `Shift+middle click` so the local terminal sends the selected text through the PTY.

---

## During an active turn (agent running)

While the agent is generating:

- **Plain `Enter`** (with text in the composer) **queues** a follow-up for later. By default (`[ui].follow_up_behavior = "queue"`) those follow-ups run after the current turn ends — and they deliberately **hold** while the agent is blocked waiting on background tasks or a subagent (a hint explains the hold and how to send one now). With `"steer"`, the same Enter still shows the row in the queue, then the shell injects it mid-turn at the next tool or model safe gap (see [Configuration](05-configuration.md)).
- **`Enter` again on the emptied composer** (double-Enter) sends the **top** queued follow-up now.
- The **send now** chord is **cancel-and-send**: it stops the current turn (background tasks, subagents, and the rest of the queue keep running) and sends your message as the next turn, so it always appears at the bottom of the transcript:
  - **Non-empty composer** → cancel and send that text now. A built-in slash command such as `/compact` doesn't cancel the turn: it runs, or queues, exactly as it would on `Enter`. Other text that starts with `/` (a path, a skill, an unknown command) is still sent now.
  - **Empty composer** + a queued follow-up → send the **top** queued follow-up now (no need to focus the queue pane). On the queue pane, the same chord (or the **[Send now]** button) sends the **selected** row.
  - **Idle**, or **empty composer with nothing queued** → no-op for that key.
- While the agent is **blocked waiting** (on task output or a subagent), plain `Enter` with text also delivers immediately — the shell cancels the blocked turn and runs your message next.

| Terminal | Primary | Alternates | Action |
|----------|---------|------------|--------|
| Default | `Ctrl+Enter` | `Ctrl+I` | Send now (cancels the current turn, runs your message next) |
| Apple Terminal | `Ctrl+O` | `Ctrl+Enter`, `Ctrl+I` | Send now |
| VS Code family (VS Code, Cursor, Windsurf, Zed) | **`Ctrl+L`** | *(none)* | Send now (`Ctrl+I` not used — Tab / host chat) |

On the VS Code family, `Ctrl+L` doesn't send a quote that `Ctrl+L` just added from the transcript until you edit it, so pressing or holding it again during a turn can't cancel the turn. At an idle prompt, or during a turn with nothing to send, `Ctrl+L` redraws the screen.

In `/multiline` mode, `Shift+Enter` (or `Alt+Enter`) sends while plain `Enter` inserts a newline — except on an **empty** composer, where plain `Enter` still **send now**s the top queued row mid-turn, or else, in a session's full-screen view, opens a feedback draft whose row is on screen (same as normal mode). (`Ctrl+Enter` is send-now mid-turn when bound on non–VS Code family; it does not submit a new idle turn.)

Send-now is intentionally interruptive — it reads as "stop what you're doing and take this". To hand the agent a note **without** stopping it, queue with plain `Enter`; the agent picks it up at the next turn boundary.

One press sends one message now. For a second after a press that sent now, the send-now chord and `Enter` on the empty composer send nothing, so a double tap or a held key can't cancel the turn its first press started; each press dropped this way starts the second again, so a held key sends nothing until it is let go. In the second after a key that a card or dialog took, such as the `Enter` or `3` that answers a permission card, `Enter` on the empty composer sends no queued row; the send-now chord and `Enter` on a draft work as usual there. Typing any other key, or queueing a draft with `Enter`, ends that second early, so double-Enter works at any speed.

> **WezTerm**: These modified Enter keys need `enable_kitty_keyboard = true` in your WezTerm config. Full steps and a one-line workaround are in the [terminal support guide](21-terminal-support.md#ctrlenter-does-not-interject-in-wezterm).

> **Terminals without modified keys**: On macOS and Linux, in VTE terminals (such as GNOME Terminal), JetBrains, Windows Terminal under WSL, GNU screen, terminals Grok doesn't recognize (with no multiplexer), and tmux that doesn't forward modified keys, `Ctrl+Enter` loses its `Ctrl` (it arrives as `Enter` or `Ctrl+J`) and `Ctrl+I` arrives as `Tab`. There, in the normal prompt with nothing else queued, the footer offers send now as `Enter Enter`: the first queues your message and the second sends it now. In tmux, the [tmux settings](21-terminal-support.md#diagnose-and-fix-terminal-problems) bring `Ctrl+Enter` back from a terminal that sends it.

> **Windows (non–VS Code family)**: Some consoles drop the `Ctrl` modifier on `Ctrl+Enter` (it can collapse to bare `Enter` or `Ctrl+J`). Use `Ctrl+I` as the alt — letter-key Ctrl chords are stable in Windows consoles. On VS Code family, use **`Ctrl+L`**.

> **VS Code family `Ctrl+L`**: Grok uses it for interject in the prompt. If your terminal profile still maps **Clear** (or another command) to `Ctrl+L`, that host binding can steal the chord — rebind or remove it so the PTY receives form feed (`\x0c`).

---

## Global

Actions available from any screen.

| Key | Alt Key | Action | Confirmation |
|-----|---------|--------|-------------|
| `Ctrl+N` | | Create a new session (optionally in a git worktree) | Yes (double-press within 1000ms) |
| `Ctrl+\` | | Open or toggle the [Agent Dashboard](23-dashboard.md) | No |
| `Ctrl+L` | | Redraws the screen when nothing else on that screen uses it, or has nothing to do | No |
| `Ctrl+Q` | `Ctrl+D` | Quit the application | Yes (double-press within 1000ms; 3s with a notice while quitting would stop workflow runs) |

`←` on an empty, focused prompt (a session's or the welcome screen's) also opens the Agent Dashboard; in the dashboard's details view it returns there. A draft keeps `←` as a caret move, and the scrollback keeps it as collapse.

**VS Code family terminal** (VS Code, Cursor, Windsurf, Zed integrated terminals): `Ctrl+Q` is captured by the host, so Grok makes **`Ctrl+D` the sole quit key** (`Ctrl+Q` is not bound). Half-page-down is rebound to bare **`Shift+D`**. Mid-turn interject uses **`Ctrl+L`** (no alternates) because `Ctrl+Enter` / `Ctrl+I` do not reliably reach the PTY.

**Note:** In minimal mode, `Ctrl+L` redraws only the part Grok still draws at the bottom of the screen and clears the rows below it. See [Rows stay blank after a terminal clear](21-terminal-support.md#rows-stay-blank-after-a-terminal-clear).

> **Returning to the welcome screen has no key binding** — use the `/home` slash command (alias `/welcome`) from inside a session. See [Slash Commands](04-slash-commands.md).

### Destructive Action Confirmation

Actions marked with "Yes" in the confirmation column require a double-press within 1000ms. Press the key once to see a confirmation prompt, then press again to confirm. This prevents accidental session loss.

`Ctrl+C` on an empty prompt with nothing running asks for the same double press. With `ui.single_ctrl_c_quit = true` it quits on the first press, unless quitting would drop a draft or unfinished work.

### Quitting while workflows run

When quitting would stop workflow runs, the first quit press shows a notice such as `1 workflow still running; quitting stops it. Press Ctrl+q to quit.`, and the second press then has 3 seconds. Which runs count depends on where sessions run:

- **Shell route:** runs that are running now. A paused run stays resumable after you quit.
- **Daemon route:** every run that hasn't finished, paused and blocked runs included, because quitting stops the daemon (the notice says `not finished`). The notice says `run` instead of `workflow` (`1 run not finished; quitting stops it.`) when it counts the run of an `Execute` cell that imports no workflow.
- **Leader mode** (`--leader`, or `[cli] use_leader = true`): no notice, because the shared leader keeps the runs going after you quit.

A quit with no key to press twice, such as the palette's **Quit**, a click on a Quit row or `Enter` on the welcome menu's **Quit**, waits for the quit key. The welcome screen's update quit (`Ctrl+U`) and the login screen's `q` wait for the same key again. A typed `/quit` works as described under [`/quit`](04-slash-commands.md#quit). In minimal mode the notice is a line in the scrollback. With nothing running, every quit works as before.

---

## Welcome Screen

Bindings that only fire on the welcome screen (before any agent session is open).

| Key | Action |
|-----|--------|
| `Ctrl+P` | Open the command palette and leave home |
| `?` | Type `?` when the welcome prompt is focused |
| `Ctrl+R` | Resume session (open the session picker) |
| `Ctrl+W` | Open the New Worktree dialog (only inside a git repository) |
| `Ctrl+I` | Import Claude settings (when available) |
| `Ctrl+Shift+I` | Dismiss the Claude import row (when available) |
| `←` | Open the [Agent Dashboard](23-dashboard.md) when the welcome prompt is focused and empty |

`Ctrl+W`, `Ctrl+I`, and `Ctrl+Shift+I` are only active on the welcome screen. `Ctrl+R` opens the session picker on both the welcome screen and inside an agent session (where it opens as a modal overlay, same as the `/resume` command), except in prompt vim's Normal mode, where it redoes. With `ui.mouse_reporting_toggle` enabled, `Ctrl+R` toggles mouse capture while the scrollback pane is focused; the picker is still on `Ctrl+R` from the prompt, outside vim's Normal mode. `Ctrl+S` is the prompt stash inside a session (it does nothing on the welcome screen, which has no draft to set aside). `Ctrl+Q` is the same global Quit binding documented above, not a welcome-specific handler.

---

## Agent Dashboard

Bindings while the [Agent Dashboard](23-dashboard.md) is focused (`Ctrl+\`, `/dashboard`, or `←` on an empty prompt).

| Key | Action |
|-----|--------|
| `↑` / `↓`, `j` / `k` | Navigate agent rows (selecting a row opens peek) |
| `Enter` | Open the selected agent, or send a typed peek reply / dispatch prompt |
| `Ctrl+S` | Reply or dispatch **and** attach to that agent |
| `Ctrl+/` | Toggle search / filter mode |
| `Ctrl+R` | Rename the selected agent |
| `Ctrl+T` | Pin / unpin |
| `Ctrl+G` | Toggle grouping (state ↔ working directory) |
| `Ctrl+X` | Cancel a running turn, or press twice within 2s to permanently delete (in an attached agent's details view, twice closes the session instead) |
| `Tab` | Toggle focus between the list and the dispatch / peek input |
| `Esc` | Step back (cancel search → close peek → clear filter → unfocus → unselect → exit) |
| `Ctrl+\` | Exit the dashboard (or return from an attached agent) |
| `Ctrl+.` (alt: `?`) | Shortcuts cheatsheet |

Details (peek vs dispatch, search prefixes, persistence): [Agent Dashboard](23-dashboard.md).

---

## Command Palette

Press `Ctrl+P` or `?` to open the command palette -- a searchable list of common actions, each showing its key binding or slash command. It includes session actions, the extensions modal tabs (Hooks, Plugins, Marketplace, Skills, Workflows, MCP Servers), and more.

Type to filter, then press `Enter` to execute the selected action.

---

## Shortcuts Bar

The bottom of the TUI displays a contextual shortcuts bar showing the most relevant key bindings for the current state. The hints change based on:

- Which pane is focused (scrollback vs. prompt)
- Whether the agent is currently running
- What type of entry is selected

---

## Mouse Support

The TUI supports mouse interaction:

- **Click** on a scrollback entry to select it
- **Drag** across the scrollback to select text, across as many entries as you pass over; releasing copies it. A drag passes over a collapsed tool row, an activity group's label, a collapsed thought or message from another agent, and each turn's `Worked for …` line, so a drag down a turn copies your prompt and the reply. Expand a row to drag its text. A tool row with nothing to expand is passed over like any other, and a collapsed image or video row still copies its label and its file's path. `ui.keep_text_selection` decides whether the highlight stays (see [Configuration Reference](26-config-reference.md))
- To copy a whole entry, drag across all of it: a drag copies what is drawn on the rows it takes, with the URL back after a link whose URL Grok hides and, on the daemon route, the backticks back around inline code (see the next item). With `vim = "nav"` under `[keys]`, you can instead select the entry and press `y`; with `selection_buttons = true` under `[scrollback.display]`, the copy button on its selection box copies it. Those two also copy a background task's full output and the text a folded entry hides
- On the daemon route, a copy of a reply, a `/btw` answer, a thinking block or a question card puts backticks around the inline code it holds, so the text pastes as code where backticks mean code, such as a chat app. That holds for a drag, a triple-click, `y` on a selected entry, the copy buttons and add to chat, and in an entry's fullscreen viewer for a drag, a triple-click, `y` and a quote. A copy that lies inside one inline code span leaves the backticks out, so a command still pastes into a shell; a space, a punctuation mark or a symbol copied beside the span doesn't change that, but a list item copied with its bullet, number or checkbox keeps the backticks. In a table, a drag inside a cell and a triple-click on a cell follow the same rule, and in a copy of several cells each cell counts as text beside the others, so a cell that is one inline code span keeps its backticks there. A double-click on a word, a drag that runs through a table from the text around it, a table's row in the fullscreen viewer or in the dashboard's peek, and a table's **[Copy TSV]** and **[Copy CSV]** buttons copy inline code as it is drawn. To copy all inline code as it is drawn, set `copy_inline_code_backticks = false` under `[ui]`, or turn off **Copy inline code with backticks** in `/settings` → Mouse
- **Click** on a named subagent link (one that shows a label instead of the raw id) to open its view. A raw subagent or background task id clicks like the text around it, so you can still select it; `Cmd+click` (macOS) or `Ctrl+click` opens it
- **Point** at a link that a click opens (see the next item) and it lights up, underlined and bold, and a link whose URL Grok hides shows that URL in the status bar. A link that opens only with `Cmd+click` or `Ctrl+click`, such as one in a tool row, lights up when the pointer moves onto it with that key held. VS Code, Cursor, Windsurf and Zed handle link hover themselves
- **Click** on a web link to open it. Where this computer can't open it (over SSH, or with no display), a card at the link shows why and the whole address, with **[Copy]**; in Apple Terminal it also says how to let Terminal open the link (see [Links over SSH](21-terminal-support.md#links-over-ssh)). A click on a file link, or on a link whose URL Grok hides ([Terminal support](21-terminal-support.md#links-show-their-text-but-not-their-url)), shows the card first; its **[Open]** opens the link. A link in a table whose text isn't its URL or email address, such as `[the docs](…)`, `[docs.example](…)` or an image, shows only that text whether hiding is on or off, so a click on it in a reply or a `/btw` answer shows the card first too, and holding `Cmd` or `Ctrl` over it in the transcript shows its URL in the status bar, except in VS Code, Cursor, Windsurf and Zed, which handle link hover themselves. A bare URL, an autolink or a link whose text is its whole URL shows that URL and opens as before. A link in a tool row, its output and an inline image's file path included, clicks like the rest of the row; `Cmd+click` or `Ctrl+click` opens it. Except in Grok on a local Mac, which reads `Cmd` itself, a terminal that opens links itself (the VS Code family, or a link Grok sent as an OSC 8 hyperlink) keeps the click. A double-click on a web link acts once, opening it or showing its card, and selects no word
- **Double-click** on a message (your prompts and answers, replies, `/btw` answers, notices) to select and copy a word, or triple-click for one line of it, with the rows it wraps onto. The highlight stays until Esc, a click or a scroll, so the first Esc clears it. On a prompt, answered question, `/btw` answer or recap that shows only part of its text, a double-click expands it instead. In an expanded `/btw` answer, a double-click below its header that misses the text never folds it, in every mode; each click still selects it. The same miss, on a long user turn or an ask-answer row, never folds it either
- **Double-click** on a tool row, activity group or thinking row to expand or fold it, whatever `ui.keep_text_selection` is set to. In a thought whose body shows, expanded or still running, or in an expanded tool call, a double-click below its header that misses the text (blank cells, the rail, quote bars, the `…` row) never folds or expands it; each click still selects it
- With `ui.keep_text_selection` set to `hold`, a double-click never selects a word: on a prompt, answered question, `/btw` answer or recap it folds or expands it, and a drag's highlight stays until Esc, a click or a scroll. `flash` does the same, except that the highlight clears by itself a moment after the copy
- To use your terminal's own selection instead of Grok's, hold Shift (Option in iTerm2) and drag
- **Scroll wheel** to scroll through the scrollback
- **Click** on the prompt area to focus it
- **Hover** over the prompt to see a highlight (configurable via `pager.toml`)
- **Middle click** on Linux X11/XWayland to paste the PRIMARY selection

---

## Quick Reference Card

### When scrollback is focused (vim keys off — default)

```
Navigation:       Up/Down (prev/next entry)  Shift+Left/Right (prev/next turn)
Scrolling:        Ctrl+J/K (line)  PgUp/PgDn (page)  Ctrl+U/D (half page)
Focus prompt:     Space, or type any character but ? (focuses the prompt and types it)
Back to a card:   Tab (while a card or a plan approval waits)
```

### When scrollback is focused (vim keys `nav`)

```
Navigation:       j/k (up/down)  H/L (prev/next turn)  K/J (viewport-top turn)  g/G (top/bottom)
Scrolling:        Ctrl+J/K (line)  Ctrl+U/D (half page; D=Shift+D in VSCode)  PgUp/PgDn (page)
Folding:          h/l (collapse/expand)  e (toggle)  E (all)
Content:          y (copy)  Y (copy cmd)  Enter (fullscreen)
View:             r (raw markdown)  Ctrl+E (thinking)
Focus prompt:     i, Tab, or Space
Back to a card:   Tab (while a card or a plan approval waits)
```

### When prompt is focused

```
Send:             Enter
Newline:          Shift+Enter or Alt+Enter
Multiline:        Ctrl+M (toggle)
Paste:            Ctrl+V (text, files, screenshots on macOS/Linux)
Selected text:    Middle click or Shift+Insert (Linux X11/XWayland PRIMARY)
Paste image:      Alt+V (Windows only — for screenshots / "Copy Image")
Select all:       Cmd+A (macOS; Ghostty, Herdr 2, Rex — see note below)
Start / end:      Cmd+↑/↓ or Ctrl+Home/End (whole input — see note below)
Select text:      Shift+←/→ (char) · Alt+Shift+←/→ (word) ·
                  Cmd+Shift+←/→ (visual row) · Shift+Home/End (logical line) ·
                  Shift+↑/↓ (row) · Cmd+Shift+↑/↓ or Ctrl+Shift+Home/End
                  (to start / end of input)
Copy / Cut:       Cmd+C / Cmd+X (with a selection; Kitty-protocol terminals)
Leave:            Tab (back to scrollback)
Cancel (running): Ctrl+C (empty prompt; non-empty draft clears first)
Clear (idle):     Esc Esc within 800ms (non-empty prompt)
Rewind (idle):    Esc Esc within 800ms (empty prompt + messages)
```

The composer footer shows the newline chord next to `Enter:send` (or
`Enter:queue` while a turn is running) once the draft is non-empty
(including `/btw` and other arg-required slash commands). Over SSH, in
tmux that does not forward modified keys (older than 3.3 or
`extended-keys off`), or, when the Kitty keyboard protocol is not
active, in tmux with a client that does not list `extkeys` or on tmux
3.5+ without `extended-keys-format csi-u`, or in terminals that cannot
tell Shift+Enter from Enter, the footer prefers `Alt+Enter`.

`Cmd+Enter` is not an advertised send or newline chord. Many terminals
bind it to fullscreen, so `SUPER` is excluded from the Shift/Alt newline
matcher and from the agent's bare-Enter send binding. When a terminal
that speaks the Kitty keyboard protocol delivers `SUPER+Enter`, the
composer still inserts a newline: the key misses send and lands in the
textarea, which treats any Enter as a line break. Apple Terminal is a
separate local path: CoreGraphics rescue treats held Cmd as modified
Enter and inserts a newline on what arrives as bare Enter. Over SSH the
Cmd/`SUPER` modifier never arrives (iTerm2 + tmux included), so the
chord looks like bare Enter and sends. Remotely, use `Alt+Enter`, a
trailing `\` then Enter, or `/ml`.

With a selection active, typing / `Enter` / paste replace it, delete and
word-kill chords delete just the selection, arrows collapse it to the
matching edge (word/line moves continue from that edge), and `Esc` or `Tab`
drop the highlight while still performing their normal action. Note
`Shift+←/→` only selects while the **prompt** is focused; with scrollback
focused the same chords jump between turns (see Navigation above).

> **Cmd+A is gated to Ghostty, Herdr 2 and Rex.** Grok's in-app `Cmd+A`
> handler is only wired up when the detected terminal is Ghostty,
> Herdr 2 or Rex. Other terminals either swallow `Cmd+A` at the terminal
> layer (Apple Terminal, default iTerm2) or apply their own in-terminal
> "Select All" behaviour (Kitty, WezTerm). On any other terminal, the
> binding does nothing and the key falls through to the terminal's
> native behaviour.
>
> Herdr 2 binds nothing to `Cmd+A` and passes it to the program, so it
> works there with no setup.
>
> On Ghostty, add the one-line unbind to `~/.config/ghostty/config` so
> the keystroke reaches the running TUI:
>
> ```ini
> keybind = cmd+a=unbind
> ```
>
> After Ghostty reloads (it watches the config file), `Cmd+A` in the
> prompt selects every character in the prompt buffer, including pasted
> image chips. Image chips are always path-free (`[Image #N]`); the
> filepath (when known) appears only in the image preview overlay on
> hover or when the cursor is on/right after the chip. `[Image #N]` text
> that comes back as plain text (Ctrl+K then Ctrl+Y, undo, a plain-text
> paste) re-attaches as a chip while the composer still holds the image;
> a placeholder for an image it no longer holds is sent as text with a
> toast saying so.

> **Start / end of input.** `Cmd+↑` and `Ctrl+Home` move the cursor to
> the start of the whole prompt, and `Cmd+↓` and `Ctrl+End` move it to
> the end; with Shift they select to there. Many terminals keep `Cmd+↑/↓`
> for themselves; there, use `Ctrl+Home/End` (`Ctrl+Fn+←/→` on a Mac
> laptop). The [terminal support guide](21-terminal-support.md#cmdup-and-cmddown-dont-reach-grok)
> lists which terminals take which keys and how to pass `Cmd+↑/↓` through.

### Always available

```
Command palette:  Ctrl+P or ?
Model picker:     Ctrl+M (from scrollback)
Cancel:           Ctrl+C (see Escape table)
Copy reply:       Ctrl+O (latest reply, same as /copy)
New session:      Ctrl+N (press again; with `ask`, choose normal/worktree where one can be made)
Quit:             Ctrl+Q (or Ctrl+D in VSCode)
```
