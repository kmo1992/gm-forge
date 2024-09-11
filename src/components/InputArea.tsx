// src/components/InputArea.tsx
import React from 'react';
import { Mic, Send } from 'lucide-react';

interface InputAreaProps {
  inputText: string;
  setInputText: (text: string) => void;
  isListening: boolean;
  toggleListening: () => void;
  hasMicrophone: boolean;
  handleSubmit: () => void;
  status: 'idle' | 'recording' | 'thinking' | 'speaking' | 'error';
}

export const InputArea: React.FC<InputAreaProps> = ({
  inputText,
  setInputText,
  isListening,
  toggleListening,
  hasMicrophone,
  handleSubmit,
  status
}) => {
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() !== '' && status === 'idle') {
      handleSubmit();
    }
  };

  return (
    <form onSubmit={onSubmit} className="relative">
      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        className="w-full p-4 pr-24 rounded-lg bg-blue-900 text-blue-200"
        placeholder="Type your action or speak..."
      />
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-2">
        <button
          type="button"
          onClick={toggleListening}
          className={`p-2 rounded-full ${isListening ? 'bg-red-600' : 'bg-purple-700'} text-white disabled:opacity-50`}
          disabled={!hasMicrophone || status !== 'idle'}
        >
          <Mic size={20} />
        </button>
        <button
          type="submit"
          className="p-2 rounded-full bg-purple-700 text-white disabled:opacity-50"
          disabled={status !== 'idle' || inputText.trim() === ''}
        >
          <Send size={20} />
        </button>
      </div>
    </form>
  );
};