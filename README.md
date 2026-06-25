# Shortdrama Stepwise Agent

A Codex skill for generating Chinese short-drama projects through a step-by-step workflow:

```text
script -> episodes -> characters -> assets -> storyboard
```

Install by cloning this repository into your Codex skills directory:

```powershell
mkdir "$env:USERPROFILE\.codex\skills" -Force
git clone https://github.com/kikka1777-afk/shortdrama-stepwise-agent "$env:USERPROFILE\.codex\skills\shortdrama-stepwise-agent"
```

Then restart Codex or open a new thread and invoke:

```text
Use $shortdrama-stepwise-agent to generate a short-drama project step by step.
```
