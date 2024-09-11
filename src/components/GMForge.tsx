// src/app/GMForge.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatContainer } from '@/components/ChatContainer';
import { InputArea } from '@/components/InputArea';
import { useSpeechRecognition } from '@/lib/useSpeechRecognition';
import { useAudioPlayback } from '@/lib/useAudioPlayback';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function GMForge() {
  const [status, setStatus] = useState<'idle' | 'recording' | 'thinking' | 'speaking' | 'error'>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const { isListening, toggleListening, hasMicrophone } = useSpeechRecognition(setInputText);
  const { playAudio } = useAudioPlayback(() => setStatus('idle'));
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async () => {
    if (inputText.trim() === '' || status !== 'idle') return;

    const userInput = inputText;
    setMessages(prev => [...prev, { role: 'user', content: userInput }]);
    setInputText('');
    setStatus('thinking');

    if (isListening) {
      toggleListening();
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: userInput }] }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
      
      setStatus('speaking');
      playAudio(data.audio);
    } catch (error) {
      console.error('Error:', error);
      setStatus('error');
    } finally {
      setStatus('idle');
    }
  };

  return (
    <div className="h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-gray-100 flex flex-col">
      <div className="w-full max-w-4xl mx-auto px-4 flex-shrink-0">
        <h1 className="text-3xl py-4 text-purple-300 font-bold font-cinzel">GM Forge</h1>
      </div>
      <div 
        ref={chatContainerRef}
        className="flex-grow overflow-y-auto"
      >
        <div className="w-full max-w-4xl mx-auto px-4 pb-24">
          <ChatContainer messages={messages} status={status} />
        </div>
      </div>
      <div className="w-full fixed bottom-0 left-0 right-0 bg-gradient-to-b from-transparent to-gray-900">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <InputArea
            inputText={inputText}
            setInputText={setInputText}
            isListening={isListening}
            toggleListening={toggleListening}
            hasMicrophone={hasMicrophone}
            handleSubmit={handleSubmit}
            status={status}
          />
        </div>
      </div>
    </div>
  );
}