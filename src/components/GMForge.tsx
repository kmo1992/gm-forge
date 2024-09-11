'use client';

import React, { useState } from 'react';
import { Mic, Loader, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { startSpeechRecognition } from '@/lib/speechRecognition';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function GMForge() {
  const [status, setStatus] = useState<'idle' | 'recording' | 'thinking' | 'error'>('idle');
  const [messages, setMessages] = useState<Message[]>([]);

  const StatusIcon = () => {
    switch (status) {
      case 'recording': return <Mic className="animate-pulse text-red-500" />;
      case 'thinking': return <Loader className="animate-spin text-blue-500" />;
      case 'error': return <AlertCircle className="text-yellow-500" />;
      default: return <Mic className="text-gray-500" />;
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
      new Audio(data.audio).play();
    } catch (error) {
      console.error('Error:', error);
      setStatus('error');
    } finally {
      setStatus('idle');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl text-center mb-8 text-white">GM Forge</h1>
      
      <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-lg p-4 mb-4 h-96 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-600' : 'bg-green-600'}`}>
              {msg.role === 'user' ? (
                <span>{msg.content}</span>
              ) : (
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({node, ...props}) => <p className="mb-2" {...props} />,
                    h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-2" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-lg font-semibold mb-2" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2" {...props} />,
                    li: ({node, ...props}) => <li className="mb-1" {...props} />,
                    a: ({node, ...props}) => <a className="text-blue-300 hover:underline" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-500 pl-2 italic" {...props} />,
                    code: ({node, inline, ...props}) => 
                      inline 
                        ? <code className="bg-gray-700 rounded px-1" {...props} />
                        : <code className="block bg-gray-700 rounded p-2 my-2" {...props} />,
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-center items-center mt-4">
        <button
          onClick={handleSpeak}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full flex items-center"
          disabled={status === 'recording' || status === 'thinking'}
        >
          <StatusIcon />
          <span className="ml-2">
            {status === 'idle' ? 'Click to Speak' : status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </button>
      </div>
    </div>
  );
}