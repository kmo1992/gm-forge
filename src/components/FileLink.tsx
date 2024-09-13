// src/components/FileLink.tsx
import React from 'react';

interface FileLinkProps {
  fileName: string;
  onClick: () => void;
}

export const FileLink: React.FC<FileLinkProps> = ({ fileName, onClick }) => {
  return (
    <div className="font-sans relative my-2">
      <button 
        className="border border-gray-300 bg-gray-100 hover:border-gray-400 flex items-stretch rounded-lg text-left transition-all hover:shadow-sm active:scale-[0.9875] w-full"
        aria-label="Preview contents"
        onClick={onClick}
      >
        <div className="bg-gray-200 text-gray-600 flex items-center justify-center rounded-l-lg w-14 border-r border-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
            <path d="M96,104a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H104A8,8,0,0,1,96,104Zm8,40h64a8,8,0,0,0,0-16H104a8,8,0,0,0,0,16Zm128,48a32,32,0,0,1-32,32H88a32,32,0,0,1-32-32V64a16,16,0,0,0-32,0c0,5.74,4.83,9.62,4.88,9.66h0A8,8,0,0,1,24,88a7.89,7.89,0,0,1-4.79-1.61h0C18.05,85.54,8,77.61,8,64A32,32,0,0,1,40,32H176a32,32,0,0,1,32,32V168h8a8,8,0,0,1,4.8,1.6C222,170.46,232,178.39,232,192ZM96.26,173.48A8.07,8.07,0,0,1,104,168h88V64a16,16,0,0,0-16-16H67.69A31.71,31.71,0,0,1,72,64V192a16,16,0,0,0,32,0c0-5.74-4.83-9.62-4.88-9.66A7.82,7.82,0,0,1,96.26,173.48ZM216,192a12.58,12.58,0,0,0-3.23-8h-94a26.92,26.92,0,0,1,1.21,8,31.82,31.82,0,0,1-4.29,16H200A16,16,0,0,0,216,192Z"></path>
          </svg>
        </div>
        <div className="min-w-0 flex-1 px-4 py-3">
          <div className="break-words text-sm font-medium leading-tight text-gray-800">{fileName}</div>
          <div className="text-gray-500 line-clamp-1 text-xs">Click to open document</div>
        </div>
      </button>
    </div>
  );
};