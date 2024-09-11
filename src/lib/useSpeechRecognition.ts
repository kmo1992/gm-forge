// useSpeechRecognition.ts
import { useState, useRef, useEffect } from 'react';

export const useSpeechRecognition = (setInputText: (text: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const [hasMicrophone, setHasMicrophone] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const checkMicrophone = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setHasMicrophone(true);
      } catch (err) {
        console.error("Error accessing microphone:", err);
        setHasMicrophone(false);
      }
    };

    checkMicrophone();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setHasMicrophone(false);
      } else {
        checkMicrophone();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setInputText(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [setInputText]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    setIsListening(!isListening);
  };

  return { isListening, toggleListening, hasMicrophone };
};
