// LLM 提供商类型
export type LLMProvider = 'openai' | 'claude' | 'qwen' | 'zhipu';

// LLM 配置
export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  model?: string;
  baseUrl?: string;
}

// 解析结果类型
export interface ParsedInterview {
  company_name: string | null;
  round_name: string | null;
  start_time: string | null;
  end_time: string | null;
  meeting_link: string | null;
  confidence: number;
}

const LLM_CONFIG_KEY = 'offermatrix_llm_config';

// 默认模型配置
const DEFAULT_MODELS: Record<LLMProvider, string> = {
  openai: 'gpt-4o-mini',
  claude: 'claude-3-haiku-20240307',
  qwen: 'qwen-turbo',
  zhipu: 'glm-4-flash',
};

// 默认 API 地址
const DEFAULT_BASE_URLS: Record<LLMProvider, string> = {
  openai: 'https://api.openai.com/v1',
  claude: 'https://api.anthropic.com',
  qwen: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  zhipu: 'https://open.bigmodel.cn/api/paas/v4',
};

// 获取 LLM 配置
export function getLLMConfig(): LLMConfig | null {
  const stored = localStorage.getItem(LLM_CONFIG_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

// 保存 LLM 配置
export function saveLLMConfig(config: LLMConfig): void {
  localStorage.setItem(LLM_CONFIG_KEY, JSON.stringify(config));
}

// 清除 LLM 配置
export function clearLLMConfig(): void {
  localStorage.removeItem(LLM_CONFIG_KEY);
}

// 构建解析 Prompt
function buildPrompt(text: string): string {
  return `你是一个面试信息提取助手。请从以下文本中提取面试相关信息。

## 提取要求
1. company_name: 公司名称（如：字节跳动、腾讯、阿里巴巴等）
2. round_name: 面试轮次（如：AI面、HR面、技术一面、业务二面、终面等）
3. start_time: 开始时间（ISO 8601 格式，如 2024-02-08T14:00:00）
4. end_time: 结束时间（ISO 8601 格式）
5. meeting_link: 会议链接（Zoom、腾讯会议、飞书等）

## 输出格式
仅输出 JSON，不要其他内容：
{
  "company_name": "字节跳动",
  "round_name": "技术一面",
  "start_time": "2024-02-08T14:00:00",
  "end_time": "2024-02-08T15:00:00",
  "meeting_link": "https://...",
  "confidence": 0.9
}

如果某字段无法提取，设为 null。confidence 表示整体置信度 (0-1)。
如果没有明确的结束时间，可以根据开始时间推算（通常面试持续 30-60 分钟）。

## 用户输入
${text}`;
}

// 调用 OpenAI 兼容 API
async function callOpenAICompatible(
  config: LLMConfig,
  prompt: string,
  maxTokens?: number
): Promise<string> {
  const baseUrl = config.baseUrl || DEFAULT_BASE_URLS[config.provider];
  const model = config.model || DEFAULT_MODELS[config.provider];

  const body: Record<string, unknown> = {
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.1,
  };
  if (maxTokens) {
    body.max_tokens = maxTokens;
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API 调用失败: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// 调用 Claude API
async function callClaude(config: LLMConfig, prompt: string, maxTokens: number = 1024): Promise<string> {
  const baseUrl = config.baseUrl || DEFAULT_BASE_URLS.claude;
  const model = config.model || DEFAULT_MODELS.claude;

  const response = await fetch(`${baseUrl}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API 调用失败: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

// 解析面试文本
export async function parseInterviewText(
  text: string
): Promise<ParsedInterview> {
  const config = getLLMConfig();
  if (!config) {
    throw new Error('请先配置 LLM');
  }

  const prompt = buildPrompt(text);
  let responseText: string;

  if (config.provider === 'claude') {
    responseText = await callClaude(config, prompt);
  } else {
    responseText = await callOpenAICompatible(config, prompt);
  }

  // 提取 JSON
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('无法解析 AI 返回的结果');
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      company_name: parsed.company_name || null,
      round_name: parsed.round_name || null,
      start_time: parsed.start_time || null,
      end_time: parsed.end_time || null,
      meeting_link: parsed.meeting_link || null,
      confidence: parsed.confidence || 0,
    };
  } catch {
    throw new Error('解析 JSON 失败');
  }
}

// 测试 LLM 连接
export async function testLLMConnection(config: LLMConfig): Promise<boolean> {
  const testPrompt = '请回复"OK"';

  try {
    let response: string;
    if (config.provider === 'claude') {
      response = await callClaude(config, testPrompt);
    } else {
      response = await callOpenAICompatible(config, testPrompt);
    }
    return response.length > 0;
  } catch {
    return false;
  }
}

// 构建 JD 分析 Prompt
function buildJDAnalysisPrompt(
  jdText: string,
  companyName: string,
  jobTitle: string,
  salary: string
): string {
  return `你是一位资深的职业顾问和行业分析师。我已经拿到了这家公司的 Offer，请帮我分析这个职位，辅助我做 Offer 决策。

## 公司信息
- 公司名称：${companyName}
- 职位名称：${jobTitle}
- 薪资待遇：${salary || '未提供'}

## 职位描述（JD）
${jdText}

## 分析要求
请结合 JD 内容以及你对该公司和行业的了解，从以下几个维度进行分析。请用 Markdown 格式输出：

### 核心职责
提炼 3-5 条该职位的核心工作职责，用简洁的语言概括。

### 技术栈与技能要求
列出该职位涉及的关键技术栈和能力要求。

### 岗位优势
分析这个 Offer 的吸引力，包括但不限于：
- 技术成长空间和发展前景
- 业务前景和团队优势
- 公司平台和行业地位

### 潜在顾虑
客观分析可能的缺点或风险，包括但不限于：
- 加班文化、工作强度
- 技术天花板
- 业务稳定性

### 薪资与市场分析
结合提供的薪资信息（${salary || '未提供'}）和你对 ${companyName} 该岗位市场行情的了解，分析薪资竞争力。

请直接输出 Markdown 内容，不要包裹在代码块中。`;
}

// 分析 JD
export async function analyzeJD(
  jdText: string,
  companyName: string,
  jobTitle: string,
  salary: string
): Promise<string> {
  const config = getLLMConfig();
  if (!config) {
    throw new Error('请先配置 LLM');
  }

  const prompt = buildJDAnalysisPrompt(jdText, companyName, jobTitle, salary);
  let responseText: string;

  if (config.provider === 'claude') {
    responseText = await callClaude(config, prompt, 4096);
  } else {
    responseText = await callOpenAICompatible(config, prompt, 4096);
  }

  return responseText;
}
