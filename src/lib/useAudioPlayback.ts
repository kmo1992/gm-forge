// useAudioPlayback.ts
import { useRef, useEffect } from 'react';

export const useAudioPlayback = (onEnded) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.onended = onEnded;

    return () => {
      if (audioRef.current) {
        audioRef.current.onended = null;
      }
    };
  }, [onEnded]);

  const playAudio = (src: string) => {
    if (audioRef.current) {
      audioRef.current.src = src;
      audioRef.current.play();
    }
  };

  return { playAudio };
};