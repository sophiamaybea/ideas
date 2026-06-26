---
name: skill-builder
description: Creates new skills from a name, description, and instructions. Writes the SKILL.md, pushes it to the sophiamaybea/ideas GitHub repo, and confirms installation. Use when the user wants to create, add, or save a new skill.
argument-hint: "<skill-name> | <description> | <full instructions>"
---

## What this skill does

Given a skill name, a short description, and the full instructions/content, this skill will:

1. Create the skill directory and SKILL.md in `.agents/skills/<skill-name>/`
2. Push it to the `sophiamaybea/ideas` GitHub repo under `skills/<skill-name>/SKILL.md`
3. Confirm success with the local path and GitHub URL

## How to invoke

When the user says things like:
- "Create a skill that does X"
- "Save this as a skill"
- "Add a skill for Y"
- "Make a new skill called Z"

Gather three things (infer from context where possible, only ask if truly missing):
1. **Skill name** — kebab-case, e.g. `market-research`, `email-summariser`
2. **One-line description** — what triggers this skill, what it does
3. **Full skill content** — the instructions, frameworks, rules, output formats

Then follow the BUILD SEQUENCE below.

## BUILD SEQUENCE

### Step 1: Write the SKILL.md locally

Write to `.agents/skills/<skill-name>/SKILL.md` using the format:

```
---
name: <skill-name>
description: <one-line description>
---

<full skill content>
```

### Step 2: Push to GitHub via Git Tree API

Use this Python pattern (requires $GITHUB_ACCESS_TOKEN):

```python
import os, base64, urllib.request, json, pathlib

token = os.environ["GITHUB_ACCESS_TOKEN"]
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json",
    "Accept": "application/vnd.github+json"
}

def gh(method, path, body=None):
    url = f"https://api.github.com/repos/sophiamaybea/ideas{path}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

# Get current HEAD
ref = gh("GET", "/git/ref/heads/main")
head_sha = ref["object"]["sha"]
commit = gh("GET", f"/git/commits/{head_sha}")
base_tree_sha = commit["tree"]["sha"]

# Read the new skill file
skill_path = pathlib.Path(".agents/skills/<skill-name>/SKILL.md")
content = skill_path.read_text(errors="replace")

# Create new tree
tree = [{"path": "skills/<skill-name>/SKILL.md", "mode": "100644", "type": "blob", "content": content}]
new_tree = gh("POST", "/git/trees", {"base_tree": base_tree_sha, "tree": tree})

# Commit and update ref
new_commit = gh("POST", "/git/commits", {
    "message": "Add skill: <skill-name>",
    "tree": new_tree["sha"],
    "parents": [head_sha]
})
gh("PATCH", "/git/refs/heads/main", {"sha": new_commit["sha"]})
```

### Step 3: Confirm to the user

Report:
- ✅ Skill name
- 📁 Local path: `.agents/skills/<skill-name>/SKILL.md`
- 🐙 GitHub: `https://github.com/sophiamaybea/ideas/tree/main/skills/<skill-name>`

## RULES

- Always push to GitHub. The repo is the source of truth.
- Skill names must be kebab-case, lowercase, no spaces.
- If the user pastes a full skill spec (like a long document), use it as-is for the content — don't summarise it.
- If the user gives only a vague idea, ask one clarifying question: "What should this skill actually do — what are the steps or rules it should follow?"
- Never create a skill with empty or placeholder content. The SKILL.md must be complete and immediately usable.
