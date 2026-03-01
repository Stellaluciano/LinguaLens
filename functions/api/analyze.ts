interface Env {
  OPENAI_API_KEY: string;
}

type PagesContext<E> = { request: Request; env: E };
type PagesFunction<E = unknown> = (context: PagesContext<E>) => Response | Promise<Response>;

type Pos = 'noun' | 'verb' | 'adj' | 'adv' | 'prep' | 'pron' | 'det' | 'conj' | 'num' | 'other';

interface AnalyzeRequest {
  text?: string;
  sourceLang?: string;
  targetLang?: string;
}

interface AnalyzeResponse {
  translation: string;
  words: Array<{
    word: string;
    pos: Pos;
    translation: string;
    lemma: string;
    notes?: string;
  }>;
  grammar: {
    tense: string;
    structure: string;
    subject: string;
    verb: string;
    object: string;
    explanation: string;
  };
}

const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

const SYSTEM_PROMPT = `You are a language analysis engine. Return STRICT JSON ONLY, no markdown, no code fences.
The response must match exactly this schema:
{
  "translation": "string",
  "words": [
    {
      "word": "string",
      "pos": "noun|verb|adj|adv|prep|pron|det|conj|num|other",
      "translation": "string",
      "lemma": "string",
      "notes": "string optional"
    }
  ],
  "grammar": {
    "tense": "string",
    "structure": "string",
    "subject": "string",
    "verb": "string",
    "object": "string",
    "explanation": "string"
  }
}
Never include any additional keys.`;

const POS_SET = new Set<Pos>(['noun', 'verb', 'adj', 'adv', 'prep', 'pron', 'det', 'conj', 'num', 'other']);

const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30;
const WINDOW_MS = 60_000;

const getIp = (request: Request): string => request.headers.get('CF-Connecting-IP') ?? 'unknown';

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const existing = rateMap.get(ip);

  if (!existing || existing.resetAt < now) {
    rateMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (existing.count >= RATE_LIMIT) {
    return false;
  }

  existing.count += 1;
  return true;
};

const parseJsonStrict = (input: string): unknown => {
  const trimmed = input.trim();
  return JSON.parse(trimmed);
};

const isAnalyzeResponse = (value: unknown): value is AnalyzeResponse => {
  if (!value || typeof value !== 'object') return false;

  const payload = value as AnalyzeResponse;
  if (typeof payload.translation !== 'string') return false;
  if (!Array.isArray(payload.words)) return false;
  if (!payload.grammar || typeof payload.grammar !== 'object') return false;

  const grammarOk =
    typeof payload.grammar.tense === 'string' &&
    typeof payload.grammar.structure === 'string' &&
    typeof payload.grammar.subject === 'string' &&
    typeof payload.grammar.verb === 'string' &&
    typeof payload.grammar.object === 'string' &&
    typeof payload.grammar.explanation === 'string';

  if (!grammarOk) return false;

  return payload.words.every((word) => {
    const notesOk = typeof word.notes === 'undefined' || typeof word.notes === 'string';
    return (
      typeof word.word === 'string' &&
      typeof word.translation === 'string' &&
      typeof word.lemma === 'string' &&
      POS_SET.has(word.pos) &&
      notesOk
    );
  });
};

const createError = (status: number, message: string) =>
  new Response(JSON.stringify({ error: message }), {
    status,
    headers: jsonHeaders
  });

const callOpenAI = async (apiKey: string, userPrompt: string): Promise<string> => {
  const result = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ]
    })
  });

  if (!result.ok) {
    throw new Error('OpenAI request failed.');
  }

  const data = (await result.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return data.choices?.[0]?.message?.content ?? '';
};

export const onRequestOptions: PagesFunction = async () => new Response(null, { status: 204, headers: jsonHeaders });

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const ip = getIp(context.request);

  if (!checkRateLimit(ip)) {
    return createError(429, 'Rate limit exceeded. Please wait and retry.');
  }

  if (!context.env.OPENAI_API_KEY) {
    return createError(500, 'OPENAI_API_KEY is missing.');
  }

  let body: AnalyzeRequest;
  try {
    body = (await context.request.json()) as AnalyzeRequest;
  } catch {
    return createError(400, 'Invalid JSON body.');
  }

  const text = (body.text ?? '').trim();
  const sourceLang = (body.sourceLang ?? 'auto').trim();
  const targetLang = (body.targetLang ?? 'zh').trim();

  if (text.length < 2) {
    return createError(400, 'Text selection is too short.');
  }

  const userPrompt = `Analyze this sentence.\nsourceLang=${sourceLang}\ntargetLang=${targetLang}\ntext=${text}`;

  try {
    const firstPass = await callOpenAI(context.env.OPENAI_API_KEY, userPrompt);

    let parsed: unknown;
    try {
      parsed = parseJsonStrict(firstPass);
    } catch {
      const repairPrompt = `Convert the following into valid JSON matching the required schema. Output JSON only.\n\n${firstPass}`;
      const repaired = await callOpenAI(context.env.OPENAI_API_KEY, repairPrompt);
      parsed = parseJsonStrict(repaired);
    }

    if (!isAnalyzeResponse(parsed)) {
      return createError(500, 'Model output schema validation failed.');
    }

    return new Response(JSON.stringify(parsed), { status: 200, headers: jsonHeaders });
  } catch {
    return createError(500, 'Failed to analyze text. Please try again.');
  }
};
