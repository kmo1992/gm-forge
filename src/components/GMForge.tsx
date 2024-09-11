'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Loader, AlertCircle, Volume2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { startSpeechRecognition } from '@/lib/speechRecognition';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function GMForge() {
  const [status, setStatus] = useState<'idle' | 'recording' | 'thinking' | 'speaking' | 'error'>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
      case 'recording': return <Mic className="animate-pulse text-red-400" />;
      case 'thinking': return <Loader className="animate-spin text-purple-400" />;
      case 'speaking': return <Volume2 className="animate-pulse text-green-400" />;
      case 'error': return <AlertCircle className="text-yellow-400" />;
      default: return <Mic className="text-gray-400" />;
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-5xl text-center mb-8 text-purple-300 font-bold font-cinzel">GM Forge</h1>
        
        <div className="max-w-3xl mx-auto bg-gray-800 bg-opacity-50 rounded-lg shadow-lg p-6 mb-4 h-[60vh] overflow-y-auto border border-purple-500">
          {messages.map((msg, index) => (
            <div key={index} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-900' : 'bg-purple-900'} shadow-md`}>
                {msg.role === 'user' ? (
                  <span className="text-blue-200">{msg.content}</span>
                ) : (
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({node, ...props}) => <p className="mb-2 text-purple-200" {...props} />,
                      h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-2 text-purple-300" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-xl font-semibold mb-2 text-purple-300" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2 text-purple-200" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2 text-purple-200" {...props} />,
                      li: ({node, ...props}) => <li className="mb-1" {...props} />,
                      a: ({node, ...props}) => <a className="text-blue-300 hover:underline" {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-purple-500 pl-2 italic text-gray-300" {...props} />,
                      code: ({node, inline, ...props}) => 
                        inline 
                          ? <code className="bg-gray-700 rounded px-1 text-purple-200" {...props} />
                          : <code className="block bg-gray-700 rounded p-2 my-2 text-purple-200" {...props} />,
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
            className="bg-purple-700 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-full flex items-center shadow-lg transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
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