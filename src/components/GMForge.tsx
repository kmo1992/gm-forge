'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatContainer } from '@/components/ChatContainer';
import { InputArea } from '@/components/InputArea';
import FileViewer from '@/components/FileViewer';
import { useSpeechRecognition } from '@/lib/useSpeechRecognition';
import { useAudioPlayback } from '@/lib/useAudioPlayback';
import { ArrowLeft, ArrowRight } from 'lucide-react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function GMForge() {
  const [status, setStatus] = useState<'idle' | 'recording' | 'thinking' | 'speaking' | 'error'>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const { isListening, toggleListening, hasMicrophone } = useSpeechRecognition(setInputText);
  const { playAudio } = useAudioPlayback(() => setStatus('idle'));
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileCreation = (fileName: string, content: string) => {
    localStorage.setItem(fileName, content);
    if (!files.includes(fileName)) {
      setFiles(prev => [...prev, fileName]);
    }
    setSelectedFile(fileName);
    setIsSidebarOpen(true);
  };

  const handleFileClick = (fileName: string) => {
    setSelectedFile(fileName);
    setIsSidebarOpen(true);
  };

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

      // Process the response for file creations
      const processedContent = data.text.replace(
        /\[File: (.+?\.md)\]\n```(?:markdown)?\n([\s\S]+?)\n```/g, 
        (match, fileName, content) => {
          handleFileCreation(fileName, content.trim());
          return `[File: ${fileName}]`;
        }
      );

      setMessages(prev => [...prev, { role: 'assistant', content: processedContent }]);
      
      setStatus('speaking');
      playAudio(data.audio);
    } catch (error) {
      console.error('Error:', error);
      setStatus('error');
    } finally {
      setStatus('idle');
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const handleFileSave = (fileName: string, content: string) => {
    localStorage.setItem(fileName, content);
    if (!files.includes(fileName)) {
      setFiles([...files, fileName]);
    }
    setSelectedFile(fileName);
  };

  const handleCopyFile = () => {
    const content = localStorage.getItem(selectedFile!);
    if (content) {
      navigator.clipboard.writeText(content);
    }
  };

  const handleDownloadFile = () => {
    const content = localStorage.getItem(selectedFile!);
    if (content) {
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedFile}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-gray-100 flex font-sans">
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'w-1/2' : 'w-full'}`}>
        <div className={`mx-auto max-w-4xl h-full flex flex-col ${isSidebarOpen ? 'mr-0' : 'px-4'}`}>
          <div className="w-full flex-shrink-0 flex justify-between items-center p-4">
            <h1 className="text-3xl py-4 text-purple-300 font-bold font-cinzel">GM Forge</h1>
            {/* Sidebar toggle button */}
            <button
              onClick={toggleSidebar}
              className={`p-2 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 bg-purple-700 hover:bg-purple-600`}
              aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {isSidebarOpen ? (
                // Option 1: Using PanelLeftClose icon
                <ArrowRight className="w-6 h-6 text-white" />
                
                // Option 2: Using X icon with reduced stroke width
                // <X className="w-6 h-6 text-white" strokeWidth={1.5} />
              ) : (
                <ArrowLeft className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
          <div 
            ref={chatContainerRef}
            className="flex-grow overflow-y-auto px-4"
          >
            <div className="w-full pb-24">
              <ChatContainer 
                messages={messages} 
                status={status} 
                onFileClick={handleFileClick}
              />
            </div>
          </div>
          <div className="w-full bg-gradient-to-b from-transparent to-gray-900 px-4">
            <div className="py-4">
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
      </div>

      {/* Sidebar */}
      <div 
        className={`fixed right-0 top-0 h-full bg-gray-800 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-1/2' : 'w-0'
        } overflow-hidden font-sans`}
      >
        <div className="p-4 h-full flex flex-col">
          {selectedFile && (
            <FileViewer 
              files={files}
              initialFile={selectedFile}
              onSave={handleFileSave}
              onCopy={handleCopyFile}
              onDownload={handleDownloadFile}
            />
          )}
        </div>
      </div>
    </div>
  );
}