import type { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';

export default async function handler(req: Request, res: Response) {
  // Enable CORS for Vercel deployment preview and custom domains
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }
    const { emotion, content, date, title } = body || {};

    if (!content || !emotion) {
      return res.status(400).json({ error: '일기 내용과 감정을 입력해주세요.' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY가 Vercel 환경 변수에 설정되어 있지 않습니다. Vercel Settings > Environment Variables를 확인해주세요.'
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const emotionContext = {
      '기쁨': '오늘은 기쁨과 행복이 깃든 날입니다. 이 기쁨을 함께 진심으로 축하해주고 오래 간직할 수 있도록 따스한 지지를 보내주세요.',
      '지침': '오늘은 몸과 마음이 지치고 고단했던 날입니다. 어떤 평가나 훈계 없이 지친 어깨를 꼭 안아주고 "정말 수고 많았다"는 무한한 쉼과 위로를 건네주세요.',
      '설렘': '오늘은 가슴이 두근거리고 새로운 기대감으로 설레는 날입니다. 그 두근거림을 귀엽고 사랑스럽게 응원해주며 밝은 에너지를 함께 나누어주세요.',
      '불안': '오늘은 마음이 불안하고 이런저런 걱정으로 혼란스러운 날입니다. "괜찮다", "지금 당장 모든 걸 해결하지 않아도 된다"며 흔들리는 마음을 든든하게 받쳐주는 평온의 닻이 되어주세요.'
    }[emotion as string] || '오늘 하루를 정성껏 기록한 사용자의 마음을 다정하게 위로해주세요.';

    const systemInstruction = `당신은 사용자의 하루 일기를 읽고 마음을 따스하게 보듬어주는 '다정한 AI 비서이자 인생의 포근한 다이어리 친구'입니다.
한국어로 부드럽고 다정한 존댓말(~했군요, ~참 잘하셨어요, ~힘들었죠)을 사용합니다.
상투적이거나 기계적인 문장이 아니라, 사용자가 쓴 일기의 구체적인 내용(사건, 감정, 생각)을 직접 언급하며 깊은 공감과 체온이 묻어나는 답변을 만듭니다.

다음 JSON 스키마 규격에 맞춰 반드시 JSON 형식으로만 응답해야 합니다:
1. comfortLetter: 사용자의 감정을 온전히 이해하고 안아주는 다정하고 따뜻한 위로 편지 (2~3문단).
2. tomorrowAction: 내일을 기분 좋게 맞이할 수 있는, 부담 없고 즉시 실천 가능한 작은 긍정적인 행동 1가지 (구체적이고 소소한 행복 미션).
3. comfortQuote: 마음에 오래도록 울림을 줄 따스한 한 줄 응원 문장.
4. warmTip: 오늘 밤 마음을 편안하게 정리할 수 있는 차(Tea)나 소소한 힐링 팁 1가지.`;

    const prompt = `[사용자 정보]
- 날짜: ${date || '오늘'}
- 제목: ${title || '오늘의 하루'}
- 선택한 감정: ${emotion}
- 감정 분위기: ${emotionContext}

[사용자가 작성한 일기 내용]:
"""
${content}
"""

위 일기를 읽고, 사용자의 감정에 진심으로 공감하는 위로의 편지와 내일을 위한 긍정적인 행동 1가지, 따뜻한 한 줄 문구, 힐링 팁을 JSON으로 응답해주세요.`;

    const candidateModels = [
      'gemini-2.5-flash',
      'gemini-flash-latest',
      'gemini-3.1-flash-lite',
      'gemini-3.8-flash'
    ];

    let response: any = null;
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                comfortLetter: {
                  type: Type.STRING,
                  description: '사용자의 감정을 다정하게 위로하고 깊이 공감해주는 편지글'
                },
                tomorrowAction: {
                  type: Type.STRING,
                  description: '내일을 위한 긍정적이고 실천하기 쉬운 작은 행동 1가지 제안'
                },
                comfortQuote: {
                  type: Type.STRING,
                  description: '가슴에 스며드는 따뜻한 한 줄 명언이나 응원 문구'
                },
                warmTip: {
                  type: Type.STRING,
                  description: '오늘 밤 몸과 마음을 녹여줄 차나 힐링 팁'
                }
              },
              required: ['comfortLetter', 'tomorrowAction', 'comfortQuote', 'warmTip']
            }
          }
        });

        if (response && response.text) {
          break;
        }
      } catch (err: any) {
        lastError = err;
        await new Promise((r) => setTimeout(r, 400));
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error('현재 일시적으로 AI 모델 요청이 지연되고 있습니다.');
    }

    const responseText = response.text || '';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    return res.status(200).json({
      success: true,
      data: parsedData
    });
  } catch (error: any) {
    let msg = error.message || 'AI 응원 생성 실패';
    if (typeof msg === 'string' && (msg.includes('503') || msg.includes('high demand') || msg.includes('UNAVAILABLE'))) {
      msg = '현재 AI 비서에 일시적으로 많은 요청이 몰려 있습니다. 잠시 후 다시 시도해주세요.';
    }
    return res.status(500).json({
      success: false,
      error: msg
    });
  }
}
