// src/app/GMForge.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatContainer } from '@/components/ChatContainer';
import { InputArea } from '@/components/InputArea';
import FileViewer from '@/components/FileViewer';
import { useSpeechRecognition } from '@/lib/useSpeechRecognition';
import { useAudioPlayback } from '@/lib/useAudioPlayback';
import { PanelRightOpen, FileText } from 'lucide-react';

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
    // Not checking for duplicates for now
    // if (!files.includes(fileName)) {
      setFiles(prev => [...prev, fileName]);
      localStorage.setItem(fileName, content);
    // }
  };

  const handleFileClick = (fileName: string) => {
    setIsSidebarOpen(true);
    setSelectedFile(fileName);
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
        // Regular expression to match the [File: ...] line and the content between triple backticks
        /\[File: (.+?\.md)\]\n```(?:markdown)?\n([\s\S]+?)\n```/g, 
        (match, fileName, content) => {
          
          // Explanation of regex:
          // \[File: (.+?\.md)\]      : Matches the [File: filename.md] line. 
          //                            The filename (ending in .md) is captured using (.+?\.md).
          // \n                       : Matches the newline after the file declaration.
          // ```(?:markdown)?\n       : Matches the opening triple backticks, optionally with the word 'markdown', followed by a newline.
          // ([\s\S]+?)\n```          : Captures everything between the triple backticks (including line breaks).
          //                            [\s\S] matches any character (whitespace and non-whitespace), and the content is captured non-greedily (.+?).

          // Call the function to handle the file creation
          handleFileCreation(fileName, content.trim());
          
          // Replace the file content with a placeholder in the format [File: filename.md]
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
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleFileSelect = (fileName: string) => {
    setSelectedFile(fileName);
  };

  const handleFileSave = (fileName: string, content: string) => {
    localStorage.setItem(fileName, content);
    if (!files.includes(fileName)) {
      setFiles([...files, fileName]);
    }
  };

  const handleCloseFile = () => {
    setSelectedFile(null);
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
      
      {/* Sidebar toggle button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 right-4 z-50 bg-purple-700 hover:bg-purple-600 text-white p-2 rounded-full shadow-lg"
      >
        <PanelRightOpen size={24} />
      </button>

      {/* Sidebar */}
      <div 
        className={`fixed right-0 top-0 h-full bg-gray-800 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-1/2' : 'w-0'
        } overflow-hidden font-sans`}
      >
        <div className="p-4 h-full flex flex-col">
          <h2 className="text-xl font-bold mb-4 text-purple-300">Files</h2>
          <ul className="mb-4">
            {files.map((file) => (
              <li 
                key={file} 
                className="mb-2 cursor-pointer flex items-center"
                onClick={() => handleFileSelect(file)}
              >
                <FileText size={16} className="mr-2" />
                <span className={selectedFile === file ? 'text-purple-300' : 'text-gray-300'}>
                  {file}
                </span>
              </li>
            ))}
          </ul>
          {selectedFile && (
            <div className="flex-grow flex flex-col">
              <FileViewer 
                fileName={selectedFile} 
                onSave={handleFileSave}
                onClose={handleCloseFile}
                onCopy={handleCopyFile}
                onDownload={handleDownloadFile}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}