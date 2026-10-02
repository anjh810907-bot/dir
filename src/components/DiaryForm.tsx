import React, { useState, useEffect } from 'react';
import { EmotionType } from '../types';
import { EmotionSelector } from './EmotionSelector';
import { requestAICheer } from '../services/geminiClient';
import { AIResponseData, saveDiaryToDb, DiaryEntry } from '../firebase';
import { AIResponseCard } from './AIResponseCard';
import { 
  Sparkles, 
  Send, 
  Loader2, 
  Calendar, 
  Sun, 
  Cloud, 
  CloudRain, 
  Snowflake, 
  Wind,
  AlertCircle,
  HelpCircle,
  PenLine
} from 'lucide-react';

interface DiaryFormProps {
  onDiarySaved?: (entry: DiaryEntry) => void;
}

const WEATHERS = [
  { label: '맑음', icon: Sun, emoji: '☀️' },
  { label: '구름', icon: Cloud, emoji: '⛅' },
  { label: '비', icon: CloudRain, emoji: '🌧️' },
  { label: '눈', icon: Snowflake, emoji: '❄️' },
  { label: '바람', icon: Wind, emoji: '🍃' },
];

const WRITING_PROMPTS = [
  "오늘 하루 중 가장 마음이 쓰였던 순간은 언제인가요?",
  "나를 웃음 짓게 하거나 한숨 쉬게 만들었던 일은 무엇인가요?",
  "지금 이 순간 나 자신에게 가장 해주고 싶은 말은 무엇인가요?",
  "오늘 밤, 훌훌 털어버리고 싶은 걱정이 있나요?"
];

export const DiaryForm: React.FC<DiaryFormProps> = ({ onDiarySaved }) => {
  const [emotion, setEmotion] = useState<EmotionType>('지침');
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [weather, setWeather] = useState('맑음');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [currentAiResponse, setCurrentAiResponse] = useState<AIResponseData | null>(null);
  const [savedEntryId, setSavedEntryId] = useState<string | null>(null);
  const [showPrompts, setShowPrompts] = useState(false);

  // Cycling reassuring messages while AI is thinking
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      const messages = [
        "적어주신 일기를 가만히 읽어보고 있어요...",
        "오늘 하루 마음고생을 헤아리며 따뜻한 차를 우리고 있어요...",
        "마음에 와닿을 수 있도록 다정한 위로의 편지를 쓰고 있어요...",
        "내일을 기분 좋게 시작할 수 있는 작은 선물을 준비하고 있어요..."
      ];
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % messages.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const loadingMessages = [
    "적어주신 일기를 가만히 읽어보고 있어요...",
    "오늘 하루 마음고생을 헤아리며 따뜻한 차를 우리고 있어요...",
    "마음에 와닿을 수 있도록 다정한 위로의 편지를 쓰고 있어요...",
    "내일을 기분 좋게 시작할 수 있는 작은 선물을 준비하고 있어요..."
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setErrorMsg('오늘 있었던 일이나 마음에 머무는 생각을 편하게 적어주세요.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      // 1. Call Gemini AI through server endpoint (or direct fallback)
      const aiResult = await requestAICheer({
        emotion,
        content: content.trim(),
        date,
        title: title.trim() || '오늘의 하루'
      });

      setCurrentAiResponse(aiResult);

      // 2. Save to Firestore database (with local backup)
      const saved = await saveDiaryToDb({
        date,
        emotion,
        title: title.trim() || `${emotion}과 함께한 하루`,
        content: content.trim(),
        weather,
        aiResponse: aiResult,
        createdAt: new Date().toISOString()
      });

      setSavedEntryId(saved.id);
      if (onDiarySaved) {
        onDiarySaved(saved);
      }
    } catch (err: any) {
      console.error('Failed to get cheer or save diary:', err);
      setErrorMsg(
        err.message || 'AI 비서와의 연결에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentAiResponse(null);
    setSavedEntryId(null);
    setContent('');
    setTitle('');
  };

  // If AI response already obtained for this submission, display the warm response card!
  if (currentAiResponse) {
    return (
      <div className="space-y-6">
        <AIResponseCard
          emotion={emotion}
          aiResponse={currentAiResponse}
          dateStr={date}
          isSaved={!!savedEntryId}
          onReset={handleReset}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/90 border border-[#E8DFD3] rounded-3xl p-5 sm:p-8 shadow-xs space-y-6">
      {/* Date & Weather bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F0EAE1]">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-600" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="text-sm font-semibold text-[#3D3A37] bg-transparent focus:outline-hidden hover:bg-stone-50 px-2 py-1 rounded-lg border border-transparent hover:border-stone-200 transition-colors"
          />
        </div>

        {/* Weather selection */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-[#8A8175] mr-1 hidden sm:inline">오늘 날씨:</span>
          {WEATHERS.map((w) => (
            <button
              key={w.label}
              type="button"
              onClick={() => setWeather(w.label)}
              className={`p-1.5 sm:px-2 sm:py-1 rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer ${
                weather === w.label
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 font-medium'
                  : 'bg-stone-50 text-stone-500 hover:bg-stone-100 border border-stone-200/60'
              }`}
              title={w.label}
            >
              <span>{w.emoji}</span>
              <span className="hidden md:inline">{w.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 1. Emotion Selector */}
      <EmotionSelector
        selectedEmotion={emotion}
        onChange={setEmotion}
      />

      {/* 2. Diary Title (Optional) */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-[#5C554D]">
          오늘 하루 제목 (선택)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 조금 버거웠지만 잘 버텨낸 목요일"
          className="w-full px-4 py-2.5 rounded-2xl border border-[#E8DFD3] bg-[#FCFBF9] text-[#3D3A37] placeholder-[#A89F91] text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-400/50 focus:bg-white transition-all"
        />
      </div>

      {/* 3. Diary Content */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-[#5C554D]">
            오늘 있었던 일과 내 마음 <span className="text-amber-600">*</span>
          </label>
          <button
            type="button"
            onClick={() => setShowPrompts(!showPrompts)}
            className="text-xs text-amber-700 hover:text-amber-800 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>무엇을 쓸지 고민되나요?</span>
          </button>
        </div>

        {/* Thoughtful prompt suggestions */}
        {showPrompts && (
          <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/70 text-xs text-[#6B5E4F] space-y-1 animate-in fade-in duration-200">
            <p className="font-semibold text-amber-900 mb-1">💡 이런 이야기를 적어보세요:</p>
            <ul className="space-y-1 pl-1">
              {WRITING_PROMPTS.map((p, idx) => (
                <li 
                  key={idx} 
                  className="cursor-pointer hover:text-amber-900 hover:underline flex items-start gap-1.5"
                  onClick={() => {
                    setContent((prev) => prev ? `${prev}\n- ${p}\n` : `- ${p}\n`);
                  }}
                >
                  <span className="text-amber-500">•</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (errorMsg) setErrorMsg(null);
            }}
            placeholder="오늘 하루 있었던 일, 마음속에 맴도는 생각, 힘겨웠거나 행복했던 기억들을 자유롭게 털어놓아 보세요. AI 비서가 다정하게 귀 기울여 들을게요."
            rows={7}
            className="w-full p-4 rounded-2xl border border-[#E8DFD3] bg-[#FCFBF9] text-[#3D3A37] placeholder-[#A89F91] text-sm sm:text-base leading-relaxed diary-lines focus:outline-hidden focus:ring-2 focus:ring-amber-400/50 focus:bg-white transition-all resize-y"
          />
          <div className="text-right text-xs text-[#9E9588] mt-1 pr-1">
            {content.length}자 작성됨
          </div>
        </div>
      </div>

      {/* Error display with direct retry button */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-900 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <div className="leading-relaxed">
              <p className="font-semibold text-rose-950">AI 응원 생성 중 안내</p>
              <p className="text-rose-800 text-xs mt-0.5">{errorMsg}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => handleSubmit(e)}
            disabled={isLoading}
            className="self-end sm:self-center px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>지금 다시 시도하기</span>
          </button>
        </div>
      )}

      {/* The Requested Core Button: [AI 비서에게 일기 보여주기] */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 px-6 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer ${
            isLoading
              ? 'bg-amber-400 text-white cursor-not-allowed opacity-90'
              : 'bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white hover:shadow-lg active:scale-[0.99]'
          }`}
        >
          {isLoading ? (
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm sm:text-base font-medium font-dodum">
                {loadingMessages[loadingStep]}
              </span>
            </div>
          ) : (
            <>
              <Sparkles className="w-5 h-5 fill-white/30" />
              <span>AI 비서에게 일기 보여주기</span>
              <PenLine className="w-4 h-4 opacity-80" />
            </>
          )}
        </button>

        <p className="text-center text-xs text-[#8A8175] mt-2.5">
          버튼을 누르면 Gemini AI가 따뜻한 위로 편지와 내일을 위한 긍정적 실천 1가지를 답장해 드립니다.
        </p>
      </div>
    </form>
  );
};
