import React from 'react';
import { EmotionType, EMOTIONS } from '../types';
import { Check } from 'lucide-react';

interface EmotionSelectorProps {
  selectedEmotion: EmotionType;
  onChange: (emotion: EmotionType) => void;
}

export const EmotionSelector: React.FC<EmotionSelectorProps> = ({ selectedEmotion, onChange }) => {
  const emotionList: EmotionType[] = ['기쁨', '지침', '설렘', '불안'];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-[#5C554D]">
          오늘의 내 마음 (감정 선택) <span className="text-amber-600">*</span>
        </label>
        <span className="text-xs text-[#8A8175]">가장 가까운 마음을 골라보세요</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {emotionList.map((emotionKey) => {
          const item = EMOTIONS[emotionKey];
          const isSelected = selectedEmotion === emotionKey;

          return (
            <button
              key={emotionKey}
              type="button"
              onClick={() => onChange(emotionKey)}
              className={`relative text-left p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                isSelected
                  ? `${item.bgLight} ${item.borderLight} ring-2 ring-amber-400/50 shadow-sm scale-[1.02]`
                  : 'bg-white/80 border-[#E8DFD3] hover:border-[#D5C7B5] hover:bg-white text-[#5C554D]'
              }`}
            >
              {isSelected && (
                <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
              )}

              <div className="text-2xl mb-1.5">{item.emoji}</div>
              <div className="font-semibold text-base text-[#3D3A37] flex items-center gap-1.5">
                {item.label}
              </div>
              <div className="text-xs text-[#857B70] mt-0.5 line-clamp-1">
                {item.sublabel}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
