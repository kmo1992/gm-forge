'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ChatContainer } from '@/components/ChatContainer';
import { InputArea } from '@/components/InputArea';
import FileViewer from '@/components/FileViewer';
import { useSpeechRecognition } from '@/lib/useSpeechRecognition';
import { useAudioPlayback } from '@/lib/useAudioPlayback';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import styles from './GMForge.module.css';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type FileData = {
  content: string;
  backgroundImage: string | null;
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
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState("/images/alleyway.webp");

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (selectedFile) {
      const fileData = localStorage.getItem(selectedFile);
      if (fileData) {
        const parsedData: FileData = JSON.parse(fileData);
        if (parsedData.backgroundImage) {
          setBackgroundImage(parsedData.backgroundImage);
        } else {
          setBackgroundImage("/images/alleyway.webp");
        }
      }
    }
  }, [selectedFile]);

  const handleFileCreation = (fileName: string, content: string, backgroundImage: string | null) => {
    const fileData: FileData = { content, backgroundImage };
    localStorage.setItem(fileName, JSON.stringify(fileData));
    if (!files.includes(fileName)) {
      setFiles(prev => [...prev, fileName]);
    }
    setSelectedFile(fileName);
    setIsSidebarOpen(true);
    if (backgroundImage) {
      setBackgroundImage(backgroundImage);
    }
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
          handleFileCreation(fileName, content.trim(), data.image);
          return `[File: ${fileName}]`;
        }
      );

      setMessages(prev => [...prev, { role: 'assistant', content: processedContent }]);

      setStatus('speaking');
      if (data.audio) {
        playAudio(data.audio);
      } else {
        setStatus('idle');
      }
    } catch (error) {
      console.error('Error:', error);
      setStatus('error');
    } finally {
      if (status !== 'speaking') {
        setStatus('idle');
      }
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const handleFileSave = (fileName: string, content: string) => {
    const existingData = localStorage.getItem(fileName);
    let backgroundImage = null;
    if (existingData) {
      const parsedData: FileData = JSON.parse(existingData);
      backgroundImage = parsedData.backgroundImage;
    }
    const fileData: FileData = { content, backgroundImage };
    localStorage.setItem(fileName, JSON.stringify(fileData));
    if (!files.includes(fileName)) {
      setFiles([...files, fileName]);
    }
    setSelectedFile(fileName);
  };

  const handleCopyFile = () => {
    if (selectedFile) {
      const fileData = localStorage.getItem(selectedFile);
      if (fileData) {
        const parsedData: FileData = JSON.parse(fileData);
        navigator.clipboard.writeText(parsedData.content);
      }
    }
  };

  const handleDownloadFile = () => {
    if (selectedFile) {
      const fileData = localStorage.getItem(selectedFile);
      if (fileData) {
        const parsedData: FileData = JSON.parse(fileData);
        const blob = new Blob([parsedData.content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = selectedFile;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }
  };

  return (
    <div className={styles.container}>
      <Image
        src={backgroundImage}
        alt="Dynamic background"
        fill
        style={{ objectFit: 'cover' }}
        quality={100}
        priority
        className={`${styles.backgroundImage} ${isImageLoaded ? styles.loaded : ''}`}
        onLoadingComplete={() => setIsImageLoaded(true)}
      />
      <div className={`${styles.content} ${isSidebarOpen ? 'w-1/2' : 'w-full'}`}>
        <div className={`mx-auto max-w-4xl h-full flex flex-col ${isSidebarOpen ? 'mr-0' : 'px-4'}`}>
          <div className="w-full flex-shrink-0 flex justify-between items-center p-4">
            <h1 className="text-3xl py-4 text-purple-300 font-bold font-cinzel">GM Forge</h1>
            <button
              onClick={toggleSidebar}
              className={`p-2 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 bg-purple-700 hover:bg-purple-600`}
              aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {isSidebarOpen ? (
                <ArrowRight className="w-6 h-6 text-white" />
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