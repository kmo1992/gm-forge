// src/components/FileViewer.tsx
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { X, Clipboard, Download } from 'lucide-react';

interface FileViewerProps {
  fileName: string;
  onSave: (fileName: string, content: string) => void;
  onClose: () => void;
  onCopy: () => void;
  onDownload: () => void;
}

const FileViewer: React.FC<FileViewerProps> = ({ fileName, onSave, onClose, onCopy, onDownload }) => {
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const savedContent = localStorage.getItem(fileName);
    if (savedContent) {
      setContent(savedContent);
    } else {
      console.log('No content found for:', fileName);
    }
  }, [fileName]);

  const handleToggleEdit = () => {
    if (isEditing) {
      onSave(fileName, content);
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  return (
    <div className="bg-gray-900 rounded-lg flex flex-col h-full font-sans">
      <div className="flex-shrink-0 flex justify-between items-center p-2 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-purple-300 w-1/3 truncate">{fileName}</h3>
        <div className="flex items-center justify-center w-1/3">
          <div className="flex items-center bg-gray-700 rounded-md">
            <button
              onClick={() => setIsEditing(false)}
              className={`px-3 py-1 text-xs font-medium ${!isEditing ? 'bg-gray-600 text-white' : 'text-gray-300'} rounded-l-md`}
            >
              Preview
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className={`px-3 py-1 text-xs font-medium ${isEditing ? 'bg-gray-600 text-white' : 'text-gray-300'} rounded-r-md`}
            >
              Edit
            </button>
          </div>
        </div>
        <div className="flex justify-end w-1/3">
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="flex-grow overflow-hidden relative">
        {isEditing ? (
          <textarea
            value={content}
            onChange={handleChange}
            className="absolute inset-0 w-full h-full p-4 bg-gray-800 text-white resize-none font-sans scrollbar-thin overflow-y-auto"
          />
        ) : (
          <div className="absolute inset-0 overflow-y-auto scrollbar-thin bg-gray-800">
            <div className="p-4">
              <ReactMarkdown
                className="prose prose-invert max-w-none"
                components={{
                  p: ({ children }) => <p className="mb-4 font-sans">{children}</p>,
                  h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 font-sans">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-xl font-bold mb-3 font-sans">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-lg font-bold mb-2 font-sans">{children}</h3>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-4 font-sans">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-4 font-sans">{children}</ol>,
                  li: ({ children }) => <li className="mb-1 font-sans">{children}</li>,
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
      <div className="flex-shrink-0 flex justify-end space-x-2 p-2 border-t border-gray-700">
        <button onClick={onCopy} className="text-gray-400 hover:text-white transition-colors">
          <Clipboard size={16} />
        </button>
        <button onClick={onDownload} className="text-gray-400 hover:text-white transition-colors">
          <Download size={16} />
        </button>
      </div>
    </div>
  );
};

export default FileViewer;