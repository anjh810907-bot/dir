import React, { useState } from 'react';
import { AIResponseData, EmotionType } from '../firebase';
import { EMOTIONS } from '../types';
import { 
  Heart, 
  Sparkles, 
  Sun, 
  Coffee, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Quote, 
  BookmarkCheck,
  SendHorizontal
} from 'lucide-react';

interface AIResponseCardProps {
  emotion: EmotionType;
  aiResponse: AIResponseData;
  dateStr?: string;
  isSaved?: boolean;
  onSaveToArchive?: () => void;
  onReset?: () => void;
}

export const AIResponseCard: React.FC<AIResponseCardProps> = ({
  emotion,
  aiResponse,
  dateStr,
  isSaved,
  onSaveToArchive,
  onReset
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [actionDone, setActionDone] = useState(false);

  const emotionMeta = EMOTIONS[emotion] || EMOTIONS['기쁨'];

  const handleCopy = () => {
    const fullText = `[따뜻한 하루 일기 - AI 비서의 응원 편지]
${aiResponse.comfortLetter}

🌿 내일을 위한 작은 행동:
${aiResponse.tomorrowAction}

✨ 마음에 품을 한 줄:
"${aiResponse.comfortQuote}"

☕ 오늘 밤을 위한 힐링 팁:
${aiResponse.warmTip}`;

    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('사용하시는 브라우저에서는 음성 읽기 기능을 지원하지 않습니다.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(aiResponse.comfortLetter);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.9; // Gently paced warm tone
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsSpeaking(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <div className="bg-[#FFFCF7] border border-[#E8DFD3] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden transition-all duration-300">
      {/* Decorative accent top bar */}
      <div className={`h-2 -mt-6 sm:-mt-8 -mx-6 sm:-mx-8 ${emotionMeta.bgLight} border-b ${emotionMeta.borderLight}`} />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFE8DE]">
        <div className="flex items-center gap-3">
          <span className="text-3xl p-2.5 rounded-2xl bg-white shadow-xs border border-[#EFE8DE]">
            {emotionMeta.emoji}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${emotionMeta.badgeBg}`}>
                {emotionMeta.label}
              </span>
              <span className="text-xs text-[#8A8175]">{dateStr || '오늘의 답장'}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#3D3A37] font-batang mt-0.5">
              AI 비서의 따뜻한 답장
            </h3>
          </div>
        </div>

        {/* Action utility buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleSpeech}
            className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              isSpeaking
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : 'bg-white text-[#6B6155] border-[#E8DFD3] hover:bg-stone-50'
            }`}
            title="다정한 목소리로 읽어주기"
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-600" />}
            <span>{isSpeaking ? '음성 멈춤' : '편지 듣기'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="p-2 rounded-xl bg-white border border-[#E8DFD3] text-[#6B6155] hover:bg-stone-50 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="편지 내용 복사"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
            <span>{copied ? '복사됨' : '복사'}</span>
          </button>
        </div>
      </div>

      {/* Main Comfort Letter */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 uppercase tracking-wider">
          <Heart className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>마음을 보듬는 다정한 위로</span>
        </div>
        <div className="bg-white/90 p-5 sm:p-6 rounded-2xl border border-[#EDE4D8] text-[#3D3A37] text-base leading-relaxed sm:leading-loose font-batang whitespace-pre-line shadow-xs">
          {aiResponse.comfortLetter}
        </div>
      </div>

      {/* Tomorrow's Action Item */}
      <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/50 p-5 rounded-2xl border border-amber-200/80 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-amber-200/60 text-amber-800">
              <Sun className="w-4 h-4 text-amber-700" />
            </span>
            <span className="text-xs sm:text-sm font-bold text-amber-900">
              내일을 위한 선물 (작은 행동 1가지)
            </span>
          </div>
          <button
            onClick={() => setActionDone(!actionDone)}
            className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all flex items-center gap-1 cursor-pointer ${
              actionDone 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'bg-white/90 hover:bg-white text-amber-900 border border-amber-300'
            }`}
          >
            <Check className="w-3 h-3" />
            <span>{actionDone ? '내일 실천 약속 완료! 🌿' : '내일 실천해볼게요'}</span>
          </button>
        </div>
        <p className="text-sm sm:text-base text-[#4A4036] font-medium pl-1 leading-relaxed">
          {aiResponse.tomorrowAction}
        </p>
      </div>

      {/* Comfort Quote and Warm Tip Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Quote */}
        <div className="bg-white/90 p-4 rounded-2xl border border-[#EDE4D8] space-y-1.5 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 font-semibold">
            <Quote className="w-3.5 h-3.5 text-amber-600 rotate-180" />
            <span>마음에 품을 한 줄</span>
          </div>
          <p className="text-sm font-batang text-[#3D3A37] italic font-medium leading-relaxed my-1">
            "{aiResponse.comfortQuote}"
          </p>
          <span className="text-[11px] text-[#8A8175] text-right">오늘의 AI 응원구</span>
        </div>

        {/* Warm Tip / Tea */}
        <div className="bg-white/90 p-4 rounded-2xl border border-[#EDE4D8] space-y-1.5 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs text-amber-800 font-semibold">
            <Coffee className="w-3.5 h-3.5 text-amber-600" />
            <span>오늘 밤을 위한 포근한 팁</span>
          </div>
          <p className="text-sm text-[#4A4036] leading-relaxed my-1">
            {aiResponse.warmTip}
          </p>
          <span className="text-[11px] text-[#8A8175] text-right">따뜻한 휴식 팁</span>
        </div>
      </div>

      {/* Bottom control row */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        {isSaved ? (
          <div className="inline-flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <BookmarkCheck className="w-4 h-4 text-emerald-600" />
            <span>Firebase 데이터베이스에 안전하게 보관되었습니다</span>
          </div>
        ) : onSaveToArchive ? (
          <button
            onClick={onSaveToArchive}
            className="w-full sm:w-auto px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl border border-stone-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>다이어리 보관함에 저장하기</span>
          </button>
        ) : <div />}

        {onReset && (
          <button
            onClick={onReset}
            className="w-full sm:w-auto px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>새로운 일기 쓰기</span>
            <SendHorizontal className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
