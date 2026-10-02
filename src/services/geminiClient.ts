import { AIResponseData, EmotionType } from '../firebase';

export interface RequestCheerParams {
  emotion: EmotionType;
  content: string;
  date?: string;
  title?: string;
}

function cleanErrorMessage(rawMsg: string): string {
  if (!rawMsg) return 'AI 응원 메시지를 생성하는 중 문제가 발생했습니다.';
  
  if (
    rawMsg.includes('503') || 
    rawMsg.includes('high demand') || 
    rawMsg.includes('UNAVAILABLE') ||
    rawMsg.includes('Resource has been exhausted') ||
    rawMsg.includes('429')
  ) {
    return '현재 AI 비서에 일시적으로 많은 요청이 몰려 있습니다. 아래 [다시 시도하기] 버튼을 눌러주시면 즉시 다시 연결해 드릴게요.';
  }

  // If it's a stringified JSON error
  try {
    const parsed = JSON.parse(rawMsg);
    if (parsed.error && parsed.error.message) {
      return cleanErrorMessage(parsed.error.message);
    }
  } catch {
    // not JSON
  }

  return rawMsg;
}

export async function requestAICheer(params: RequestCheerParams): Promise<AIResponseData> {
  // 1. Try server endpoints (/api/gemini/cheer or /api/cheer for Vercel)
  const endpoints = ['/api/gemini/cheer', '/api/cheer'];
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          return data.data as AIResponseData;
        }
      } else {
        const errData = await res.json().catch(() => null);
        if (errData && errData.error) {
          throw new Error(cleanErrorMessage(errData.error));
        }
      }
    } catch (err: any) {
      if (err.message && (err.message.includes('GEMINI_API_KEY') || !err.message.includes('fetch'))) {
        throw new Error(cleanErrorMessage(err.message));
      }
      console.warn(`Endpoint ${endpoint} failed, trying next option...`, err);
    }
  }

  // 2. Direct client fallback for static Vercel / Vite deployments if VITE_GEMINI_API_KEY is present
  const clientApiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (clientApiKey && clientApiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
    return callGeminiDirectRest(params, clientApiKey);
  }

  throw new Error(
    'GEMINI_API_KEY가 설정되지 않았습니다. Vercel 대시보드 [Settings] > [Environment Variables]에 GEMINI_API_KEY를 등록해주세요.'
  );
}

// Client-side direct REST fallback for static hosting
async function callGeminiDirectRest(params: RequestCheerParams, apiKey: string): Promise<AIResponseData> {
  const prompt = `당신은 사용자의 하루 일기를 읽고 마음을 따스하게 보듬어주는 '다정한 AI 비서이자 인생의 포근한 다이어리 친구'입니다.
한국어로 부드럽고 다정한 존댓말을 사용하여 깊은 공감과 위로를 건네주세요.

[사용자 정보]
- 날짜: ${params.date || '오늘'}
- 감정: ${params.emotion}
- 제목: ${params.title || '오늘의 하루'}

[사용자가 작성한 일기 내용]:
"""
${params.content}
"""

반드시 아래 JSON 형식으로만 응답해주세요:
{
  "comfortLetter": "사용자의 구체적인 일기 내용을 언급하며 깊이 공감하고 안아주는 다정한 위로 편지",
  "tomorrowAction": "내일을 위한 실천하기 쉬운 작은 긍정적인 행동 1가지 (소소한 힐링 미션)",
  "comfortQuote": "마음에 힘이 되는 따뜻한 한 줄 명언이나 응원 문구",
  "warmTip": "오늘 밤 편안한 휴식을 돕는 따뜻한 차나 힐링 팁"
}`;

  const candidateModels = [
    'gemini-2.5-flash',
    'gemini-flash-latest',
    'gemini-3.1-flash-lite',
    'gemini-3.8-flash'
  ];

  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(cleanErrorMessage(errorText));
      }

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('Gemini 응답을 받지 못했습니다.');
      }

      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned) as AIResponseData;
    } catch (err) {
      lastError = err;
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  throw lastError || new Error('현재 일시적으로 AI 모델 요청이 지연되고 있습니다. 잠시 후 다시 시도해주세요.');
}
