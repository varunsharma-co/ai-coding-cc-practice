# Moving from Rhai Workflows

On the daemon route a workflow is a JavaScript module, and `.rhai` workflows don't run. When you run a `.rhai` workflow, Grok converts it into a module. This page covers that conversion and what replaces the parts of Rhai workflows that are gone. To write a module yourself, see [Workflows on the daemon route](04-slash-commands.md#workflows-on-the-daemon-route).

## Running a `.rhai` workflow

`/workflow list` lists the `.rhai` files in `.grok/workflows/` and `~/.grok/workflows/` with the modules. When you run one by name, `/<name> [args]` or `/workflow <name> [args]`:

1. When the conversion's turn starts, a line in the conversation says that `/<name>` converts `<name>.rhai` into `<name>.js` beside it, whether it starts it, and how to undo the conversion.
2. The model writes `<name>.js` beside the script, checks that it loads, and starts it with your args, unless they ask for an agent budget under 1,024.
3. You approve the write and the start, if any, as you would any file write and any workflow the model starts.

The conversion never edits, moves, or deletes the `.rhai` file. Once `<name>.js` is a valid workflow, `/<name>` and `/workflow list` use it instead of the script. To undo the conversion, delete `<name>.js`.

A run a conversion starts gets the default agent budget of 1,024, the most a run may start: past it, further agents are refused and the run doesn't pause. If your args ask for less, with `--agent-budget N` first or an `agent_budget` key, the model writes and checks `<name>.js` but doesn't start it, and its reply gives the command that starts it with that budget.

If you change `<name>.rhai` after the conversion, starting `/<name>` says so. `/migrate-workflow <name>` converts it again, replacing `<name>.js` and any edits you made to it, unless your edits removed its `Converted from` line, in which case it stops and says so.

## Converting without running

- `/migrate-workflow <name>` converts one script and doesn't start it. `/migrate-workflow <name> [args]` also starts it with those args, unless they ask for an agent budget under 1,024.
- `/migrate-workflow --dry-run` checks every `.rhai` file in the project and user workflows folders, and `/migrate-workflow --dry-run <name or path>` checks one. It writes and starts nothing. Each script gets one line, starting with its path, that says whether it converts, what blocks it and what to change, or that a `.js` module is already there.
- `/migrate-workflow --all` converts the `.rhai` files that have no `.js` module yet, a batch at a time, and starts none of them. A script that is blocked or fails its check gets a line saying why, and the others still convert; one that fails its check keeps the `<name>.js` it wrote. In a project folder you haven't trusted, it writes nothing there and says to trust the folder. A script your read rules refuse gets a line saying so and is skipped. Its last line says how many are left; run it again for the rest.

## When a script can't convert

Some Rhai features have no counterpart in a module, such as `budget()`, `await_user`, or an agent that runs in its own worktree. When a script uses one, the conversion stops before it writes anything and says what blocks it and what to change so it converts. If you can't make that change, port the script by hand as `<name>.js`.

## What replaces what

| In a Rhai workflow | On the daemon route |
|---|---|
| `/workflow pause <run>` | `/workflow stop <run>`, then `/workflow <name>` starts the workflow again from the beginning |
| `/workflow save <run>` | Your own and the project's workflows are already `.js` files in their workflows folder, so edit one there. To keep a script the model ran without a file, ask the model to write it as a workflow |
| `budget()` | Fixed numbers in place of the values the script reads from it, and `--agent-budget N` when you start the run. A module can't read its budget |
| `meta.name`, `meta.description` | `name` and `description` in the module's front matter |
| `--effort` | Not available on this route yet. Set the session's effort before you start a workflow: its agents that name no model run the session's model and settings. An agent can name its own model and settings in `host.agent` (see [Workflows on the daemon route](04-slash-commands.md#workflows-on-the-daemon-route)) |

## Turning conversion off

Set `workflow_conversion = false` under `[features]` in `config.toml`, or `GROK_WORKFLOW_CONVERSION=0` (see the [Configuration Reference](26-config-reference.md#features)). Running a `.rhai` workflow by name then tells you to port it as `<name>.js`. `/migrate-workflow` still converts when you ask.

## Headless runs

In a `grok -p` run, Grok sends a `.rhai` workflow run by name to the model as text rather than converting it, and `/workflow list` says so (see [Workflows and Background Work](14-headless-mode.md#workflows-and-background-work)). To convert your scripts from a shell script or CI, run `grok -p '/migrate-workflow --all' --always-approve --trust`, and run it again while its last line says some are left. A headless run can't ask you anything, so pass `--always-approve` (or set rules that allow its writes and checks) and `--trust`, which lets it read and import the project's workflows (see [Always-approve for automation](14-headless-mode.md#always-approve-for-automation)). `--trust` also turns on the folder's hooks, MCP servers, and project instructions, so use it only on a checkout you trust (see [Permissions and Safety](22-permissions-and-safety.md)).
