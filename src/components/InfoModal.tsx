import React from 'react';
import { X, ShieldCheck, Database, Key, CheckCircle, ExternalLink, Sparkles } from 'lucide-react';
import { firebaseConfig } from '../firebase';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-[#FAF7F2] border border-[#E8DFD3] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD3]">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-semibold text-lg text-[#3D3A37]">시스템 연동 및 보안 안내</h3>
              <p className="text-xs text-[#7A7165]">Gemini AI 연동 & Firebase 데이터베이스 상태</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gemini API Security Section */}
        <div className="bg-white p-4 rounded-2xl border border-[#E8DFD3] space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-medium text-sm">
            <Key className="w-4 h-4 text-amber-600" />
            <span>Gemini API 키 보안 원칙 준수</span>
          </div>
          <p className="text-xs text-[#6B6155] leading-relaxed">
            API 키는 클라이언트 코드에 하드코딩되지 않으며, 환경 변수를 통해 안전하게 로드됩니다.
          </p>
          <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-xs font-mono text-stone-700 space-y-1">
            <div className="flex items-center justify-between">
              <span>서버 / Vercel 함수:</span>
              <span className="text-emerald-700 font-semibold">process.env.GEMINI_API_KEY</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Vite SPA 클라이언트:</span>
              <span className="text-emerald-700 font-semibold">VITE_GEMINI_API_KEY</span>
            </div>
          </div>
          <p className="text-[11px] text-[#8C8377]">
            * 배포 시 Vercel 대시보드 &gt; <b>Settings &gt; Environment Variables</b>에 <code className="bg-amber-50 px-1 py-0.5 rounded text-amber-800">GEMINI_API_KEY</code>를 등록하시면 즉시 안전하게 작동합니다.
          </p>
        </div>

        {/* Firebase Config Section */}
        <div className="bg-white p-4 rounded-2xl border border-[#E8DFD3] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#3D3A37] font-medium text-sm">
              <Database className="w-4 h-4 text-amber-600" />
              <span>Firebase Firestore 연결 정보</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
              <CheckCircle className="w-3 h-3" /> 연동 완료
            </span>
          </div>
          <div className="text-xs text-[#6B6155] space-y-1 bg-stone-50 p-3 rounded-xl border border-stone-200">
            <div><b>Project ID:</b> {firebaseConfig.projectId}</div>
            <div><b>Auth Domain:</b> {firebaseConfig.authDomain}</div>
            <div><b>Storage Bucket:</b> {firebaseConfig.storageBucket}</div>
            <div><b>Storage Collection:</b> <code className="text-amber-800 font-medium">warm_diaries</code></div>
          </div>
          <p className="text-[11px] text-[#8C8377]">
            * 오프라인이거나 네트워크 상태에 따라 로컬 스토리지에 자동 백업되므로 소중한 일기가 유실되지 않습니다.
          </p>
        </div>

        {/* AI Philosophy */}
        <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/60 text-xs text-[#7A6B58] flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            이 웹앱은 사용자가 겪은 소중한 하루와 감정을 따뜻한 체온으로 읽고, 작은 위로와 내일을 향한 한 걸음을 선물하기 위해 만들어졌습니다.
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl text-sm transition-colors shadow-xs cursor-pointer"
        >
          확인
        </button>
      </div>
    </div>
  );
};
