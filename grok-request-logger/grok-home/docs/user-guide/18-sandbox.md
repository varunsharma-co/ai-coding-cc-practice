# Sandbox Mode

Sandbox mode restricts what the agent process and its spawned commands can access on your filesystem and network using OS-level kernel primitives (Landlock on Linux, Seatbelt on macOS). The kernel enforces these limits for the process lifetime.

Sandbox mode is off by default.

---

## Quick Start

```bash
# Run with workspace sandbox (read everywhere, write to CWD + temp dirs + ~/.grok/)
grok --sandbox workspace

# Read-only mode (read everywhere, write only to ~/.grok/ + temp dirs)
grok --sandbox read-only

# Most restrictive profile (read CWD + system paths + ~/.grok, write CWD + ~/.grok/sessions + temp dirs, no child network)
grok --sandbox strict
```

---

## Built-in Profiles

| Profile         | FS Read                        | FS Write                                                               | Child Network | Use Case                 |
| --------------- | ------------------------------ | ---------------------------------------------------------------------- | ------------- | ------------------------ |
| `off` (default) | Unrestricted                   | Unrestricted                                                           | Unrestricted  | No sandbox               |
| `workspace`     | Everywhere                     | CWD + `~/.grok/` + `/tmp` + `/var/tmp`                                 | Allowed       | Normal development       |
| `devbox`        | Everywhere                     | All top-level dirs except `/data`                                      | Allowed       | Disposable dev VMs       |
| `read-only`     | Everywhere                     | `~/.grok/` + `/tmp` + `/var/tmp`                                       | Blocked¹      | Exploration, code review |
| `strict`        | CWD + system paths + `~/.grok` | CWD + `~/.grok/sessions` + `~/.grok/daemon/run/strict`² + `/tmp` + `/var/tmp` | Blocked¹      | Untrusted code           |
| `minimal`       | CWD + `~/.grok` + what Grok needs to start³ | `~/.grok/sessions` + `~/.grok/daemon/run/minimal`²                     | Blocked¹      | A base for custom profiles |

¹ Child-network blocking is enforced on **Linux only** (via seccomp). On macOS it is a no-op — these profiles do not restrict child-process network there.

² Only when the daemon backend runs the session; it holds the sockets, log and session store of the daemons under `strict`. A custom profile gets its own `~/.grok/daemon/run/<name>`.

³ On macOS: `/etc/grok`, `/System/Library/OpenSSL`, `/var/run`, and `/Library/Application Support/ClaudeCode` (the managed-settings file an admin may install there). On Linux the list has not been narrowed yet, and `minimal` reads the same system paths as `strict`.

To block specific files (e.g. `.env` or credential paths) on top of a profile, define a [custom profile](#custom-profiles) with a `deny` list — it is kernel-enforced (read + write/rename) and supports glob patterns like `**/*.pem`.

### Profile Details

**workspace** -- The recommended profile for everyday development. The agent can read any file on the system (for understanding dependencies, system libraries, etc.) but can only write to the current working directory, `~/.grok/`, and temp directories (`/tmp`, `/var/tmp`, plus the macOS temp dirs). Network access is allowed for tools like `web_search` and MCP servers.

**devbox** -- A reserved built-in profile for disposable development VMs. The agent can read everywhere and write to every top-level directory except `/data` and the virtual filesystems (`/proc`, `/sys`, `/dev`), including the home directory. Network access is allowed. `--sandbox devbox` runs the built-in profile, which shadows any `[profiles.devbox]` you define in `sandbox.toml`.

**read-only** -- Use when you want the agent to analyze code without modifying your project files. The agent can read everything but can only write to `~/.grok/` (needed for session persistence) and temp directories. Child-process network access is blocked on Linux (no-op on macOS).

**strict** -- The most restrictive profile, for reviewing untrusted code. The agent can read the current working directory, essential system paths, and `~/.grok`. Writes are limited to CWD, `~/.grok/sessions`, and temp directories — not the whole `~/.grok` tree. When the daemon backend runs the session, it can also write `~/.grok/daemon/run/strict` (the sockets, log and session store of daemons under `strict`). Child-process network access is blocked on Linux (no-op on macOS).

**minimal** -- The smallest set of paths Grok needs to start a session, meant as a base for [custom profiles](#custom-profiles) (`extends = "minimal"`) that add exactly what a task needs. The agent can read the current working directory, `~/.grok`, and the few system paths in the table above. It can write `~/.grok/sessions` and, when the daemon backend runs the session, `~/.grok/daemon/run/minimal`. It cannot write the current working directory or the temp directories. On macOS shell commands still start, but they read only those paths, so a command that needs a script, a library, a config file or a temp file elsewhere fails until a profile that extends `minimal` grants it (for example `read_only = ["/bin", "/usr", "/System"]` and `read_write = ["/private/tmp", "/private/var/folders"]`). `workspace_write = true` lets it write the current working directory. Child-process network access is blocked on Linux (no-op on macOS). The name is reserved: while `~/.grok/sandbox.toml` defines a `[profiles.minimal]` of its own, Grok refuses to start under `minimal` or a profile that extends it, since running the built-in instead would silently drop that profile's rules. Rename the custom profile. A project's `.grok/sandbox.toml` can't define a profile under a built-in name; such an entry is ignored.

### Grok's own files under the sandbox profiles

`workspace` and `read-only` let Grok write the whole `~/.grok` tree, since it saves sessions, settings and logins there, and `strict` lets it write `~/.grok/sessions`. What the agent does in a session under one of them, or under a custom profile that doesn't extend `devbox`, gets less:

- **File edits:** Grok's file tools refuse to write, create, move or delete files in `~/.grok`, also when they reach a file there through a link. They can still write `~/.grok/worktrees`, `~/.grok/workspaces`, the session's commands folder under `~/.grok/sessions` and the memory notes, where the profile lets Grok write them; in the terminal UI, also the session's plan file. This holds on Linux and macOS, in the terminal UI and in the agent backend (Grok Desktop, `grok agent`). When `~/.grok` sits in your home folder, the rest of the home folder stays writable as the profile allows. So `/create-skill` can't save a skill in the User scope (`~/.grok/skills`); save it in the Project scope instead.
- **Shell commands and hooks:** on Linux, under `workspace`, `read-only` and custom profiles that extend them, the programs Grok starts for you can write only `~/.grok/worktrees`, `~/.grok/workspaces` and the `commands` folder kept under `~/.grok/sessions` for the folder Grok was started in, plus the profile's other write paths. Those programs are shell commands, background tasks, terminals, MCP servers, language servers, hooks, notification hooks, the status line command and `.envrc` files. So a status line or notification script that keeps a cache in `~/.grok` must keep it elsewhere, for example in `~/.cache`. This holds in the terminal UI and in the agent backend. A plugin's hooks can also write the plugin's data folder, `~/.grok/plugin-data/<id>`, except where a link in `~/.grok` leads into it. In the terminal UI, so can the plugin's MCP servers; in the agent backend they can't yet. A custom profile is judged as its definition was when Grok started, so a later edit to `sandbox.toml` doesn't change this until the next start. Under `strict`, the profile itself keeps them to `~/.grok/sessions` there.

Limits:

- **macOS:** shell commands and hooks can still write all of `~/.grok`. Seatbelt does not let a process that is already sandboxed apply a narrower sandbox to its children, and the daemon runs inside the session's profile.

### Worktrees

A git worktree needs write access to `~/.grok` and to the folder Grok started in, and read access to your git config. `workspace`, `devbox` (unless `~/.grok` is in or links into `/data`) and custom profiles that extend `workspace` allow that, unless the custom profile sets `workspace_write = false`. Under `strict`, `read-only`, `minimal` and custom profiles that extend them, worktrees are unavailable (a profile that extends `read-only` and sets `workspace_write = true` can still make them):

- `grok -w`, interactive or with `-p`, exits with an error that names the profile before the session starts. `grok worktree create` refuses the same way.
- `grok -w -r <id>` and `grok -w -c` exit the same way. When the session's saved profile was restored, the error says to resume without `-w` instead, since a resumed session keeps the profile it was saved with.
- `/fork` and `/new` don't offer a worktree. With `fork_worktree_mode` or `new_session_worktree_mode` set to `"always"`, they open in the current folder and say so in the session.
- Asking for a worktree refuses with the same error and leaves nothing behind: `/fork --worktree`, Ctrl+W or the New worktree row on the home screen, New Session in Worktree in the command palette, Ctrl+W in the session picker, and the dashboard's worktree toggle. The dashboard's location picker hides its worktree toggle.
- A subagent or workflow step that asks for worktree isolation runs in the session's folder instead.

Outside a git repository the "not a git repository" error comes first. The refusal follows the profile, also on a platform that can't enforce it. To use worktrees, switch to a profile that can make them where the current one is set: `--sandbox`, `GROK_SANDBOX`, `[sandbox] profile`, or a managed requirement.

### Updates

Under any profile but `off`, Grok never starts an update on its own. It still checks for a newer version and tells you about it. Only `grok update`, which you type, installs one.

- The welcome screen says to run `grok update` to get the latest version, and doesn't offer Ctrl+U. Minimal mode prints the same notice in the session.
- Leaders such as `grok agent leader` skip their hourly update. A leader still relaunches onto a build another process installed, such as one from `grok update`.
- Grok may still re-point `~/.grok/bin/agent` or copy a switched build. Both use a build that's already installed.
- `grok agent` and `grok agent stdio` print a notice on stderr at startup, such as:

```text
A new version of Grok Build is available: <current> -> <latest> [<channel>]
Run `grok update` to get the latest version.
```

`grok update` itself starts without a profile that `GROK_SANDBOX`, `--sandbox` or config sets, unless something already confines the process. When the profile does apply, `strict`, and custom profiles based on it, can't write the new build under `~/.grok`, and the update fails.

### Direct global write protection

Under `workspace`, `read-only`, `strict`, and `minimal` (and custom profiles that extend those bases), the kernel **write-denies** the Grok-owned direct disk paths used as user-global hook sources, plus its configuration and trust files (they stay readable when granted). Built-in `strict` can read `~/.grok` (they stay readable); writes are CWD + `~/.grok/sessions` + temp, plus `~/.grok/daemon/run/strict` when the daemon backend runs the session, not the whole tree. Write-deny still applies where the profile grants write:

- `~/.grok/hooks/` (hook directory)
- `~/.grok/hooks-paths` (registry file; not loaded as hook JSON — only its absolute targets are)
- Absolute targets listed in `hooks-paths` (relative lines are ignored; missing targets refuse sandbox start)
- `~/.grok/config.toml`, `~/.grok/trusted_folders.toml`, `~/.grok/managed_config.toml`, `~/.grok/requirements.toml`, `~/.grok/sandbox.toml` (settings, folder trust, managed policy, requirements, and sandbox profiles)
- `~/.grok/bundled/` and `~/.grok/bundles/` (built-in bundle caches; anything placed there loads as a built-in skill, agent, or workflow)

Because these files are read-only under these profiles, a change that would be saved to them applies to the current session only. Accepting a folder-trust prompt, switching the model with `/model`, and changing the permission mode (`/auto-review` or Shift+Tab) take effect for the session but are not saved. To save folder trust, run `grok --trust` in the directory before starting the sandbox. To change the default model or permission mode, edit `~/.grok/config.toml` directly.

`grok update` replaces Grok's install and saves the update channel to `~/.grok/config.toml`. It starts without these profiles when they come from `GROK_SANDBOX`, `--sandbox` or config. It applies the profile when a requirement sets it. It also applies the profile when something already confines the process, such as a command the agent runs or a container started with `no-new-privileges`. Under the profile it can't save the channel. In such a container, `grok --sandbox off update` works unless a requirement sets the profile.

The bundle caches are read-only too, so Grok can't download or update built-in skills while one of these profiles is active; it keeps using the copy already installed. A Grok home that has only ever run under these profiles has no downloaded built-in skills. Start Grok once with `--sandbox off` to install or update them. On first launch under these profiles, Grok creates empty `bundled/` and `bundles/` directories when they are missing. A symlinked `bundled/` or `bundles/` is refused at sandbox start (prevents retargeting).

On first launch under these profiles, Grok creates a real empty `hooks/` directory and empty `hooks-paths` file when they are missing (never symlinks or wrong types). Claude/Cursor global settings are **not** covered by this write-deny unless a project hook config links to them (see below); discovery of those vendors remains separately gated by compatibility settings.

A symlinked `$GROK_HOME` or a `hooks-paths` entry with a symlink component is refused at sandbox start (prevents retargeting). Existing parent directories of protected paths are pinned so they cannot be renamed out from under the deny (siblings remain writable). On Linux, nested user namespaces are disabled inside bubblewrap so mount binds cannot be rearranged. Project hooks remain gated by folder trust. The workspace daemon's per-command sandbox, on by default in Grok Desktop, keeps a command from writing the `.claude`, `.grok` or `.cursor` folders project hooks load from. That covers the workspace's own and those of each folder above it up to the repository root that git finds. Outside a repository only the workspace's own are protected. Package folders below the workspace are not yet protected, including a worktree subagent's copies of them. These profiles write-deny only the config files in those folders (see below), so a command they sandbox can still add, move and change other files there. The `devbox` profile does not apply this protection (disposable VMs). Profiles that require it refuse to start if the kernel policy cannot be applied (including Linux without verified read-only mounts).

Under these profiles, each project hook config that exists at sandbox start is also write-denied at the file it resolves to, with links followed. Those configs are `.claude/settings.json`, `.claude/settings.local.json`, `.cursor/hooks.json` and the hook files in `.grok/hooks/`, in the folders project hooks load from. For example, a `.claude/settings.json` linked to `~/dotfiles/claude.json` makes `~/dotfiles/claude.json` read-only for the session. Inside `$GROK_HOME` a target stays held only where the global write-deny above holds it, or in a folder below it that project hooks load from. So a session in one of Grok's worktrees keeps its configs read-only. Sandbox start is refused for any other target there, such as `$GROK_HOME/auth.json`, since holding it would keep Grok from saving its own state. It is also refused when a target has other hard links, or when a config file resolves to anything but a regular file (`/dev/null` included). The error names the config. The link itself stays replaceable: a config repointed during the session loads at the next discovery, like a config created during the session. On Linux only folders outside the workspace and its parent folders are pinned for these files (`~/dotfiles` in the example). Files still move and hard-link between the workspace's folders and the rest of your home folder. A rename or hard link into or out of a pinned folder fails, though (`mv` falls back to copying). On Linux a workspace folder holding a config or its target can still be renamed and replaced, unless the daemon's per-command sandbox protects it. That is the same gap as a config created during the session. On Linux a grok started by a command in the CLI's bubblewrap sandbox can't add mounts of its own. It starts where that sandbox already keeps its project hook configs from being written. Otherwise it refuses with an error that names the config and says to start grok outside the sandbox. Grok's own relaunches inside that sandbox check the same way, such as a screen-mode switch (`GROK_SCREEN_MODE_SWITCH=exec`) or a background `grok update`. Each refuses a config added or relinked during the session when the sandbox leaves it writable, since a command could have written it. A background update then exits without a message.

---

## Custom Profiles

Create custom sandbox profiles in `~/.grok/sandbox.toml` (global) or `.grok/sandbox.toml` (per-project):

```toml
[profiles.project]
# Start from a built-in profile, then add overrides
extends = "workspace"
restrict_network = true

# Paths the agent can read but NOT write/delete
read_only = ["/data"]

# Additional writable paths
read_write = ["/tmp/scratch"]

# Keep the agent from writing the current working directory (omit to keep what the base does)
workspace_write = false

# Paths or globs to kernel-deny (read + write/rename, enforced; see notes below)
# `~/…` is your home; other relative entries are anchored at the workspace
deny = ["/data/shared-secrets", "~/.ssh", "**/.env", "**/*.pem"]
```

Use the custom profile:

```bash
grok --sandbox project
```

A custom profile can't reuse a built-in name. `--sandbox devbox` always runs the built-in `devbox` profile, shadowing any `[profiles.devbox]` you define. `--sandbox minimal` refuses to start while `~/.grok/sandbox.toml` defines a `[profiles.minimal]`.

If the user and project files define the same custom profile differently, Grok uses the user profile and shows a startup warning. Run `/doctor` to see both file locations and how to resolve the conflict. Identical definitions do not produce a warning.

### Custom Profile Fields

| Field              | Type     | Description                                          |
| ------------------ | -------- | ---------------------------------------------------- |
| `extends`          | String   | Base built-in profile to inherit from (`workspace`, `devbox`, `read-only`, `strict`, `minimal`). Defaults to `workspace` when omitted |
| `restrict_network` | Boolean  | Block network access for child processes             |
| `read_only`        | String[] | Additional read-only paths                           |
| `read_write`       | String[] | Additional read-write paths                          |
| `deny`             | String[] | Paths or globs to kernel-deny (read + write/rename; see notes). An entry with `*`, `?`, or `[` is a glob |
| `workspace_write`  | Boolean  | Whether the agent can write the current working directory: `false` removes the base profile's grant, `true` adds one. Omit it to keep what the base does |

> **Note on `workspace_write = false`:** The kernel cannot take a directory out of
> a grant on one of its parents. If the current working directory is inside
> another directory the profile writes, Grok **refuses to start** rather than
> leave it writable. That is the case for a project under `/tmp` with a base
> that writes the temp directories, and for almost any directory under `devbox`.

> **Note on `read_only` / `read_write`:** These are **literal directory grants**,
> not globs. A trailing `/**` (or `/*`) is treated as the parent directory, so
> `…/cache/**` grants `…/cache` (and a bare `/**` grants `/`). Any entry that
> still contains `*`, `?`, or `[` after that (e.g. `/home/**/cache`, or a
> directory literally named `dir[1]`) is skipped with a warning — list the
> concrete directories you need, or put globs under `deny`. Entries with
> leading or trailing whitespace are also skipped with a warning: whitespace
> is significant in literal paths, so fix the entry rather than relying on
> trimming.

> **Note on `deny`:** A non-empty `deny` list is **kernel-enforced**. Denied paths
> are **read-denied and write/rename-denied** via Seatbelt on macOS and a bwrap
> bind-over on Linux, so a denied path can neither be read (via `bash`, `grep`, or
> subagents) nor relocated out of the deny set and read elsewhere (the
> `mv secret x && cat x` bypass is closed). On **Linux**, read-deny requires
> `bubblewrap`: if it is missing (or any single deny path can't be bound), Grok
> refuses to start rather than run with denied paths exposed (`devbox`, which only
> write-denies `/data`, still falls back to Landlock). Writes to paths **not** in
> `deny` are controlled by what you grant in `read_write`.

> **Where a `deny` entry points:** An absolute entry is taken as given. An entry
> starting with `~/`, and a bare `~`, is anchored at your home directory, so
> `deny = ["~/.ssh"]` protects the real `~/.ssh`. Every other relative entry is
> anchored at the workspace. `~user` is **not** expanded — it is an ordinary
> relative entry naming a `~user` directory in the workspace, so write the path
> in full for another user's home. On a host with no home directory, or whose
> home path contains `*`, `?` or `[` or is not valid UTF-8, a `~` entry makes
> Grok **refuse to start** rather than silently protect the wrong path; deny a
> parent directory without those characters instead. The per-command policy
> also anchors `~/…` at your home.
> `read_only` and `read_write` do not expand `~`; name those directories in full.
> Deny the directories you mean rather than the home itself: a bare `~` also
> covers `~/.grok`, which is Grok's own configuration and session state.

> **Globs in `deny`:** An entry is a **glob** if it contains `*`, `?`, or `[`.
> Those characters **always** mean glob — to deny a literal file whose name
> contains them, name a parent directory instead. The supported, gitignore-style
> subset is:
>
> - `*` — any run of characters within one path segment (stops at `/`)
> - `?` — exactly one character within a segment
> - `**` — spans directories (as a whole path segment, e.g. `**/`, `a/**`); `**/`
>   also matches zero directories, so `**/.env` matches `.env` and `sub/.env`
> - `[abc]` / `[a-z]` — character classes; a leading `!` **or** `^` negates
>   (`[!a]` and `[^a]` both mean "not `a`")
>
> Brace alternation (`{a,b}`), backslash-escapes, empty path segments (a
> doubled `//` or a trailing `/`), `.` or `..` segments, and the unusual class
> forms `[]…]` (literal `]` first) and POSIX `[[:…:]]` are **not** supported,
> so the two platforms
> can never interpret a glob differently. A glob using an unsupported
> metacharacter, or one that is malformed, makes Grok **refuse to start** (fail
> closed) on **both** platforms — write `*.pem` and `*.key` as separate entries
> rather than `*.{pem,key}`.
>
> Relative globs are anchored at the workspace; absolute globs (e.g.
> `/home/**/.ssh`) at their literal prefix. Non-glob entries keep exact-path
> matching. A relative glob matches **only inside the workspace**. To deny
> files elsewhere, write the entry as an absolute path. Enforcement otherwise
> differs by platform:
>
> - **macOS is airtight:** each glob becomes a Seatbelt regex applied at runtime,
>   so matching files are denied **even if created after Grok starts**.
> - **Linux is best-effort:** a mount namespace can't glob at runtime, so each
>   glob is expanded to the files that **exist at launch** and those are bound
>   over. Files created **later** that match a glob are **not** covered — name
>   exact paths for anything that must be airtight on Linux. A matched symlink
>   is masked together with its resolved target. A glob that matches too many
>   files, or whose tree is too deep or broad to scan, makes Grok **refuse to
>   start** rather than under-enforce; the error names the globs and the
>   directory where the scan stopped. The launch scan starts at each glob's
>   literal prefix and includes gitignored and hidden files, so on very large
>   workspaces prefer anchored globs (`certs/**/*.pem` scans only `certs/`)
>   over bare `**` patterns.

---

## How It Works

The sandbox is applied to the **entire grok process** at startup using kernel primitives -- not per-command wrapping. This means all tool operations are covered:

- `read_file`, `search_replace`, `list_dir` -- restricted by Landlock/Seatbelt in-process
- `bash` commands, `grep` (rg) -- child processes inherit FS restrictions automatically
- Network -- on Linux, child processes can be blocked via seccomp; on macOS this is a no-op

When a non-`off` sandbox profile is **requested** (CLI, `GROK_SANDBOX`, config, or a managed requirement):

- The agent runs **in-process**, not through the shared leader, so tool calls stay in this process when the profile is enforced. If leader mode would otherwise have been on, a one-line note at startup says so
- If a built-in profile fails to apply, Grok warns and continues without enforcement (see [Platform Support](#platform-support)), but still refuses the leader so tools are not delegated elsewhere
- `grok workspace start`, `restart`, and `resume` are unavailable; `pause`, `stop`, and `status` still work

Disable the profile at the source that selected it to use the refused commands.

The sandbox is **irreversible** once applied. The agent cannot relax restrictions at runtime.

---

## Resuming Sessions

The profile a session was started with is saved with the session and is **fixed
for the life of the session**. When you resume it (`grok --resume <id>`,
`grok --continue`, or `grok -r`), Grok restores that same profile automatically —
so a session started with `--sandbox workspace` won't silently come back under a
stricter default and break commands that previously worked.

Resuming will **not** change a session's sandbox:

- Omitting `--sandbox` on resume uses the session's saved profile.
- Passing `--sandbox <profile>` that **matches** the saved profile is allowed.
- Passing `--sandbox <profile>` that **differs** from the saved profile is
  **refused with an error** — changing a resumed session's sandbox is a safety
  footgun (it could widen access the session was meant to be confined to, or
  break a session that relied on broader access). Start a new session to use a
  different profile.
- If Grok cannot restore the saved profile on its own, the resume is refused and
  the error names the `--sandbox` profile to pass.
- A profile pinned in `requirements.toml` outranks the saved one, so under a pin
  every session resumes with the pinned profile.

Profile resolution order for a **new** session:

1. An explicit `--sandbox <profile>` flag or `GROK_SANDBOX` environment variable
2. The `[sandbox] profile` in your config
3. `off` (no sandbox)

---

## Platform Support

| Platform | Mechanism | Minimum Version        |
| -------- | --------- | ---------------------- |
| Linux    | Landlock  | Kernel 5.13 or later   |
| macOS    | Seatbelt  | macOS (all versions)   |

If the sandbox cannot be applied (e.g., unsupported kernel, missing entitlements), Grok logs a warning and continues without enforcement. The exception is an explicitly-requested **custom profile**: on **both macOS and Linux**, if it cannot be applied (unknown profile, malformed `sandbox.toml`, or — on Linux — `bubblewrap` unavailable for a non-empty `deny`), Grok refuses to start rather than run with its denied paths exposed.

### File metadata on Linux

Landlock controls file content, creation, deletion and renames, but not file metadata. Under every profile, a command can still change the mode bits (`chmod`), timestamps (`touch`) and extended attributes (`setfattr`) of a file outside the write paths that it owns or can write under normal Unix permissions, even though writing to that file's content is refused. Changing a file's owner follows the usual Unix rules. Folders Grok mounts read-only, such as the hook folders above, and the `deny` paths of a custom profile, which Grok covers with a read-only mount, are not affected. On macOS, Seatbelt refuses these changes outside the write paths.

Landlock restricts truncation only from kernel 6.2 (Landlock ABI v3). On kernels 5.13 to 6.1, such as Ubuntu 22.04 and Debian 12, a command can also empty or shorten a file outside the write paths with `truncate` if it can write that file under normal Unix permissions.

`"enforced": true` in `sandbox-events.jsonl` means the profile's kernel rules were applied. On Linux it does not mean file metadata outside the write paths is protected, and on kernels before 6.2 it does not mean those files are protected from truncation. On macOS, `"inherited": true` beside it means the process started inside the sandbox of a process that applied the same profile from the same folder, so it applied none of its own.

---

## Network Restrictions

On Linux, profiles with `restrict_network` block network access in **child processes** (bash commands, scripts) via seccomp. On macOS, network blocking is a no-op. Built-in tools that make HTTP requests in-process (web search, LLM API calls) are never affected -- the agent needs network access to function.

In practice, on Linux this means:

- `web_search`, `web_fetch`, and the LLM API always have network access
- `bash` commands like `curl`, `wget`, and `npm install` are blocked when `restrict_network` is enabled
- An [HTTP hook](10-hooks.md#http-hooks) still sends over `https://`
- Grok refuses the plain `http://` URL of a hook outside managed policy

---

## Shell Environment Policy

The sandbox controls which files and network a subprocess can reach. The top-level `[shell_environment_policy]` table controls which environment variables it inherits, so a tool command the model runs cannot read a secret that happens to sit in your shell environment.

```toml
[shell_environment_policy]
inherit = "core"                 # all (default) | core | none
ignore_default_excludes = false  # also drop *KEY* / *SECRET* / *TOKEN* and git's settings
exclude = ["ACME_*", "CI_*"]     # drop these names
include_only = ["PATH", "HOME"]  # if set, keep only these names
set = { MY_FLAG = "1" }          # force these values
```

Grok builds the child environment in order: it starts from `inherit` (`all` keeps everything, `core` keeps a small platform set such as `PATH` and `HOME`, `none` starts empty); drops the built-in secret patterns `*KEY*`, `*SECRET*`, and `*TOKEN*`, together with git's settings from the environment (`GIT_CONFIG_COUNT`, `GIT_CONFIG_KEY_*`, `GIT_CONFIG_VALUE_*`, and `GIT_CONFIG_PARAMETERS`, so git never sees a count without its keys), unless `ignore_default_excludes = true`; drops any `exclude` matches; applies `set`; and, when `include_only` is non-empty, keeps only the matching names. Patterns are case-insensitive globs (`*`, `?`).

The default (`inherit = "all"`, `ignore_default_excludes = true`) leaves the environment untouched, so nothing changes until you configure a policy. A table with a value that does not parse, such as `inherit = "most"`, stops Grok at startup with the parse error. On the non-persistent backend the policy also filters variables captured from your login shell, so an `.rc` file export cannot slip a secret past `exclude` or `include_only`. The persistent shell is one exception: it applies the policy to its base environment, but variables that an `.rc` file exports during login are replayed from a snapshot and are not re-filtered, so keep secrets out of shell startup files there. Enforcement covers the bash tool and terminals on macOS, Linux, and Windows.

On Linux, `[features] proc_protection` (off by default, sandbox or not) also keeps a command from reading a withheld variable back out of Grok's own `/proc/<pid>/environ`. Turn it on with `proc_protection = true` or `GROK_PROC_PROTECTION=1`; while it is off, a command running as your user can read Grok's environment there. Stdio MCP servers, hooks, notification hooks, the status-line command, and the external editor and pager start with Grok's whole environment either way, so a command can read it from theirs while they run. Hooks, notification hooks and the status-line command get it without Grok's own credentials, so a variable that `[shell_environment_policy]` withholds can still be read from theirs, but those credentials can't. See [Configuration](05-configuration.md).

---

## Event Logging

Sandbox events are logged to `~/.grok/sessions` for debugging. Events include:

- Profile applied (which profile, timestamp)
- Violations (attempted access to denied paths)

---

## When to Use Sandbox Mode

**Use `workspace` when:**

- Working on your own projects and you want basic write protection
- Running in shared environments where you want to limit the scope of changes

**Define a custom profile with a `deny` list when:**

- You need to block specific files (e.g. `.env` or credential paths) on top of a base profile
- You need kernel enforcement that covers `bash`, `grep`, and subagents — not just the `read_file` tool

**Use `read-only` when:**

- Reviewing code you do not trust
- Exploring a codebase without risk of accidental modification
- Running code analysis or audits

**Use `strict` when:**

- Analyzing untrusted or third-party code
- Running in security-sensitive environments
- You want maximum isolation

**Extend `minimal` when:**

- You want to list every path the agent may read or write yourself
- The agent should read the working directory without being able to change it

**Skip sandbox when:**

- The agent needs to install dependencies (`npm install`, `pip install`)
- The agent needs to modify files outside the working directory
- You are working in a trusted environment and want maximum flexibility

---

## Trade-offs

| Aspect      | Without Sandbox            | With Sandbox                    |
| ----------- | -------------------------- | ------------------------------- |
| Safety      | Agent has full system access | Agent restricted to profile rules |
| Capability  | Can do anything            | Limited by profile              |
| Performance | No overhead                | Negligible overhead             |
| Recovery    | Must trust the agent       | Kernel enforces boundaries      |

The sandbox enforces limits at the OS level -- through Landlock or a mount namespace on Linux, and Seatbelt on macOS -- not a separate VM.
