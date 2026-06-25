# Shortdrama Stepwise Agent

A Codex skill for generating Chinese short-drama projects through a step-by-step workflow:

```text
script -> episodes -> characters -> assets -> storyboard
```

Before generation, the skill asks for missing project parameters such as tags, episode count, target script length, episode durations, hook length, series style, target platform, and aspect ratio.

Install by cloning this repository into your Codex skills directory:

```powershell
mkdir "$env:USERPROFILE\.codex\skills" -Force
git clone https://github.com/kikka1777-afk/shortdrama-stepwise-agent "$env:USERPROFILE\.codex\skills\shortdrama-stepwise-agent"
```

Then restart Codex or open a new thread and invoke:

```text
Use $shortdrama-stepwise-agent to generate a short-drama project step by step.
```

If you have not provided the setup parameters, the skill will ask for them first:

```text
题材标签、集数、最终剧本字数、单集时长、结尾钩子、剧集风格、平台、画幅
```

Example one-line setup:

```text
都市、逆袭；6集；1200字；首集150秒其余90秒；钩子8秒；Urban Revenge；快手9:16
```
