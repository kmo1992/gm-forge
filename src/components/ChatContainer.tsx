// src/components/ChatContainer.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ThinkingAnimation } from '@/components/ThinkingAnimation';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

interface ChatContainerProps {
  messages: Message[];
  status: 'idle' | 'recording' | 'thinking' | 'speaking' | 'error';
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ messages, status }) => {
  return (
    <div>
      {messages.map((msg, index) => (
        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
          <div className={`max-w-[70%] p-3 rounded-lg ${
            msg.role === 'user' 
              ? 'bg-blue-900 text-blue-200' 
              : 'bg-purple-900 text-purple-200'
          }`}>
            {msg.role === 'user' ? (
              <p>{msg.content}</p>
            ) : (
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({node, ...props}) => <p className="mb-2" {...props} />,
                  h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-2 text-purple-300" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-xl font-semibold mb-2 text-purple-300" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2" {...props} />,
                  li: ({node, ...props}) => <li className="mb-1" {...props} />,
                  a: ({node, ...props}) => <a className="text-blue-300 hover:underline" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-purple-500 pl-2 italic text-gray-300" {...props} />,
                  code: ({node, inline, ...props}) => 
                    inline 
                      ? <code className="bg-purple-800 rounded px-1" {...props} />
                      : <code className="block bg-purple-800 rounded p-2 my-2" {...props} />,
                }}
              >
                {msg.content}
              </ReactMarkdown>
            )}
          </div>
        </div>
      ))}
      {status === 'thinking' && (
        <div className="flex justify-start mb-4">
          <div className="bg-purple-900 p-3 rounded-lg">
            <ThinkingAnimation />
            <p className="text-center text-purple-200">GM is thinking...</p>
          </div>
        </div>
      )}
    </div>
  );
};