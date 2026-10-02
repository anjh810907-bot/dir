export type EmotionType = '기쁨' | '지침' | '설렘' | '불안';

export interface EmotionMeta {
  type: EmotionType;
  label: string;
  sublabel: string;
  emoji: string;
  themeColor: string;
  bgLight: string;
  borderLight: string;
  textDark: string;
  badgeBg: string;
}

export const EMOTIONS: Record<EmotionType, EmotionMeta> = {
  '기쁨': {
    type: '기쁨',
    label: '기쁨',
    sublabel: '마음이 환하게 피어난 날',
    emoji: '🌻',
    themeColor: 'amber',
    bgLight: 'bg-amber-50',
    borderLight: 'border-amber-200',
    textDark: 'text-amber-900',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-300'
  },
  '지침': {
    type: '지침',
    label: '지침',
    sublabel: '토닥토닥 쉼이 필요한 날',
    emoji: '🌙',
    themeColor: 'indigo',
    bgLight: 'bg-indigo-50',
    borderLight: 'border-indigo-200',
    textDark: 'text-indigo-950',
    badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-300'
  },
  '설렘': {
    type: '설렘',
    label: '설렘',
    sublabel: '두근두근 가슴 뛰는 날',
    emoji: '🌸',
    themeColor: 'rose',
    bgLight: 'bg-rose-50',
    borderLight: 'border-rose-200',
    textDark: 'text-rose-950',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-300'
  },
  '불안': {
    type: '불안',
    label: '불안',
    sublabel: '포근한 위로와 안정이 필요한 날',
    emoji: '🍃',
    themeColor: 'emerald',
    bgLight: 'bg-emerald-50',
    borderLight: 'border-emerald-200',
    textDark: 'text-emerald-950',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  }
};
