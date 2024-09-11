'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const ThinkingAnimation = () => (
  <div className="flex items-center justify-center space-x-2 my-4">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"
        style={{ animationDelay: `${i * 0.15}s` }}
      />
    ))}
  </div>
);

export default function GMForge() {
  const [status, setStatus] = useState<'idle' | 'recording' | 'thinking' | 'speaking' | 'error'>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => setStatus('idle');
    }
  }, [audioRef]);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
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
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    setIsListening(!isListening);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const handleSubmit = async () => {
    if (inputText.trim() === '') return;

    const userInput = inputText;
    setMessages(prev => [...prev, { role: 'user', content: userInput }]);
    setInputText('');
    setStatus('thinking');
    scrollToBottom();

    // Stop recording if it's active
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-gray-100 p-4">
      <div className="container mx-auto max-w-4xl flex flex-col h-screen">
        <h1 className="text-5xl text-center mb-8 text-purple-300 font-bold font-cinzel">GM Forge</h1>
        
        <div className="h-[40vh] overflow-y-auto mb-4 bg-gray-800 bg-opacity-50 rounded-lg shadow-lg p-6 border border-purple-500">
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

        {status === 'thinking' && (
          <div className="bg-purple-900 p-3 rounded-lg shadow-md mb-4">
            <ThinkingAnimation />
            <p className="text-center text-purple-200">GM is thinking...</p>
          </div>
        )}
        
        <div className="flex flex-col space-y-2">
          <textarea
            value={inputText}
            onChange={handleInputChange}
            className="w-full p-2 rounded-lg bg-blue-900 text-blue-200"
            placeholder="Type your action or speak..."
            rows={3}
          />
          <div className="flex justify-between space-x-2">
            <button
              onClick={toggleListening}
              className={`p-2 rounded-lg ${isListening ? 'bg-red-600' : 'bg-purple-700'} text-white disabled:opacity-50 flex items-center justify-center flex-1`}
              disabled={status !== 'idle'}
            >
              <Mic size={20} className="mr-2" />
              <span>{isListening ? 'Stop' : 'Record'}</span>
            </button>
            <button
              onClick={handleSubmit}
              className="p-2 rounded-lg bg-purple-700 text-white disabled:opacity-50 flex items-center justify-center flex-1"
              disabled={status !== 'idle' || inputText.trim() === ''}
            >
              <Send size={20} className="mr-2" />
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}