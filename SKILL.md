---
name: shortdrama-stepwise-agent
description: Generate Chinese short-drama projects inside Codex through a guided multi-agent workflow. Use when the user wants a Codex skill for step-by-step short drama creation, paged interaction, script to episode script to character bible to asset list to storyboard generation, revision of a completed step, or structured short-drama studio output without touching Vercel, GitHub, or web deployment.
---

# Shortdrama Stepwise Agent

Use this skill to run a paged short-drama studio workflow inside Codex.

Boundary: do not deploy, redeploy, edit Vercel settings, sync keys, or push GitHub changes unless the user separately asks for deployment work. This skill is for generating and revising content in Codex.

## Workflow

Run these pages in order:

1. `script`: turn raw material into a 700-1100 character Chinese short-drama story.
2. `episodes`: split the story into structured episode scripts.
3. `characters`: extract character bible, motives, conflict, appearance, voice, and image prompts.
4. `assets`: extract visual asset groups and image prompts before storyboard work.
5. `storyboard`: split episodes into shootable key shots while referencing the asset list.

After each page:

- Tell the user what was completed.
- Include a compact markdown table summary.
- Offer fixed next actions: continue next step, revise current step, rerun current step, or show raw JSON.
- If an API call fails, do not invent a fake result. Report the failure and keep the prior step state unchanged.

## Script

Use `scripts/shortdrama_stepwise_agent.mjs` for deterministic prompt generation, JSON repair, and summaries.

Common commands:

```powershell
node C:\Users\Administrator\.codex\skills\shortdrama-stepwise-agent\scripts\shortdrama_stepwise_agent.mjs list
node C:\Users\Administrator\.codex\skills\shortdrama-stepwise-agent\scripts\shortdrama_stepwise_agent.mjs prompt script --input .\material.txt --tags 都市,逆袭,情感
node C:\Users\Administrator\.codex\skills\shortdrama-stepwise-agent\scripts\shortdrama_stepwise_agent.mjs summarize episodes --input .\episodes.json
node C:\Users\Administrator\.codex\skills\shortdrama-stepwise-agent\scripts\shortdrama_stepwise_agent.mjs repair --input .\maybe-truncated.json
```

The script does not call any model and does not touch network services. It builds prompts and validates/summarizes outputs so Codex can use the current conversation model or any explicitly provided model path.

## Interaction Pattern

Use this response shape after every completed step:

```markdown
**已完成：分集剧本**
本步已拆出 4 集，每集包含标题、时长、角色、概要和结尾钩子。

| 集数 | 标题 | 钩子 |
|---|---|---|
| EP1 | ... | ... |

下一步我可以继续做「角色设定」，也可以按你的修改建议重跑当前页。
```

For revisions, keep the same output schema for that step. Tell the model:

```text
按用户修改建议修订已有内容。只返回同一结构的完整结果，不要解释。
```

## Output Schemas

See `references/schemas.md` only when you need exact JSON schemas or prompt details beyond the script output.
