import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Clipboard, Download, ChevronDown } from 'lucide-react';

interface FileViewerProps {
  files: string[];
  initialFile: string;
  onSave: (fileName: string, content: string) => void;
  onCopy: () => void;
  onDownload: () => void;
}

type FileData = {
  content: string;
  backgroundImage: string | null;
};

const FileViewer: React.FC<FileViewerProps> = ({ files, initialFile, onSave, onCopy, onDownload }) => {
  const [selectedFile, setSelectedFile] = useState<string>(initialFile);
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    setSelectedFile(initialFile);
    loadFileContent(initialFile);
  }, [initialFile]);

  const loadFileContent = (fileName: string) => {
    const savedData = localStorage.getItem(fileName);
    if (savedData) {
      const parsedData: FileData = JSON.parse(savedData);
      setContent(parsedData.content);
    } else {
      console.log('No content found for:', fileName);
      setContent('');
    }
  };

  const handleFileSelect = (fileName: string) => {
    setSelectedFile(fileName);
    loadFileContent(fileName);
    setIsDropdownOpen(false);
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      onSave(selectedFile, content);
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  return (
    <div className="bg-gray-900 rounded-lg flex flex-col h-full font-sans relative overflow-hidden">
      <div className="flex-shrink-0 flex items-center p-2 border-b border-gray-700">
        <div className="relative flex-grow mr-2">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-purple-300 bg-gray-800 rounded-md hover:bg-gray-700 focus:outline-none"
          >
            <span className="truncate">{selectedFile}</span>
            <ChevronDown size={16} />
          </button>
          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-gray-800 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {files.map((file) => (
                <button
                  key={file}
                  onClick={() => handleFileSelect(file)}
                  className="block w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  {file}
                </button>
              ))}
            </div>
          )}
        </div>
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
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  code({node, inline, className, children, ...props}) {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={tomorrow}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    )
                  },
                  h1: ({children}) => <h1 className="text-3xl font-bold mt-6 mb-4 text-purple-300">{children}</h1>,
                  h2: ({children}) => <h2 className="text-2xl font-semibold mt-5 mb-3 text-purple-200">{children}</h2>,
                  h3: ({children}) => <h3 className="text-xl font-medium mt-4 mb-2 text-purple-100">{children}</h3>,
                  p: ({children}) => <p className="mb-4 leading-relaxed">{children}</p>,
                  ul: ({children}) => <ul className="list-disc list-inside mb-4">{children}</ul>,
                  ol: ({children}) => <ol className="list-decimal list-inside mb-4">{children}</ol>,
                  li: ({children}) => <li className="mb-1">{children}</li>,
                  table: ({children}) => <table className="border-collapse table-auto w-full text-sm mb-4">{children}</table>,
                  thead: ({children}) => <thead className="bg-gray-700">{children}</thead>,
                  th: ({children}) => <th className="border border-gray-600 px-4 py-2 text-left font-medium text-purple-300">{children}</th>,
                  td: ({children}) => <td className="border border-gray-700 px-4 py-2 text-gray-300">{children}</td>,
                  hr: () => <hr className="border-gray-600 my-4" />,
                  blockquote: ({children}) => <blockquote className="border-l-4 border-purple-500 pl-4 italic my-4">{children}</blockquote>,
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