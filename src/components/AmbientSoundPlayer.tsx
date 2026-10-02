import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, CloudRain, Flame, Music } from 'lucide-react';

export const AmbientSoundPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<'rain' | 'fireplace'>('rain');
  const [volume, setVolume] = useState(0.2);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseSourceRef = useRef<AudioNode | null>(null);

  const startSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Pink noise generation for rain / fireplace
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      // Filter
      const filter = ctx.createBiquadFilter();
      if (mode === 'rain') {
        filter.type = 'lowpass';
        filter.frequency.value = 1000;
      } else {
        filter.type = 'bandpass';
        filter.frequency.value = 600;
        filter.Q.value = 0.8;
      }

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gainNodeRef.current = gain;

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(0);
      noiseSourceRef.current = noise;
      setIsPlaying(true);
    } catch (e) {
      console.warn('AudioContext autoplay or init error:', e);
    }
  };

  const stopSound = () => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopSound();
    } else {
      startSound();
    }
  };

  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  useEffect(() => {
    return () => {
      stopSound();
    };
  }, []);

  return (
    <div className="flex items-center gap-1.5 bg-amber-50/90 border border-amber-200/80 px-2.5 py-1.5 rounded-full text-xs text-[#6B5E4F] shadow-xs">
      <button
        onClick={togglePlay}
        className={`flex items-center gap-1 px-2 py-0.5 rounded-full transition-colors font-medium cursor-pointer ${
          isPlaying ? 'bg-amber-500 text-white shadow-xs' : 'hover:bg-amber-100 text-[#6B5E4F]'
        }`}
        title={isPlaying ? '배경 소리 끄기' : '포근한 배경음 켜기'}
      >
        {isPlaying ? <Volume2 className="w-3.5 h-3.5 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
        <span>{isPlaying ? '소리 ON' : '배경 소리'}</span>
      </button>

      {isPlaying && (
        <div className="flex items-center gap-1 pl-1 border-l border-amber-300">
          <button
            onClick={() => {
              setMode('rain');
              stopSound();
              setTimeout(startSound, 50);
            }}
            className={`p-1 rounded-full cursor-pointer ${mode === 'rain' ? 'text-amber-700 bg-amber-200' : 'text-stone-400 hover:text-stone-600'}`}
            title="빗소리"
          >
            <CloudRain className="w-3 h-3" />
          </button>
          <button
            onClick={() => {
              setMode('fireplace');
              stopSound();
              setTimeout(startSound, 50);
            }}
            className={`p-1 rounded-full cursor-pointer ${mode === 'fireplace' ? 'text-amber-700 bg-amber-200' : 'text-stone-400 hover:text-stone-600'}`}
            title="모닥불 소리"
          >
            <Flame className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
