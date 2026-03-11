import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ParticleOrb } from "../ParticleOrb";

interface PlaybackParticleOrbProps {
  src: string;
  durationMs: number;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

export const PlaybackParticleOrb: React.FC<PlaybackParticleOrbProps> = ({ 
  src, 
  durationMs,
  onPlayStateChange 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const audio = new Audio(src);
    audioRef.current = audio;

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioCtx.createMediaElementSource(audio);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    analyserRef.current = analyser;

    const update = () => {
      if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const val = dataArray[i];
          if (val) sum += val;
        }
        const avg = sum / dataArray.length;
        setVolume(avg / 128); // Normalized volume for orb
      }
      setCurrentTime(audio.currentTime);
      rafRef.current = requestAnimationFrame(update);
    };

    audio.onplay = () => {
      setIsPlaying(true);
      onPlayStateChange?.(true);
      if (audioCtx.state === 'suspended') audioCtx.resume();
      update();
    };

    audio.onpause = () => {
      setIsPlaying(false);
      onPlayStateChange?.(false);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setVolume(0);
    };

    audio.onended = () => {
      setIsPlaying(false);
      onPlayStateChange?.(false);
      setCurrentTime(0);
    };

    return () => {
      audio.pause();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      audioCtx.close();
    };
  }, [src, onPlayStateChange]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
    }
  };

  const progress = (currentTime * 1000) / durationMs;

  return (
    <div className="relative w-80 h-80 flex items-center justify-center mx-auto">
      {/* Background Rings */}
      <div className="absolute inset-0 rounded-full border border-teal-500/[0.05] scale-[1.15]" />
      <div className="absolute inset-4 rounded-full border border-indigo-500/[0.03] scale-105" />

      {/* Particle Orb */}
      <div className="relative w-72 h-72">
        <ParticleOrb 
          volume={volume} 
          baseRadius={50} 
          className="w-full h-full" 
        />
        
        {/* Play/Pause Overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={togglePlay}
            className="w-20 h-20 rounded-full bg-white/40 backdrop-blur-[32px] border border-white/60 shadow-lg flex items-center justify-center text-teal-600 transition-colors hover:bg-white/60"
          >
            <span
              className="iconify"
              data-icon={isPlaying ? "solar:pause-bold" : "solar:play-bold"} 
              style={{ fontSize: "2.5rem", marginLeft: isPlaying ? "0" : "4px" }} 
            ></span>
          </motion.button>
        </div>

        {/* Progress Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none z-10">
          <circle
            cx="50%"
            cy="50%"
            r="48%"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="301.5"
            strokeDashoffset={301.5 * (1 - progress)}
            className="text-teal-500/30 transition-all duration-300 ease-linear"
            style={{ strokeLinecap: 'round' }}
          />
        </svg>
      </div>
    </div>
  );
};
