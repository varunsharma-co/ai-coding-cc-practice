# 1.0.88 — 2026-11-16

## Features

- **`/release-notes`**, `/docs` and `/help` now open when the dashboard is active.
- **MCP servers** can now specify a `headers_helper` command to provide dynamic request headers.
- **Links** keep showing the hand pointer when Cmd is pressed or released while the pointer rests on them.

## Bug Fixes

- The dashboard peek now highlights the selected permission or question option with the same caret and band used elsewhere.
- **Prompt border** and mode banner now truncate long model or mode names with an ellipsis.
- **Tokyo Night theme** now dims the unfocused input border correctly.
- Selecting a multi-line field in a persona now highlights every row, and the collapsed-instructions hint shows the true remaining line count.
- **Dashboard** now labels actions "Resume Session" and "Enable Worktree", and the free-text row says "Type your answer here".
- **Welcome bar** on narrow terminals keeps the current folder name visible by shortening the branch first.
- **`/resume`** search bar on narrow terminals no longer lets the filter chip cover the query text.
- **Scrollback** now applies the same selection highlight to Task, Subagent and Workflow rows.
- **Tasks pane** on narrow terminals no longer paints buttons or timers over the status icon.
- On the `/agents` modal the Personas tab now colors badges by scope, and empty tool or prompt-extension fields read (empty).
- **Tips** and answered-question text now dim to match the terminal theme.
- **Permission and question cards** now end long typed answers and form values with an ellipsis on narrow terminals.
- **Block viewer** search bar and status no longer overlap the last lines of content.
- The `/tasks` block now shows scheduled loops with the same next-fire suffix and empty message as the Tasks pane.
- **`/resume` in minimal mode** now lets arrow keys and Enter act only on rows that are actually shown.
- **File search, history and image preview** now show an animated "Loading…" indicator.
- **Minimal mode** no longer shows an [Open] button on media rows, which that mode cannot click.
- **Scrollback** on narrow terminals no longer drops wrapped text or group headers.
- **Permission cards** now show only the scope arrows that still move the scope.
- **Tab** is now the only key that returns to a parked card or plan approval.
- An empty or whitespace-only hook file now loads without error.
- The first prompt now keeps earlier rows (such as hook notes) visible when they fit on the page.
- **Pasted images** now attach to the correct input field on the dashboard without waiting for other fields.
- **Keyboard navigation** in todo, tasks and queue panes now works correctly after the pane changes while hidden.
- **Loaded sessions** now keep their saved model and effort even if the first model list fetch fails.
- **Voice dictation** on Windows now tells you where to turn on microphone access when the OS blocks it.
- **Welcome screen** rows on light themes now use lighter selection and hover colors.
- Plan revise refusals now appear in minimal mode instead of leaving the review stuck with no message.
- **Failed sign-in in minimal mode** now shows only the error message in red.
- **Trust question keys in minimal mode** now read with single spacing after y/n.
- **Minimal mode** status and info rows now end in an ellipsis; transcript progress uses sentence case.
- **Device sign-in in minimal mode** now shows the code by itself with the explanatory caption underneath.
- **Sign-in starting in minimal mode** now shows "Connecting…" until the flow type is known.
- **Sign-in text in minimal mode** now wraps cleanly on narrow terminals.
- The shortcuts bar now shows exactly the scope arrows the permission card above it names.
- `/doctor` now correctly says when a confirmed keyboard protocol is not actually in use.
- **Limit-box model switch** now applies the exact settings the backend suggested.
- **`/resume` in minimal mode** now shows the same loading spinner and empty states as the full picker.
- **`/resume` in minimal mode** now keeps message-text matches visible, using the same query the keys use.
- **Filtering the Tasks pane** now keeps each row's icon, time and buttons on its own row.
- **`/resume`** search bar now shows which source filter is active when width permits.
- **`/queue` output** now prefixes bash commands with "! " and uses the pane's line-count suffix.
- **`/usage` by-model rows** now say "tokens" in lowercase for consistency.
- Keys in a filtered **Tasks pane** now act on the highlighted row.
- **`/resume` in minimal mode** now draws a flat list when session grouping is off, so selection matches the keys.
- The **MCP form card** in minimal mode now fits the width it draws, so every field stays visible.
- **Clicks in a scrolled Tasks pane** now select the task under the pointer.
- **Tasks pane** no longer loses its search bar or shows stale rows after a filter update.
- The **MCP URL rejection card** now shows the full rejected URL even when the error reason wraps to two rows.
- **Tasks pane** no longer selects a hidden task when clicking the search or filter status row.
- The TUI no longer waits on a saved turn that has already ended.
- **`/resume` panel** now shows all fields even when a session's CWD wraps at narrow widths.
- **Session picker** no longer lets keys or clicks act on sessions while reloading the list.
- **Session picker keys** now do nothing until the next frame actually draws list rows.
- **Scrollbars in question cards** now size correctly when option descriptions wrap to the card width.
- **Question option lists** no longer show a scrollbar or allow overscroll when every option fits.
- **Limit-hit model switches** now show the exact settings they will select (for example "Switch to Auto (Standard, Terse)").
- **`/resume` and full-screen pickers** no longer truncate cards when a long CWD contains an early space.

## Performance

- **Startup** now overlaps terminal protocol queries with the agent connection for a faster first frame.
- **Inline and minimal mode** startup no longer delays the first frame on terminals that answer the cursor question slowly.


# 1.0.87 — 2026-11-14

## Bug Fixes

- **Key hints** in fullscreen dialogs now appear with consistent capitalization.
- **Persona names and descriptions** in the agents modal no longer overflow the window when they contain wide characters.
- **The /mcps panel** in minimal mode now shows the same loading, error and layout style as the full view.
- **The /mcps panel** in minimal mode now shows a search bar and the full set of action hints, and opens forms when their keys are pressed.
- **Dragging to select text** now skips collapsed tool calls and the turn summary line, copying only the actual conversation.
- **Typing on the permission card** now sends your text as feedback to the model instead of changing the selected row.
- **Text left by another program** on the same terminal is now cleared at the end of a tool call, the end of a turn, or when the window regains focus.
- **Cmd+A** now selects the entire prompt text when using the Rex terminal.
- **Links** in replies now highlight when you move the mouse over them, showing they can be clicked.
- **Resume search snippets** now fit the list width and keep the matching text visible instead of cutting it off.
- **Expanded agent details** in /agents now end with an ellipsis instead of being clipped at the modal edge.
- **`/voice`** on macOS now tells you exactly which app (your terminal) is missing Microphone permission and how to fix it.
- **Voice error messages** are now saved to scrollback when the toast cuts them off, and toast text no longer shows stray spaces or double ellipses.
- **Arrow keys** now navigate prompt dropdowns even when a /btw answer appears underneath.
- **Opening a /btw answer as its own session** now moves focus to that session's prompt only after the tab is open.
- **Settings rows** in very narrow terminals now show their label instead of a cut restart tag.
- **Footer hints** in minimal mode no longer truncate mid-word on narrow terminals.
- **Use Tool** blocks now show (no output) when a tool returns nothing.
- **/resume** in minimal mode now shows "y confirm delete · n cancel" before deleting a session.


# 1.0.86 — 2026-11-14

## Features

- **Pretty mode** shows reference-style links the same as inline links.

## Bug Fixes

- **Loading messages** and input placeholders use a consistent Unicode ellipsis character.
- **Resume session cards** keep long text and their ellipsis on a single line.
- **Auth token box** on the welcome screen has rounded corners.
- **Long file paths** shown in narrow columns stay recognizable.
- **Settings toggles** and feedback messages use consistent labels.
- **Status messages** and terminal titles follow consistent capitalization.
- **Todo lists** in goal overlays match the main Todo pane styling.
- **/export** status messages match the style of other notices.
- **List tool rows** show the correct number of files and folders.
- The transcript line for nothing to retry no longer ends with a period.
- **Message previews** and picker rows no longer get cut off by wide characters.
- Pending action labels in the extensions modal start with a capital letter.
- **Image preview overlays** show dimensions with the multiplication sign.
- **Minimal-mode /mcps** list shows server source and tool summaries.
- Result notices after extension actions stay visible as long as other messages.
- **Feedback and settings modals** show an Esc hint when the terminal is too small.
- Toast messages for settings resets and voice errors follow a consistent format.
- **Update notices** on the welcome screen align consistently.
- Error messages for failed actions include the reason in a single sentence.
- The cancel-turn panel uses the correct text color and ellipsis when narrow.
- Several CLI subcommand messages use consistent punctuation and path quoting.
- Key hints in permission cards are no longer cut off mid-word on narrow terminals.
- The file-search and prompt-history panels no longer crash on very short terminals.
- Plan approval text in minimal mode matches the fullscreen version.
- The extensions modal no longer shrinks narrower than other modals.
- A few welcome-screen tips and labels use more consistent wording.
- Selected items in pickers highlight their full height.
- The dashboard footer is padded evenly and the location caption brightens on hover.
- Content-search results in the resume picker appear under a shorter heading.
- Overflow messages correctly pluralize and show exact counts.
- Goal status labels are consistent between the status bar and the goal modal.
- Error messages for `grok -p --resume` when other flags are present are clearer.
- **Double-click** on a thinking block folds or expands it again.
- **Change directory picker** keeps the folder name visible when a path is too long.
- **Persona Source path** keeps the filename visible when the full path is too long.
- **How-to Guides tip** keeps the last folder name visible when the path is too long.
- **@-file search** keeps the filename visible when a path is too long for the row.
- **Sign-in copy messages** read "Copied!", "Copy sent: verify paste", and "Copy failed".
- **URLs typed in user messages** appear as styled clickable links matching assistant links.
- **Cmd or Ctrl+click** opens links even when the confirmation card is visible.
- **File links** containing %20 spaces open the correct file instead of reporting it missing.
- **Dragging from blank areas** of rows no longer starts a text selection and preserves fold/unfold clicks.
- Paths ending in one or more slashes shorten correctly and keep the final folder name readable.
- **Long setting descriptions** in /settings fit within the modal without being cut off.
- **Multi-line prompts** in the session picker show their ellipsis on the same row.
- **@ file picker** in the dashboard no longer crashes on terminals shorter than 10 rows.

## Performance

- **Tasks pane** no longer flickers with changing subagent activity text while work is running.


# 1.0.85 — 2026-11-13

## Features

- **Question, MCP input, and plan-approval cards** now send the same terminal notification as permission requests.
- **The /resume picker** now searches session contents as you type and lets you open a match.
- **`/skills` with a name** now opens the Skills tab filtered to that name.
- **Slash command autocomplete** now shows each command's argument hint after the name.
- **`grok inspect`** now counts hooks and MCP servers from inline plugins.

## Bug Fixes

- **`--fork-session` alone** now starts a new session instead of failing.
- **Double-clicking a thinking block** now selects text instead of folding or expanding it.
- **Network-restricted sandbox profiles** now start on a Mac when OrbStack is installed.
- **Typing a full skill name in the slash menu** now reliably selects the exact match.
- **Dashboard dispatch box** now correctly labels what Enter does when a row is selected.
- **An unchanged plan-revision draft** is no longer shown again after it is sent.
- **A subagent that hits its turn limit** now returns its work and wakes the parent.
- **Session titles** no longer show raw color codes or control characters.
- **Follow-ups sent into a running turn** are no longer dropped when that turn stops at its cap or on repeated tool calls.
- **A second Ctrl+C** within one second now arms quit instead of cancelling the next queued prompt.
- **Clicks** on a hidden question-card answer no longer move the caret.
- **Dictation** no longer starts a new recording while the last clip is still processing.
- **The stop panel** now closes when the turn it belongs to finishes.
- **Ctrl+C** now cancels a /compact that was queued while another turn was running.
- **grok update** no longer hangs while cleaning up old downloads.
- **Home-screen session search** no longer sticks on Searching after the dashboard opens.
- **Rename input and history previews** no longer show raw color codes.
- **A prompt typed on a tab whose session failed to restore** is now refused instead of dropped.
- **Skills** now expand `${ARGUMENTS}` and `${ARGUMENTS[N]}` in the skill body.
- **Headless plain and json output** now start a new paragraph after tool calls.
- **`/rewind`** now cancels a compaction that is still summarizing.
- **Unknown or disabled slash commands** now get a direct reply instead of being sent to the model.
- **Replies** now preserve single newlines as line breaks instead of joining them into one paragraph.
- **Space in the /skills list** now folds groups, and the filter label is no longer clipped.
- **Skill reads** now show the skill's advertised name instead of its folder name in the scrollback and shell titles.
- **Tool search rows** now start with Search, matching file-search rows.
- **Skill-read titles** keep the skill's advertised name after a reload.
- **`grok inspect`** hides plugin hooks and LSP servers in an untrusted folder, matching a session.
- **Grok** panes in tmux now repaint correctly after certain resize sequences.
- **Session title generation** now finishes on models that count reasoning against the output limit.


# 1.0.84 — 2026-11-12

## Features

- **Open /model and /context-window dropdowns** now update their rows and markers immediately when the session's model list changes.
- **Model picker** now updates its list live when your account models change or another client switches the model.

## Bug Fixes

- **Fixed setting save ordering** so a newer pick is not overwritten by a delayed older write.
- **grok update** now explains when it ran from a different copy and what to do next.
- **API-key model note** now appears only in the first list the user actually sees and does not reappear under modals.
- **Fixed a bug** where pressing Ctrl+N on a mid-session sign-in screen could open an extra session after you later signed in.
- **Shift+Enter** (or Alt+Enter) in multiline mode now correctly sends a line that ends with a backslash.
- **Send-now** and double-Enter no longer cancel a turn that the first press just started.
- Fixed a crash when typing long answers on short terminals.
- Queued follow-ups are no longer lost when a permission prompt is rejected or cancelled.
- **Double-tapping Ctrl+O** in minimal mode on Apple Terminal no longer cancels the just-sent prompt.


# 1.0.83 — 2026-11-11

## Bug Fixes

- **Welcome screens** display correctly on terminals with one or two rows or fewer than eight columns.
- **A follow-up click** after you accept the consent notice or trust a folder no longer acts on the next screen before it is drawn.
- **Bundled MinGit on Windows** uses the schannel backend for HTTPS operations.


# 1.0.82 — 2026-11-11

## Features

- **`grok update`** now delegates to the self-updating build in `~/.grok/bin` when needed.
- **Enter** (or `Ctrl+F`) expands or collapses long user messages directly in the transcript.
- **The note about models coming from XAI_API_KEY** now appears only the first time you open any model list and never again.
- **New `minimal` sandbox profile** and `workspace_write` option let custom profiles control launch-folder writes.
- **`Ctrl+O`** now copies the latest assistant reply.

## Bug Fixes

- **Sign-in screen** now renders correctly on the legacy Windows console.
- **Hooks** no longer share an identity when Grok's own Node settings are present.
- **Folder trust prompt** no longer accepts keystrokes typed before the question appears on screen.
- **Queued prompt edits** keep your composer draft when the queued row disappears under an open question.
- **Caret** no longer flickers when resizing the window in minimal mode or opening the sign-in chooser.
- **`grok -p --resume`** now requires a valid session ID and refuses empty values early.
- **Drag selection** from transcript text now autoscrolls immediately at the pane edge.
- **`/debug tps`** excludes model retry and auto-compaction waits from the tokens-per-second rate.
- **Windows** Git helpers now use the bundled MinGit binary.
- **Up arrow** in a question's text answer moves to the previous option when at the top line.
- **Headless runs** no longer trigger unnecessary turn-summary model calls.
- **Copied text** from tables, question cards and the fullscreen viewer now includes backticks around inline code.
- **Browser sign-in** finishes against the login stored now, and is refused if another window removed that login.
- **Sign-in screen** now starts fresh after logout or a cancelled login.
- **Clicks** on the welcome screen no longer fire the wrong action when the UI changes before the next frame.


# 1.0.81 — 2026-11-11

## Bug Fixes

- **Tasks pane** and list panes now correctly align search status and truncate scheduled-task previews when prompts contain wide Unicode characters.
- Labels for MCP servers, LSP servers and URL copy hints now use consistent uppercase spelling throughout the UI.
- Foldable rows in modals now show a down chevron when open, making expanded groups easier to distinguish from leaf rows.
- Send-now and interjection failure toasts now clearly state the original error before noting the requeue; fork refusals use consistent wording.
- Several one-sentence system notices no longer end with a period, matching the rest of the toast messages.
- Navigation hints in several modal footers now consistently use arrow keys instead of j/k.
- Plan approval and revision notices are now single-sentence without trailing periods.
- Key hints throughout the UI now use consistent Ctrl+ notation and Title-case key names.
- Collapsible rows now use the same disclosure glyphs everywhere and fall back correctly on legacy consoles.
- Contextual tips for SSH wrap, word selection and context usage now match the style of other tips.
- Long pasted content previews now show an ellipsis that renders correctly on all terminals.
- Selected rows in the feedback Drafts list now show the same highlight band used elsewhere; other text colors are consistent.
- Plan approval status now reads "Waiting for plan approval" and the empty command-pattern field uses sentence case.
- One-sentence slash errors and modal messages no longer end with periods.
- Various labels throughout settings, goal details and titles now use consistent sentence case.
- **Terminal window titles** now correctly truncate CJK, emoji, and Windows paths instead of overflowing.
- **CLI success messages** now consistently omit trailing periods to match the rest of the tool.
- **Workflows view** no longer jitters when focus moves into the agent list and empty messages align correctly.
- **Resume picker** error messages now use consistent wording and punctuation.
- **UI labels** now correctly say "1 page", "1 hook", etc. instead of always using the plural.
- **Tasks pane** empty state and tool-usage pane title now match surrounding UI wording.
- **MCP elicitation** prompts now read "MCP server …" to match the rest of the UI.
- **CLI tables** and progress messages now use the same ellipsis style and no longer overflow with wide text.
- Focused prompt border is now visibly brighter than a selected scrollback entry in Rose Pine Moon and Oscura themes.
- Empty pickers now say what is empty ("No sessions in this directory", "No subfolders") and never overflow the border.
- MCP elicitation cards no longer crash when drawn in very narrow or short terminal areas.
- Goal budget meters now always show both brackets and the percentage even in narrow terminals.
- Three one-line notices no longer end with a period, matching the style of other status messages.
- The density preview in Settings now appears at the same narrow widths as the other preview in the same modal.


# 1.0.80 — 2026-11-09

## Bug Fixes

- **Failed web fetches** now show the actual error reason when expanded.
- **Grep results** now display tab characters as spaces so columns line up correctly.
- **Thinking blocks** stay expanded while streaming after pressing Ctrl+E to expand all.
- **Pending todos** now render correctly on legacy Windows consoles.
- **Usage modal** no longer clips the credit bar or billing URL on narrow terminals.
- **Numbered lists** in workflow phases and tool search now align correctly for 10+ items.
- **Read headers** and video overlays now handle narrow terminals and CJK text correctly.
- **Dashboard peek** now shows all options and keeps input visible on narrow terminals.
- **Scrollback** glyphs now render correctly on legacy Windows consoles.
- Dashboard now uses compact session rows on narrow terminals (40-43 columns).
- Plan review buttons remain visible and clickable on narrower terminals.
- **Shift+drag selection** beside the scrollbar no longer copies an extra block character at the end of each row.

## Performance

- **Large pasted text** no longer stalls for many seconds when the terminal lacks bracketed-paste support.
- **Faster startup** on Linux when the system bus is slow or unresponsive.
- **Faster startup** when a Kitty-capable terminal never answers the keyboard protocol query.


# 1.0.79 — 2026-11-08

## Features

- **`/rewind`** now works in place for paged sessions without reloading every turn.
- **Link cards** now appear by default for links that cannot be opened.
- **`/vim-mode all`** enables full Vim editing inside the agent prompt.
- **Auto-review mode** now tints the entire prompt bar blue, matching plan and ask modes.
- **`/doctor`** now warns when tmux holds Esc for more than 50 ms.
- **Vim Normal mode** now appears as a section in the keyboard shortcuts cheatsheet when enabled.
- **End-of-turn marker** now shows how many background commands are still running.

## Bug Fixes

- **Copy buttons** under code blocks remain clickable while slash or other menus are open.
- **Deleted sessions** no longer appear in resume lists or title searches.
- **Delete error messages** now show their full text instead of being cut off.
- **Text** remains visible when running through an 8-colour tmux session.
- **Authentication error messages** during sign-in no longer repeat the underlying cause.
- **Ctrl+E** in minimal mode now moves the cursor to the end of line when editing a draft.
- **macOS** documentation now recommends `Ctrl+V` to paste screenshots.
- **Mermaid diagrams** now correctly break lines on `\n` and `<br>` instead of printing the literal characters.
- **MCP sign-in URL copy** feedback now correctly indicates verification status.
- **Double-clicking** a view close no longer accidentally stops a background task or subagent.
- **Tab completion** now works immediately after startup even before skills load.
- **Saved feedback drafts** now open correctly from the full session view.
- **Markdown links** containing LaTeX now render correctly without entering math mode.
- **Ctrl+Y** now toggles the prompt queue when running in WSL inside Windows Terminal.
- **Editing a queued prompt** now shows an "editing" label and dims the row.
- **Cancel-turn prompt** no longer crashes the TUI on very short terminals.


# 1.0.78 — 2026-11-06

## Features

- **@ file chips** can now be edited in place; typed @~/ paths resolve to the home folder.
- **Dragging in the transcript** now selects and copies colored text across message blocks instead of whole blocks.
- **@ mentions** now support :N line suffixes and @!hidden files.

## Bug Fixes

- **Always-approve help text** now correctly says the setting is saved to config.
- **Dropped-image notice** no longer appears inside the user's own message in transcripts or history.
- **grok update --channel** now gives a clear error and steps when bin/grok was installed by npm.
- `grok update` and channel switches now work correctly for Homebrew cask installs and show the right commands.

## Performance

- **grok export** of sessions containing large shell output is now faster and uses less memory.


