#!/usr/bin/env node
import fs from 'node:fs';

const STYLE_MAP = {
  'Studio Realistic': 'realistic vertical Chinese short-drama style, commercial drama lighting, natural skin texture',
  'Cinematic Romance': 'cinematic romance lighting, polished production design, expressive close ups',
  'Urban Revenge': 'modern urban revenge drama, sharp contrast, luxury interiors, tense blocking',
  'Youth Bright': 'clean youth drama, daylight color, lively handheld camera, warm faces'
};

const STEPS = [
  { id: 'script', title: '剧本' },
  { id: 'episodes', title: '分集剧本' },
  { id: 'characters', title: '角色设定' },
  { id: 'assets', title: '素材清单' },
  { id: 'storyboard', title: '分镜剧本' }
];

const PARAMS = [
  { id: 'raw_material', label: '原始素材', example: '小说片段、故事梗概、人物关系或短剧创意' },
  { id: 'tags', label: '题材标签', example: '都市、逆袭、情感' },
  { id: 'total_episodes', label: '集数', example: '4' },
  { id: 'target_script_chars', label: '最终剧本字数', example: '900' },
  { id: 'first_episode_duration', label: '第 1 集时长', example: '120 秒' },
  { id: 'episode_duration', label: '其余单集时长', example: '75 秒' },
  { id: 'hook_seconds', label: '结尾钩子时长', example: '5 秒' },
  { id: 'series_style', label: '剧集风格', example: 'Studio Realistic / Cinematic Romance / Urban Revenge / Youth Bright' },
  { id: 'platform', label: '目标平台', example: '抖音 / TikTok' },
  { id: 'aspect_ratio', label: '画幅', example: '9:16' },
  { id: 'language', label: '语言', example: '中文' }
];

function readArg(name, fallback = '') {
  const index = process.argv.indexOf(`--${name}`);
  if (index >= 0 && process.argv[index + 1]) return process.argv[index + 1];
  return fallback;
}

function readInput() {
  const file = readArg('input');
  if (file) return fs.readFileSync(file, 'utf8');
  return fs.readFileSync(0, 'utf8');
}

function compact(value, length = 5200) {
  return String(value || '').slice(0, length);
}

function styleFrag(style) {
  return STYLE_MAP[style] || STYLE_MAP['Studio Realistic'];
}

function optionValue(options, key, fallback) {
  return options[key] || fallback;
}

function prompts(options = {}) {
  const total = Math.min(Number(options.total) || 4, 10);
  const style = options.style || 'Studio Realistic';
  const scriptChars = Number(options.scriptChars || options['script-chars']) || 900;
  const language = optionValue(options, 'language', '中文');
  const ratio = optionValue(options, 'ratio', '9:16');
  return {
    script: `# Role: 短剧剧本 Agent
把用户素材重构成可拍摄短剧故事正文。${language}输出，目标长度约 ${scriptChars} 字，允许上下浮动 10%。强化开场冲突、人物欲望、反转、爽点和结尾钩子。不要分集，不要解释。`,
    episodes: `# Role: 分集剧本 Agent
把剧本拆成结构化分集剧本。最多输出 ${total} 集。严格返回 JSON，不要代码块，不要解释。
JSON 格式：{"total_episodes":4,"episodes":[{"ep_number":1,"title":"","duration_seconds":120,"characters":[""],"hook":"","outline":""}]}`,
    characters: `# Role: 角色设定 Agent
根据剧本和分集剧本提炼主要角色，最多 8 人。中文字段，image_prompt 用英文，并以 "${styleFrag(style)} --ar ${ratio}" 结尾。严格返回 JSON，不要代码块，不要解释。
JSON 格式：{"characters":[{"name":"","role":"","desire":"","conflict":"","appearance":"","voice":"","image_prompt":""}]}`,
    assets: `# Role: 美术资产 Agent
根据剧本、分集和角色设定，先提取真正需要统一设计或单独出图的视觉资产。包含角色、场景、道具、封面/标题卡等。每项 image_prompt 用英文，并以 "${styleFrag(style)} --ar ${ratio}" 结尾。严格返回 JSON，不要代码块，不要解释。
JSON 格式：{"groups":[{"category":"角色造型","items":[{"name":"","tag":"","note":"","appears_in_episodes":[1],"image_prompt":""}]}]}`,
    storyboard: `# Role: 分镜剧本 Agent
把分集剧本拆成可拍摄关键分镜，并严格参考素材清单保持角色、场景、道具和视觉风格一致。每集输出 3-5 个镜头。中文 visual，英文 visual_prompt，并以 "${styleFrag(style)} --ar ${ratio}" 结尾。严格返回 JSON，不要代码块，不要解释。
JSON 格式：{"episodes":[{"ep_number":1,"shots":[{"shot_number":1,"duration_seconds":8,"shot_size":"近景","camera":"手持推进","location":"","visual":"","audio_or_caption":"","purpose":"","visual_prompt":""}]}]}`
  };
}

function userPrompt(step, source, options = {}) {
  const tags = options.tags || '都市、逆袭、情感';
  if (step === 'script') {
    return `【题材标签】${tags}
【目标平台】${options.platform || '抖音 / TikTok'}
【剧集风格】${options.style || 'Studio Realistic'}
【目标剧本字数】${options.scriptChars || options['script-chars'] || 900}
【画幅】${options.ratio || '9:16'}
【语言】${options.language || '中文'}
【原始素材】
${compact(source)}`;
  }
  if (step === 'episodes') {
    return `【目标集数】${options.total || 4}
【第1集秒数】${options.ep1 || 120}
【其余每集秒数】${options.dur || 75}
【结尾钩子秒数】${options.hook || 5}
【剧集风格】${options.style || 'Studio Realistic'}
【目标平台】${options.platform || '抖音 / TikTok'}
【剧本】
${compact(source)}`;
  }
  return `【题材标签】${tags}
【目标集数】${options.total || 4}
【剧集风格】${options.style || 'Studio Realistic'}
【目标平台】${options.platform || '抖音 / TikTok'}
【画幅】${options.ratio || '9:16'}
【语言】${options.language || '中文'}
【上游内容】
${compact(source, 8000)}`;
}

function questionsMarkdown() {
  return `开始前我需要先定几个参数：

| 参数 | 你可以这样填 |
| --- | --- |
${PARAMS.map((param) => `| ${param.label} | ${param.example} |`).join('\n')}

你可以直接回一行：\`都市、逆袭；4集；900字；首集120秒其余75秒；钩子5秒；Urban Revenge；抖音9:16\``;
}

function configTemplate() {
  return JSON.stringify({
    raw_material: '',
    tags: ['都市', '逆袭', '情感'],
    total_episodes: 4,
    target_script_chars: 900,
    first_episode_duration: 120,
    episode_duration: 75,
    hook_seconds: 5,
    series_style: 'Studio Realistic',
    platform: '抖音 / TikTok',
    aspect_ratio: '9:16',
    language: '中文'
  }, null, 2);
}

function stripFence(text) {
  return String(text || '').trim().replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
}

function repairJson(text) {
  let t = stripFence(text);
  const first = Math.min(...['{', '['].map((ch) => {
    const index = t.indexOf(ch);
    return index < 0 ? Infinity : index;
  }));
  if (Number.isFinite(first)) t = t.slice(first);
  const last = Math.max(t.lastIndexOf('}'), t.lastIndexOf(']'));
  if (last > 0) {
    try { return JSON.stringify(JSON.parse(t.slice(0, last + 1)), null, 2); } catch {}
  }

  let out = '';
  const stack = [];
  let inString = false;
  let escaped = false;
  for (const ch of t) {
    out += ch;
    if (inString) {
      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === '{' || ch === '[') stack.push(ch);
    else if (ch === '}' || ch === ']') {
      const need = ch === '}' ? '{' : '[';
      if (stack[stack.length - 1] === need) stack.pop();
    }
  }
  if (inString) out += '"';
  out = out.replace(/,\s*$/, '');
  while (stack.length) out += stack.pop() === '{' ? '}' : ']';
  return JSON.stringify(JSON.parse(out), null, 2);
}

function parseOutput(step, text) {
  if (step === 'script') return String(text || '').trim();
  return JSON.parse(repairJson(text));
}

function table(headers, rows) {
  const head = `| ${headers.join(' | ')} |`;
  const sep = `| ${headers.map(() => '---').join(' | ')} |`;
  return [head, sep, ...rows.map((row) => `| ${row.map((v) => String(v ?? '').replace(/\n/g, ' ')).join(' | ')} |`)].join('\n');
}

function summarize(step, value) {
  const data = step === 'script' ? String(value || '') : (typeof value === 'string' ? JSON.parse(repairJson(value)) : value);
  if (step === 'script') {
    return `**已完成：剧本**
故事正文已生成，可以继续拆成分集剧本。

${table(['项目', '结果'], [['字数', data.length], ['开场', data.slice(0, 56)], ['下一步', '分集剧本']])}`;
  }
  if (step === 'episodes') {
    const eps = data.episodes || [];
    return `**已完成：分集剧本**
共 ${eps.length} 集，已包含标题、时长、角色、概要和结尾钩子。

${table(['集数', '标题', '钩子'], eps.slice(0, 6).map((e) => [`EP${e.ep_number}`, e.title || '', e.hook || '']))}`;
  }
  if (step === 'characters') {
    const chars = data.characters || [];
    return `**已完成：角色设定**
整理出 ${chars.length} 个核心角色，包含动机、冲突、造型和表演方向。

${table(['角色', '定位', '冲突'], chars.slice(0, 8).map((c) => [c.name || '', c.role || '', c.conflict || '']))}`;
  }
  if (step === 'storyboard') {
    const eps = data.episodes || [];
    return `**已完成：分镜剧本**
覆盖 ${eps.length} 集，共 ${eps.reduce((sum, e) => sum + ((e.shots || []).length), 0)} 个关键镜头。

${table(['集数', '镜头数', '首镜头'], eps.slice(0, 6).map((e) => [`EP${e.ep_number}`, (e.shots || []).length, (e.shots || [])[0]?.visual || '']))}`;
  }
  const groups = data.groups || [];
  return `**已完成：素材清单**
整理出 ${groups.length} 个资产组，每项包含用途和 image prompt。

${table(['资产组', '数量', '示例'], groups.map((g) => [g.category || '', (g.items || []).length, (g.items || []).slice(0, 2).map((i) => i.name).join('、')]))}`;
}

function printHelp() {
  console.log(`Usage:
  list
  questions
  config
  prompt <step> [--input file] [--tags 都市,逆袭] [--total 4] [--script-chars 900] [--ep1 120] [--dur 75] [--hook 5] [--style "Studio Realistic"] [--platform "抖音 / TikTok"] [--ratio 9:16] [--language 中文]
  summarize <step> [--input file]
  repair [--input file]`);
}

const command = process.argv[2];
if (!command || command === 'help') {
  printHelp();
} else if (command === 'list') {
  console.log(JSON.stringify(STEPS, null, 2));
} else if (command === 'questions') {
  console.log(questionsMarkdown());
} else if (command === 'config') {
  console.log(configTemplate());
} else if (command === 'prompt') {
  const step = process.argv[3];
  if (!STEPS.some((item) => item.id === step)) throw new Error(`Unknown step: ${step}`);
  const source = readInput();
  const options = {
    tags: readArg('tags', '都市、逆袭、情感').replace(/,/g, '、'),
    total: readArg('total', '4'),
    scriptChars: readArg('script-chars', '900'),
    ep1: readArg('ep1', '120'),
    dur: readArg('dur', '75'),
    hook: readArg('hook', '5'),
    style: readArg('style', 'Studio Realistic'),
    platform: readArg('platform', '抖音 / TikTok'),
    ratio: readArg('ratio', '9:16'),
    language: readArg('language', '中文')
  };
  const p = prompts(options);
  console.log(JSON.stringify({ step, system: p[step], user: userPrompt(step, source, options), wantJSON: step !== 'script' }, null, 2));
} else if (command === 'summarize') {
  const step = process.argv[3];
  if (!STEPS.some((item) => item.id === step)) throw new Error(`Unknown step: ${step}`);
  console.log(summarize(step, parseOutput(step, readInput())));
} else if (command === 'repair') {
  console.log(repairJson(readInput()));
} else {
  throw new Error(`Unknown command: ${command}`);
}
