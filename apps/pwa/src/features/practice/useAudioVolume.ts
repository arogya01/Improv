import { useState, useEffect, useRef } from "react";

export function useAudioVolume(stream: MediaStream | null | undefined, smoothing = 0.8) {
  const [volume, setVolume] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    if (!stream || stream.getAudioTracks().length === 0) {
      setVolume(0);
      return;
    }

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = smoothing;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        
        // Calculate RMS
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const val = dataArray[i];
          if (val) {
            sum += val * val;
          }
        }
        const rms = Math.sqrt(sum / dataArray.length);
        
        // Normalize (max value of a byte is 255)
        const normalizedVolume = Math.min(1, rms / 128); // 128 is an arbitrary scalar to boost sensitivity
        
        setVolume(normalizedVolume);
        requestRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (err) {
      console.error("Failed to initialize audio volume analyzer:", err);
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (audioContextRef.current?.state !== "closed") {
        audioContextRef.current?.close().catch(console.error);
      }
    };
  }, [stream, smoothing]);

  return volume;
}
