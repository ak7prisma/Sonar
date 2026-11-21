# Installed Agent Skills & Runtime Plugin Verification

## Verified Project Skills (`.agents/skills/`)

Installed via `npx --yes skills add <repo> ... -y -a antigravity`:

1. `frontend-design` — `.agents/skills/frontend-design/SKILL.md` (from `https://github.com/anthropics/skills`)
2. `web-design-guidelines` — `.agents/skills/web-design-guidelines/SKILL.md` (from `https://github.com/vercel-labs/agent-skills`)
3. `vercel-react-best-practices` — `.agents/skills/vercel-react-best-practices/SKILL.md` (from `https://github.com/vercel-labs/agent-skills`; note the upstream repository name is `vercel-react-best-practices`, replacing the shorthand `react-best-practices`)
4. `21st-dev` skill suite — installed from `https://github.com/21st-dev/skill`:
   - `.agents/skills/21st-ai`
   - `.agents/skills/21st-cli-use`
   - `.agents/skills/21st-design-sync`
   - `.agents/skills/21st-registry`
   - `.agents/skills/21st-ui-build`
   - `.agents/skills/21st-ui-explore`
   - `.agents/skills/21st-ui-review`
5. `accessibility-engineering` — `.agents/skills/accessibility-engineering/SKILL.md` (from `https://github.com/addyosmani/agent-skills`)
6. `frontend-accessibility-best-practices` — `.agents/skills/frontend-accessibility-best-practices/SKILL.md` (from `https://github.com/sergiodxa/agent-skills`)

## `agy plugin install` Status

Command attempted using the detected Antigravity binary (`$env:USERPROFILE\.gemini\bin\agy.exe`):

```powershell
agy.exe plugin install https://github.com/addyosmani/agent-skills.git
```

**Observed Output:** `agy.exe` cloned the repository and failed with exit code `1`:
`Error: failed to copy plugin: installing the plugin to C:\Users\franc\.gemini\config\plugins\agent-skills: rename C:/Users/franc/.gemini/config/plugins/.install-2085804980/plugin C:/Users/franc/.gemini/config/plugins/agent-skills: Access is denied.`

Because `accessibility-engineering` from `https://github.com/addyosmani/agent-skills` is already installed directly inside `.agents/skills/accessibility-engineering`, the project skill instructions remain active for this workspace while the global plugin copy was blocked by Windows filesystem directory-rename permissions.
