# Skills

Skills are reusable prompt packages that extend Grok with task-specific instructions. They let you capture a repeatable procedure once, instead of re-explaining it each session. Startup discovery skips project skills and commands in untrusted folders.

---

## What Are Skills?

A skill is a directory that contains a `SKILL.md` file. Its markdown body tells Grok how to handle a specific type of task: step-by-step instructions, conventions, and tool-usage patterns.

Use a skill for a repeatable procedure that's too specific for AGENTS.md but too long to retype. Grok activates a skill only when it applies to your current task.

---

## Skill Locations

Grok looks in four config directories, `.grok/`, `.agents/`, `.claude/`, and `.cursor/`, at each of these levels, in priority order:

| Level | Directories | Scope |
|-------|-------------|-------|
| Your working directory | `./.grok/`, `./.agents/`, `./.claude/`, `./.cursor/` | Local (highest) |
| Each parent directory up to the repo root, root included | `<dir>/.grok/`, `<dir>/.agents/`, `<dir>/.claude/`, `<dir>/.cursor/` | Repo |
| Your home directory | `~/.grok/` (`$GROK_HOME`), `~/.agents/`, `~/.claude/`, `~/.cursor/` | User |

Outside a git repo, Grok reads only your working directory and your home directory.

In every one of these directories Grok reads two subdirectories:

- `skills/`: each folder with a `SKILL.md`, including nested folders.
- `commands/`: each `*.md` file directly inside it (subfolders are not searched). Each file becomes a slash command named after the file (or after a valid `name` in its frontmatter), matching Claude's legacy custom-command layout. This includes Cursor's own custom commands in `~/.cursor/commands/` and `./.cursor/commands/`.

After these, Grok adds skills from `[skills] paths`: an entry inside the repo ranks just after the parent directories and ahead of your home directory; any other entry ranks after your home directory. Then come skills synced from the skill store in managed workspaces (`server` in `grok inspect`), then the bundled skills, then enabled plugins (see [Bundled and Plugin Skills](#bundled-and-plugin-skills)).

Grok deduplicates skills by name -- a higher-priority location overrides a lower one. Within one directory, a `skills/` entry wins over a `commands/` file of the same name.

Skill and command discovery does **not** use `.gitignore`. Paths under known skill roots (`.grok/`, `.agents/`, `.claude/`, `.cursor/`) always load when present on disk — teams often ignore `.claude/**` as local-only config while still expecting `/frontend`-style project commands to work. To hide a skill, use `[skills] ignore` in config (not repo ignore rules).

Grok scans the Claude and Cursor directories by default. To stop scanning a vendor's `skills/` and `commands/`, set its `skills` cell to `false` under `[compat.cursor]` or `[compat.claude]` in `~/.grok/config.toml`, or set the `GROK_CURSOR_SKILLS_ENABLED` or `GROK_CLAUDE_SKILLS_ENABLED` environment variable to `false`. See [Configuration](05-configuration.md#harness-compatibility) for details. Grok always filters out known vendor-shipped default skills (such as Cursor's `shell`, `canvas`, and `statusline`), regardless of these settings.

### Additional Skill Directories

Add directories, exclude paths, or disable individual skills via `[skills]` in `~/.grok/config.toml`:

```toml
[skills]
paths = ["~/my-team-skills"]          # Additional directories to scan
ignore = ["~/my-team-skills/wip"]     # Paths to exclude (hidden entirely)
disabled = ["wip-skill"]              # Skill names to keep listed but inactive
```

Each entry in `paths` is a `SKILL.md` file or a directory that Grok walks recursively. `ignore` hides a skill completely; `disabled` keeps it in the list but excludes it from the system prompt and from invocation. Turning a skill off in `/skills` during a session tells the model, on its next request, that the skill is no longer available; the daemon route doesn't send this notice yet. `paths` and `ignore` take filesystem paths and support `~` expansion; `disabled` takes skill names. When a skill's `SKILL.md` is a symlink, `ignore` matches the folder that holds the link, not the link's target, so ignoring one of two folders that link to the same `SKILL.md` still lists the skill from the other.

`[paths] extra_skill_dirs` is written by `/import-claude`. It does not inject skills. Put extra directories in `[skills] paths`.

---

## Creating a Skill

### Directory Structure

Each skill lives in its own directory with a `SKILL.md` file:

```
~/.grok/skills/
  commit/
    SKILL.md
  review-pr/
    SKILL.md
  deploy/
    SKILL.md
```

### SKILL.md Format

A skill file has YAML frontmatter followed by markdown instructions:

```markdown
---
name: commit
description: Create well-formatted git commits following conventional commit standards. Use when the user wants to commit changes or asks for /commit.
---

# Git Commit Skill

Review staged changes and create a commit with a clear, conventional message.

## Steps

1. Run `git diff --staged` to see changes
2. Summarize what changed and why
3. Create commit message following conventional commits format
4. Run `git commit -m "..."` with the message
```

### Core Frontmatter Fields

| Field | Description |
|-------|-------------|
| `name` | Skill identifier. Use lowercase letters, digits, and hyphens, up to 64 characters. Grok normalizes spaces and underscores to hyphens. If you omit `name`, Grok uses the skill's directory name. |
| `description` | What the skill does and when to use it. Grok reads this to decide whether to invoke the skill. If you omit it, Grok uses the first paragraph of the body. |

Write a specific `description`. It determines when Grok invokes the skill automatically. Name the trigger phrases and use cases.

### Optional Frontmatter Fields

Multi-word frontmatter keys use kebab-case (single-word keys like `model` are written as-is).

| Field | Description |
|-------|-------------|
| `when-to-use` | Trigger phrases for automatic invocation, kept separate from `description`. |
| `allowed-tools` | Tools the skill uses, as a YAML list or a comma- or space-separated string. |
| `argument-hint` | Hint text shown after the skill's name in the slash menu, and as ghost text once you pick it (for example, `commit message`). |
| `user-invocable` | Whether you can run the skill as a slash command. Defaults to `true`; set `false` to hide it from slash commands. (To stop the model from invoking a skill, set `disable-model-invocation` instead.) |
| `disable-model-invocation` | When `true`, only your slash command runs the skill -- the model cannot invoke it automatically. Defaults to `false`. |
| `model` | Model override for running the skill. |
| `effort` | Reasoning-effort override. |
| `license` | License identifier (for example, `Apache-2.0`). |
| `compatibility` | Environment requirements (for example, `Requires git, docker, jq`). |
| `metadata` | Arbitrary string key-value pairs. Grok promotes `metadata.author` and `metadata.short-description` for display. |

---

## Creating Skills with /create-skill

The `/create-skill` command walks you through building a new skill interactively. Grok asks what you want, drafts the files, and writes them to disk.

### How It Works

When you run `/create-skill`, Grok:

1. **Gathers requirements.** Grok asks for the skill name, the scope to save it under, and a description of the workflow you want to capture. Use a name with lowercase letters, digits, and hyphens (2–64 characters, starting and ending with a letter or digit).

2. **Drafts the description.** Grok writes a `description` that states what the skill does, the phrases that trigger it, and the slash command name. You approve or edit the draft before continuing.

3. **Creates the skill directory.** Grok creates the `<scope>/.grok/skills/<name>/` directory, plus `scripts/` or `references/` subdirectories when the skill needs them.

4. **Writes SKILL.md.** Grok writes the frontmatter (`name` and `description`) and a markdown body of instructions, along with any supporting files.

5. **Verifies and confirms.** Grok reads the file back, confirms it wrote correctly, and tells you how to run the skill.

### Choosing a Scope

Grok asks where to save the skill:

- **Project** (`<repo_root>/.grok/skills/<name>/`) -- available only in this repository and shareable with teammates through version control. Grok recommends this scope inside a git repository.
- **User** (`~/.grok/skills/<name>/`) -- available across all your projects. Under the `workspace`, `read-only` and `strict` sandbox profiles, Grok can't write there, so save the skill in the Project scope (see [Sandbox](18-sandbox.md#groks-own-files-under-the-sandbox-profiles)).

To distribute a skill to a whole team or organization, package it in a plugin and publish it through a marketplace. See [Create your own marketplace](09-plugins.md#create-your-own-marketplace) and [Distribute across an organization](09-plugins.md#distribute-across-an-organization).

The new skill appears in the slash menu within a few seconds, because Grok reloads skills when files change on disk.

---

## Using Skills

### Run a Skill by Name

Each skill is a slash command named after the skill. Run one by typing its name:

```
/commit              # Runs the "commit" skill
/review-pr           # Runs the "review-pr" skill
```

Running a skill loads its instructions into the conversation and directs the model to follow them. To pass arguments, type them after the name:

```
/commit fix the build
```

Grok doesn't run shell commands written inline in a skill or command body. A `` !`git status` `` in the body runs nothing and reaches the model as literal text. To use a command's output, add a step that tells Grok to run the command, so it goes through the usual permission check.

To browse your skills, type `/` to open the slash-command menu. Grok lists every built-in command and skill and filters them as you type. To list skills from the command line instead, run `grok inspect` (see [Viewing Skill Details](#viewing-skill-details)).

### Arguments and Variables

When you run a skill as a slash command on the shell route, interactively or in headless mode, Grok fills these placeholders in its body before the model sees it:

| Placeholder | Replaced with |
|-------------|---------------|
| `$ARGUMENTS` or `${ARGUMENTS}` | Everything typed after the skill name, up to the next skill named in the same prompt (`fix the build`). |
| `$ARGUMENTS[N]` or `${ARGUMENTS[N]}` | Word `N` of the arguments, counting from 0 (`$ARGUMENTS[1]` is `the`). |
| `$N` | Shorthand for `$ARGUMENTS[N]` (`$0` is `fix`). |
| `${SKILL_DIR}` or `${CLAUDE_SKILL_DIR}` | The directory that holds the skill's `SKILL.md`. |
| `${SESSION_ID}` or `${CLAUDE_SESSION_ID}` | The current session's ID. |
| `${GROK_PLUGIN_ROOT}`, `${CLAUDE_PLUGIN_ROOT}` or `${CURSOR_PLUGIN_ROOT}` | For a plugin skill, the plugin's installed directory. |
| `${GROK_PLUGIN_DATA}` or `${CLAUDE_PLUGIN_DATA}` | For a plugin skill with a data directory, that directory. |

- Arguments are split into words on whitespace. Quotes don't group words.
- A word past the end of the arguments is replaced with nothing, so with the arguments above `$5` becomes empty.
- A `$` followed by a number more than 20 past the last argument stays as written, so a price such as `$100` is left alone. `$ARGUMENTS[100]` is still read as word 100, so it becomes empty.
- A bare `$` or braced `${ARGUMENTS[...]}` index with a leading zero, such as `$01` or `${ARGUMENTS[01]}`, stays as written. A bare `$ARGUMENTS` followed by brackets that don't hold an index, such as `$ARGUMENTS[01]` or `$ARGUMENTS[x]`, is the whole argument string followed by the bracket text.
- `${N}` stays as written, so a script in the body can use the shell's `${1}`. A bare `$1` in a script is still replaced.
- If the body has no argument placeholder, Grok appends the arguments after the body as `**ARGUMENTS:** fix the build`. The path, session and plugin variables don't count as argument placeholders.
- An argument placeholder typed as an argument, such as `$1`, is inserted as written and not replaced again. A path, session or plugin variable typed as an argument, such as `${SKILL_DIR}`, is still filled when an argument placeholder inserts it.
- Any other `${NAME}` stays as written.
- When the model loads a skill with its skill tool, it reads the body with no placeholders filled.
- On the daemon route the daemon fills the placeholders itself. `$ARGUMENTS` and `$N` work there; the other forms in this list aren't guaranteed.

### Qualified Names

When a skill's name collides with another skill or a built-in command, Grok keeps **both** invocable. The built-in keeps the bare name (`/login`, `/compact`, …). The skill is advertised under a qualified name prefixed by its scope -- `local:`, `repo:`, `user:`, `bundled:`, or the plugin name:

```
/local:commit        # The "commit" skill from ./.grok/skills/
/user:commit         # The "commit" skill from ~/.grok/skills/
/bundled:imagine     # The bundled "imagine" skill (built-in /imagine is unchanged)
/acme:login          # A plugin skill named "login" (built-in /login is unchanged)
```

Typing `/login` in the slash menu shows both rows, with a right-aligned **built-in** or **skill** badge so you can tell them apart. Rename the skill (or its directory) if you want the bare `/name` for the skill instead.

`grok inspect` tags colliding skills with `[collides with /login → /acme:login]`.

### Automatic Invocation

Grok can invoke a skill on its own when it recognizes a relevant task. Grok matches your prompt against the skill's `description` and `when-to-use` fields, so write both to describe the triggering situation.

For example, if a skill's description says "Use when the user wants to commit changes," then saying "commit my changes" can trigger that skill automatically. To require an explicit slash command and prevent automatic invocation, set `disable-model-invocation: true` in the frontmatter.

---

## Viewing Skill Details

Run `grok inspect` to see every skill Grok discovers, along with the rest of your configuration:

```bash
grok inspect          # Human-readable summary
grok inspect --json   # Machine-readable report
```

In the human-readable output, the Skills section lists each skill's name and its source -- `project`, `user`, `bundled`, `config` (a `[skills].paths` entry), `server` (skills synced from the skill store in managed workspaces), or `plugin: <name>`. Grok tags any skill disabled via `[skills].disabled` or from a disabled vendor surface with `[disabled]`.

The report honors your `[skills]` config the same way a live session does: skills from `paths` are listed, skills under an `ignore` prefix are hidden, and skills named in `disabled` stay listed but tagged `[disabled]`.

The `--json` report includes the full detail for each skill: its `name`, `description`, `source` (with the path to the SKILL.md file), and `userInvocable` flag. Skills whose bare slash name is contested — by a built-in command or by another skill — also include `collidesWith` (the contested name) and `invocableAs` (the qualified command to type).

---

## Bundled and Plugin Skills

Grok distributes platform skills separately from your personal skills. Bundled skills are cached under `~/.grok/bundled/skills/`; Grok never writes them into `~/.grok/skills/`. A same-named local, repo, or user skill overrides the bundled copy. `grok inspect` labels each definition by its actual source. (A plugin skill of the same name does not override a native skill; it stays available under its qualified `plugin:name` form.)

Skills can also come from plugins. When you install a plugin that includes skills, they appear alongside your user and project skills. `grok inspect` labels each plugin-provided skill with its source as `plugin: <name>`.

This includes plugins you installed for Claude. Grok reads `~/.claude/plugins/`, the plugins recorded in `~/.claude/plugins/installed_plugins.json`, and the installed plugins of each marketplace in `~/.claude/plugins/known_marketplaces.json`. Grok follows `enabledPlugins` in `~/.claude/settings.json`: `true` enables a plugin in Grok and `false` disables it (a `false` under any of the plugin's `name@marketplace` keys wins), unless its name is already in your `[plugins] enabled` or `[plugins] disabled` list. A full plugin ID in those lists doesn't count, so a Claude `false` still turns that plugin off. Once you confirm `/import-claude` (or it finds nothing to import) or dismiss the Claude import row, Grok stops reading `enabledPlugins`, so list each Claude plugin you still want under `[plugins] enabled`.

Grok also finds project plugins in each `.claude/plugins/` from your working directory up to the repo root, and in the marketplaces a project's `.claude/settings.json` lists under `extraKnownMarketplaces`; like other project plugins, these need folder trust and stay off until you enable them. Enabling goes by plugin name. A project plugin replaces your user-level plugin of the same name whether or not the folder is trusted: in a trusted folder it is on at once if you enabled that name, and in an untrusted folder neither plugin is on. The `[compat.claude] skills` cell does not stop any of these plugins; disable one by name under `[plugins] disabled`.

See the [Plugins guide](09-plugins.md) for more on installing plugins that provide skills.

`~/.claude/CLAUDE.md` and the other instruction files in [Project Rules](12-project-rules.md) are not skills and never appear in the slash menu.

---

## Best Practices

1. **Write specific descriptions.** The description drives automatic invocation. "Create git commits" is too vague; "Create well-formatted git commits following conventional commit standards. Use when the user wants to commit changes or asks for /commit." works better.

2. **Include concrete steps.** Skills work best when they give Grok a clear, ordered procedure to follow.

3. **Reference tools by name.** When a skill relies on specific tools (such as `run_terminal_cmd` or `search_replace`), name them so the model knows what to use.

4. **Keep skills focused.** Write one skill per workflow. A "deploy" skill and a "rollback" skill work better than a single "deploy-and-rollback" skill.

5. **Version-control project skills.** Commit `.grok/skills/` to your repository so the whole team benefits. User skills in `~/.grok/skills/` stay personal and unshared.

6. **Test by running it.** Invoke `/name` and confirm the skill works before you rely on automatic invocation.

7. **Keep the body under the file-read cap.** When you run a skill, or the model invokes one, Grok inlines at most 100,000 bytes of its body, the same 25,000-token cap as `read_file` (Grok counts 4 bytes as one token). A longer body is cut at the last full line that fits, with a short note telling the model to read the rest of the file. Text with multi-byte characters reaches the limit in fewer characters. Put long reference material in sibling files and tell Grok to read them with a line offset and limit.
