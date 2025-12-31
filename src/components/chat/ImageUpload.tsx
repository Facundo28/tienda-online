"use client";

import { useState } from "react";

export function ImageUpload({ onImageSelected }: { onImageSelected: (file: File | null) => void }) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        onImageSelected(file);
        setPreview(URL.createObjectURL(file));
    } else {
        onImageSelected(null);
        setPreview(null);
    }
  };

  return (
    <div className="relative">
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFile} 
        className="hidden" 
        id="chat-image-upload" 
      />
      <label 
        htmlFor="chat-image-upload" 
        className="cursor-pointer p-2 text-gray-500 hover:text-blue-600 transition-colors"
        title="Adjuntar imagen"
      >
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
           <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
         </svg>
      </label>
      
      {preview && (
          <div className="absolute bottom-12 left-0 w-32 h-32 bg-white p-1 rounded-lg border shadow-lg">
             <img src={preview} className="w-full h-full object-cover rounded" />
             <button 
                type="button"
                onClick={() => { setPreview(null); onImageSelected(null); }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
             >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
             </button>
          </div>
      )}
    </div>
  );
}
