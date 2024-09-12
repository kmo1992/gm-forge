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
    console.log('Loaded content:', savedContent); // Debugging line
    if (savedContent) {
      setContent(savedContent);
    } else {
      console.log('No content found for:', fileName); // Debugging line
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
    <div className="bg-gray-900 rounded-lg flex-grow flex flex-col font-sans">
      <div className="flex justify-between items-center p-2 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-purple-300 w-1/3">{fileName}</h3>
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
      <div className="flex-grow overflow-y-auto p-4">
        {isEditing ? (
          <textarea
            value={content}
            onChange={handleChange}
            className="w-full h-full p-2 bg-gray-800 text-white rounded resize-none font-sans"
          />
        ) : (
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown
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
        )}
      </div>
      <div className="flex justify-end space-x-2 p-2 border-t border-gray-700">
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