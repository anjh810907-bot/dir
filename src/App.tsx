import React, { useState, useEffect } from 'react';
import { DiaryForm } from './components/DiaryForm';
import { DiaryList } from './components/DiaryList';
import { DiaryDetailModal } from './components/DiaryDetailModal';
import { InfoModal } from './components/InfoModal';
import { AmbientSoundPlayer } from './components/AmbientSoundPlayer';
import { 
  DiaryEntry, 
  fetchDiariesFromDb, 
  deleteDiaryFromDb, 
  updateDiaryFavorite 
} from './firebase';
import { 
  Heart, 
  BookHeart, 
  PenTool, 
  Bookmark, 
  Info, 
  Sparkles,
  Calendar,
  Coffee,
  Database
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'write' | 'archive'>('write');
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [selectedDiary, setSelectedDiary] = useState<DiaryEntry | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Load diaries from Firestore on mount
  useEffect(() => {
    loadDiaries();
  }, []);

  const loadDiaries = async () => {
    try {
      const data = await fetchDiariesFromDb();
      setDiaries(data);
    } catch (err) {
      console.warn('Failed to load diaries:', err);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleDiarySaved = (newEntry: DiaryEntry) => {
    setDiaries((prev) => [newEntry, ...prev.filter((d) => d.id !== newEntry.id)]);
    showToast('소중한 일기와 AI 비서의 답장이 데이터베이스에 저장되었습니다 🌿');
  };

  const handleDeleteDiary = async (id: string) => {
    try {
      await deleteDiaryFromDb(id);
      setDiaries((prev) => prev.filter((d) => d.id !== id));
      showToast('일기가 삭제되었습니다.');
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleToggleFavorite = async (id: string, isFav: boolean) => {
    try {
      await updateDiaryFavorite(id, isFav);
      setDiaries((prev) =>
        prev.map((d) => (d.id === id ? { ...d, isFavorite: isFav } : d))
      );
      if (selectedDiary && selectedDiary.id === id) {
        setSelectedDiary((prev) => (prev ? { ...prev, isFavorite: isFav } : null));
      }
    } catch (err) {
      console.error('Favorite toggle error:', err);
    }
  };

  return (
    <div className="min-h-screen paper-pattern text-[#3D3A37] flex flex-col font-dodum">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3D3A37] text-white text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E8DFD3]/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <div 
            onClick={() => setActiveTab('write')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <BookHeart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-lg sm:text-xl text-[#3D3A37] font-batang tracking-tight">
                  따뜻한 하루 일기
                </h1>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold border border-amber-200">
                  AI 응원
                </span>
              </div>
              <p className="text-[11px] text-[#8A8175] hidden sm:block">
                당신의 고단했던 오늘을 다정하게 안아주는 쉼터
              </p>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <AmbientSoundPlayer />

            <button
              onClick={() => setIsInfoOpen(true)}
              className="p-2 rounded-full hover:bg-stone-200/60 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
              title="시스템 연동 및 환경 변수 정보"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between pb-2 border-b border-[#E8DFD3]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('write')}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'write'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white/70 text-stone-600 hover:bg-white border border-[#E8DFD3]'
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>오늘의 일기 쓰기</span>
            </button>

            <button
              onClick={() => setActiveTab('archive')}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'archive'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white/70 text-stone-600 hover:bg-white border border-[#E8DFD3]'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>보관된 일기장</span>
              {diaries.length > 0 && (
                <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                  activeTab === 'archive' ? 'bg-amber-800 text-amber-100' : 'bg-stone-200 text-stone-700'
                }`}>
                  {diaries.length}
                </span>
              )}
            </button>
          </div>

          <div className="text-xs text-[#8A8175] hidden sm:flex items-center gap-1.5">
            <Coffee className="w-3.5 h-3.5 text-amber-700" />
            <span>오늘도 고생 많았어요</span>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'write' ? (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Friendly Greeting Banner */}
            <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50/70 border border-amber-200/70 rounded-3xl p-5 sm:p-6 text-[#524636] space-y-1.5">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm sm:text-base font-batang">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>오늘 하루는 어떤 감정과 함께 흘러갔나요?</span>
              </div>
              <p className="text-xs sm:text-sm text-[#736350] leading-relaxed">
                기쁨, 지침, 설렘, 불안 중 마음에 남은 감정을 고르고 일기를 적어보세요.<br className="hidden sm:inline" />
                [AI 비서에게 일기 보여주기] 버튼을 누르면 Gemini AI가 다정한 위로 편지와 내일을 위한 작은 행동을 선물합니다.
              </p>
            </div>

            <DiaryForm onDiarySaved={handleDiarySaved} />
          </div>
        ) : (
          <div className="animate-in fade-in duration-200">
            <DiaryList
              diaries={diaries}
              onSelectDiary={(entry) => setSelectedDiary(entry)}
              onToggleFavorite={handleToggleFavorite}
              onOpenNewDiary={() => setActiveTab('write')}
            />
          </div>
        )}
      </main>

      {/* Diary Detail Modal */}
      <DiaryDetailModal
        entry={selectedDiary}
        onClose={() => setSelectedDiary(null)}
        onDelete={handleDeleteDiary}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* System & Firebase Info Modal */}
      <InfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />

      {/* Warm Footer */}
      <footer className="mt-auto border-t border-[#E8DFD3] bg-[#F5EFE6]/70 py-6 text-center text-xs text-[#8A8175] space-y-1.5">
        <div className="flex items-center justify-center gap-1.5 text-[#5C5245] font-medium">
          <Heart className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>오늘 하루도 참 애쓰셨어요. 내일은 더 맑고 다정한 하루가 되길 바라요.</span>
        </div>
        <p className="text-[11px] text-[#A3998C]">
          Google Gemini API (@google/genai) & Firebase Firestore (visit-f9c27) 연동
        </p>
      </footer>
    </div>
  );
}
