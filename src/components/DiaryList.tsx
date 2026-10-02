import React, { useState } from 'react';
import { DiaryEntry } from '../firebase';
import { EmotionType, EMOTIONS } from '../types';
import { 
  Search, 
  Calendar, 
  Star, 
  Sparkles, 
  BookOpen, 
  Filter, 
  Clock, 
  Heart,
  ChevronRight,
  Sun
} from 'lucide-react';

interface DiaryListProps {
  diaries: DiaryEntry[];
  onSelectDiary: (entry: DiaryEntry) => void;
  onToggleFavorite: (id: string, isFav: boolean) => void;
  onOpenNewDiary: () => void;
}

export const DiaryList: React.FC<DiaryListProps> = ({
  diaries,
  onSelectDiary,
  onToggleFavorite,
  onOpenNewDiary
}) => {
  const [filterEmotion, setFilterEmotion] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const filteredDiaries = diaries.filter((entry) => {
    if (filterEmotion !== 'all' && entry.emotion !== filterEmotion) return false;
    if (onlyFavorites && !entry.isFavorite) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = entry.title?.toLowerCase().includes(q);
      const matchContent = entry.content?.toLowerCase().includes(q);
      const matchComfort = entry.aiResponse?.comfortLetter?.toLowerCase().includes(q);
      return matchTitle || matchContent || matchComfort;
    }
    return true;
  });

  // Emotional statistics count
  const emotionStats = diaries.reduce(
    (acc, curr) => {
      acc[curr.emotion] = (acc[curr.emotion] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      {/* Top filter & search controls */}
      <div className="bg-white/80 border border-[#E8DFD3] rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="일기 내용이나 AI 위로 편지 검색..."
              className="w-full pl-10 pr-4 py-2 rounded-2xl border border-[#E8DFD3] bg-[#FCFBF9] text-sm text-[#3D3A37] placeholder-[#A89F91] focus:outline-hidden focus:ring-2 focus:ring-amber-400/50 focus:bg-white transition-all"
            />
          </div>

          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`px-3 py-2 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              onlyFavorites
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-white text-stone-600 border-[#E8DFD3] hover:bg-stone-50'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-amber-500 text-amber-500' : 'text-stone-400'}`} />
            <span>즐겨찾기만 보기</span>
          </button>
        </div>

        {/* Emotion Filter Tags */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setFilterEmotion('all')}
            className={`px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer ${
              filterEmotion === 'all'
                ? 'bg-[#4A4036] text-white shadow-xs'
                : 'bg-white border border-[#E8DFD3] text-stone-600 hover:bg-stone-50'
            }`}
          >
            전체 ({diaries.length})
          </button>

          {(['기쁨', '지침', '설렘', '불안'] as EmotionType[]).map((em) => {
            const count = emotionStats[em] || 0;
            const meta = EMOTIONS[em];
            const isSelected = filterEmotion === em;

            return (
              <button
                key={em}
                onClick={() => setFilterEmotion(em)}
                className={`px-3 py-1.5 rounded-full font-medium transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? `${meta.bgLight} ${meta.borderLight} border ring-1 ring-amber-400 font-bold ${meta.textDark}`
                    : 'bg-white border border-[#E8DFD3] text-stone-600 hover:bg-stone-50'
                }`}
              >
                <span>{meta.emoji}</span>
                <span>{em}</span>
                <span className="text-[11px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Diary Card Grid or Empty State */}
      {filteredDiaries.length === 0 ? (
        <div className="bg-white/70 border border-[#E8DFD3] rounded-3xl p-10 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-base text-[#3D3A37]">
            {diaries.length === 0 ? '아직 기록된 일기가 없어요' : '조건에 맞는 일기가 없습니다'}
          </h3>
          <p className="text-xs sm:text-sm text-[#8A8175] max-w-sm mx-auto">
            {diaries.length === 0
              ? '오늘 하루 있었던 일과 마음을 적고 다정한 AI 비서의 첫 위로 편지를 받아보세요.'
              : '다른 검색어나 감정 필터를 선택해보세요.'}
          </p>
          {diaries.length === 0 && (
            <button
              onClick={onOpenNewDiary}
              className="mt-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer"
            >
              오늘의 일기 쓰러 가기
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDiaries.map((entry) => {
            const meta = EMOTIONS[entry.emotion] || EMOTIONS['기쁨'];

            return (
              <div
                key={entry.id}
                onClick={() => onSelectDiary(entry)}
                className="bg-white/90 border border-[#E8DFD3] hover:border-[#D5C7B5] rounded-3xl p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group space-y-4"
              >
                {/* Header row */}
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-[#F4EFE8]">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{meta.emoji}</span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${meta.badgeBg}`}>
                        {meta.label}
                      </span>
                      <span className="text-xs text-[#8A8175] flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        {entry.date}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(entry.id, !entry.isFavorite);
                      }}
                      className="p-1.5 rounded-lg text-stone-300 hover:text-amber-500 transition-colors"
                      title={entry.isFavorite ? '즐겨찾기' : '즐겨찾기 추가'}
                    >
                      <Star className={`w-4 h-4 ${entry.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                  </div>

                  {/* Title and snippet */}
                  <div className="mt-3 space-y-1.5">
                    <h4 className="font-bold text-base text-[#3D3A37] group-hover:text-amber-900 transition-colors line-clamp-1 font-batang">
                      {entry.title || `${entry.date}의 기록`}
                    </h4>
                    <p className="text-xs sm:text-sm text-[#6B6155] line-clamp-3 leading-relaxed">
                      {entry.content}
                    </p>
                  </div>
                </div>

                {/* AI snippet box */}
                {entry.aiResponse ? (
                  <div className="bg-amber-50/60 p-3 rounded-2xl border border-amber-200/50 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-amber-900 font-semibold">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>AI 비서의 답장 요약</span>
                    </div>
                    <p className="text-xs text-[#6B5E4F] italic line-clamp-2 leading-relaxed">
                      "{entry.aiResponse.comfortQuote || entry.aiResponse.tomorrowAction}"
                    </p>
                  </div>
                ) : null}

                {/* Footer read action */}
                <div className="flex items-center justify-between text-xs text-[#8A8175] pt-1">
                  <span>{entry.weather ? `날씨: ${entry.weather}` : '기록 완료'}</span>
                  <div className="flex items-center gap-1 text-amber-700 font-semibold group-hover:translate-x-1 transition-transform">
                    <span>자세히 읽기</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
