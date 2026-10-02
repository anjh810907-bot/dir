import React, { useState } from 'react';
import { DiaryEntry } from '../firebase';
import { EMOTIONS } from '../types';
import { 
  X, 
  Trash2, 
  Star, 
  Calendar, 
  Sun, 
  Heart, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Quote, 
  Coffee 
} from 'lucide-react';

interface DiaryDetailModalProps {
  entry: DiaryEntry | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, isFav: boolean) => void;
}

export const DiaryDetailModal: React.FC<DiaryDetailModalProps> = ({
  entry,
  onClose,
  onDelete,
  onToggleFavorite
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!entry) return null;

  const emotionMeta = EMOTIONS[entry.emotion] || EMOTIONS['기쁨'];

  const handleCopy = () => {
    if (!entry.aiResponse) return;
    const fullText = `[${entry.date} ${entry.title || '일기'}]
감정: ${entry.emotion}

내 일기:
${entry.content}

---------------------------
[AI 비서의 따뜻한 답장]
${entry.aiResponse.comfortLetter}

🌿 내일을 위한 작은 행동:
${entry.aiResponse.tomorrowAction}

✨ 마음에 품을 한 줄:
"${entry.aiResponse.comfortQuote}"

☕ 힐링 팁:
${entry.aiResponse.warmTip}`;

    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSpeech = () => {
    if (!('speechSynthesis' in window) || !entry.aiResponse) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(entry.aiResponse.comfortLetter);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => {
        if (isSpeaking) window.speechSynthesis.cancel();
        onClose();
      }}
    >
      <div 
        className="bg-[#FAF7F2] border border-[#E8DFD3] rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-[#E8DFD3] flex items-center justify-between bg-white/70">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{emotionMeta.emoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${emotionMeta.badgeBg}`}>
                  {emotionMeta.label}
                </span>
                <span className="text-xs text-[#8A8175] flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-stone-400" />
                  {entry.date}
                </span>
                {entry.weather && (
                  <span className="text-xs text-[#8A8175]">
                    • 날씨: {entry.weather}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-base sm:text-lg text-[#3D3A37] font-batang mt-1">
                {entry.title || `${entry.date}의 이야기`}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleFavorite(entry.id, !entry.isFavorite)}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                entry.isFavorite ? 'text-amber-500 bg-amber-50' : 'text-stone-400 hover:text-stone-600'
              }`}
              title={entry.isFavorite ? '즐겨찾기 해제' : '즐겨찾기에 추가'}
            >
              <Star className={`w-4 h-4 ${entry.isFavorite ? 'fill-amber-400' : ''}`} />
            </button>
            <button
              onClick={() => {
                if (isSpeaking) window.speechSynthesis.cancel();
                onClose();
              }}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* User's Original Diary */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-[#7A7165] uppercase tracking-wider flex items-center gap-1.5">
              <span>내 일기</span>
            </h4>
            <div className="bg-white p-5 rounded-2xl border border-[#EDE4D8] text-[#3D3A37] text-sm sm:text-base leading-relaxed diary-lines whitespace-pre-line shadow-xs">
              {entry.content}
            </div>
          </div>

          {/* AI Comfort Response */}
          {entry.aiResponse ? (
            <div className="space-y-4 pt-2 border-t border-[#EFE8DE]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <h4 className="font-bold text-sm sm:text-base text-amber-950 font-batang">
                    AI 비서의 따뜻한 답장
                  </h4>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleSpeech}
                    className="p-1.5 rounded-lg border border-[#E8DFD3] text-stone-600 hover:bg-white text-xs flex items-center gap-1 cursor-pointer"
                  >
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5 text-amber-600" />}
                    <span>{isSpeaking ? '정지' : '듣기'}</span>
                  </button>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg border border-[#E8DFD3] text-stone-600 hover:bg-white text-xs flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? '복사됨' : '복사'}</span>
                  </button>
                </div>
              </div>

              {/* Comfort Letter */}
              <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-amber-200/70 text-[#3D3A37] text-sm sm:text-base leading-relaxed font-batang whitespace-pre-line shadow-xs">
                {entry.aiResponse.comfortLetter}
              </div>

              {/* Tomorrow's Action */}
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/60 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <Sun className="w-3.5 h-3.5 text-amber-600" />
                  <span>내일을 위한 작은 선물 (실천 1가지)</span>
                </div>
                <p className="text-sm text-[#4A4036] font-medium leading-relaxed">
                  {entry.aiResponse.tomorrowAction}
                </p>
              </div>

              {/* Quote & Tip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-[#EDE4D8] space-y-1">
                  <div className="flex items-center gap-1 text-xs text-stone-500 font-medium">
                    <Quote className="w-3 h-3 text-amber-600" />
                    <span>마음에 품을 한 줄</span>
                  </div>
                  <p className="text-xs text-[#3D3A37] italic font-batang">
                    "{entry.aiResponse.comfortQuote}"
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-[#EDE4D8] space-y-1">
                  <div className="flex items-center gap-1 text-xs text-amber-800 font-medium">
                    <Coffee className="w-3 h-3 text-amber-600" />
                    <span>오늘 밤을 위한 팁</span>
                  </div>
                  <p className="text-xs text-[#4A4036]">
                    {entry.aiResponse.warmTip}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-stone-100 rounded-2xl text-xs text-stone-500 text-center">
              이 일기에는 AI 답장이 저장되지 않았습니다.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#E8DFD3] bg-white/70 flex items-center justify-between">
          <div>
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-700 font-medium">정말 삭제하시겠습니까?</span>
                <button
                  onClick={() => {
                    onDelete(entry.id);
                    onClose();
                  }}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  삭제
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-2 py-1 bg-stone-200 text-stone-700 rounded-lg text-xs cursor-pointer"
                >
                  취소
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-stone-400 hover:text-rose-600 p-2 rounded-xl transition-colors flex items-center gap-1 text-xs cursor-pointer"
                title="일기 삭제"
              >
                <Trash2 className="w-4 h-4" />
                <span>삭제하기</span>
              </button>
            )}
          </div>

          <button
            onClick={() => {
              if (isSpeaking) window.speechSynthesis.cancel();
              onClose();
            }}
            className="px-5 py-2 bg-stone-800 hover:bg-stone-900 text-white text-xs font-medium rounded-xl transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
