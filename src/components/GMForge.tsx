'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Loader, AlertCircle, Volume2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { startSpeechRecognition } from '@/lib/speechRecognition';
import { themes, Theme } from '@/lib/themes';
import ThemeSwitcher from '@/components/ThemeSwitcher';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function GMForge() {
  const [status, setStatus] = useState<'idle' | 'recording' | 'thinking' | 'speaking' | 'error'>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTheme, setCurrentTheme] = useState<string>('shadowdark');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const theme: Theme = themes[currentTheme];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => setStatus('idle');
    }
  }, [audioRef]);

  const StatusIcon = () => {
    switch (status) {
      case 'recording': return <Mic className={`animate-pulse ${theme.accent}`} />;
      case 'thinking': return <Loader className={`animate-spin ${theme.primary}`} />;
      case 'speaking': return <Volume2 className={`animate-pulse ${theme.secondary}`} />;
      case 'error': return <AlertCircle className={theme.accent} />;
      default: return <Mic className={theme.text} />;
    }
  };

  const handleSpeak = async () => {
    setStatus('recording');
    try {
      const transcription = await startSpeechRecognition();
      await sendTranscription(transcription);
    } catch (error) {
      console.error('Speech recognition error:', error);
      setStatus('error');
    }
  };

  const sendTranscription = async (input: string) => {
    setStatus('thinking');
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: input }] }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'user', content: input }, { role: 'assistant', content: data.text }]);
      
      setStatus('speaking');
      if (audioRef.current) {
        audioRef.current.src = data.audio;
        audioRef.current.play();
      }
    } catch (error) {
      console.error('Error:', error);
      setStatus('error');
    }
  };

  return (
    <div className={`min-h-screen ${theme.background} ${theme.text}`}>
      <div className="container mx-auto px-4 py-8">
        <h1 className={`text-5xl text-center mb-8 ${theme.primary} font-bold font-cinzel`}>GM Forge</h1>
        
        <ThemeSwitcher currentTheme={currentTheme} setTheme={setCurrentTheme} />
        
        <div className={`max-w-3xl mx-auto bg-gray-800 bg-opacity-50 rounded-lg shadow-lg p-6 mb-4 h-[60vh] overflow-y-auto border ${theme.primary}`}>
          {messages.map((msg, index) => (
            <div key={index} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block p-3 rounded-lg ${msg.role === 'user' ? theme.messageUser : theme.messageAssistant} shadow-md`}>
                {msg.role === 'user' ? (
                  <span className={theme.secondary}>{msg.content}</span>
                ) : (
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({node, ...props}) => <p className={`mb-2 ${theme.text}`} {...props} />,
                      h1: ({node, ...props}) => <h1 className={`text-2xl font-bold mb-2 ${theme.primary}`} {...props} />,
                      h2: ({node, ...props}) => <h2 className={`text-xl font-semibold mb-2 ${theme.primary}`} {...props} />,
                      ul: ({node, ...props}) => <ul className={`list-disc list-inside mb-2 ${theme.text}`} {...props} />,
                      ol: ({node, ...props}) => <ol className={`list-decimal list-inside mb-2 ${theme.text}`} {...props} />,
                      li: ({node, ...props}) => <li className="mb-1" {...props} />,
                      a: ({node, ...props}) => <a className={`${theme.secondary} hover:underline`} {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className={`border-l-4 ${theme.primary} pl-2 italic ${theme.text}`} {...props} />,
                      code: ({node, inline, ...props}) => 
                        inline 
                          ? <code className={`bg-gray-700 rounded px-1 ${theme.text}`} {...props} />
                          : <code className={`block bg-gray-700 rounded p-2 my-2 ${theme.text}`} {...props} />,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="flex justify-center items-center mt-6">
          <button
            onClick={handleSpeak}
            className={`${theme.messageAssistant} hover:bg-opacity-80 ${theme.text} font-bold py-3 px-6 rounded-full flex items-center shadow-lg transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={status !== 'idle'}
          >
            <StatusIcon />
            <span className="ml-2 text-lg">
              {status === 'idle' ? 'Speak Your Action' : status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </button>
        </div>
      </div>
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}