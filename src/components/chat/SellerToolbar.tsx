"use client";

export function SellerToolbar({ orderId, onRefund, onMediation }: { orderId: string, onRefund: () => void, onMediation: () => void }) {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="border-t bg-gray-50 p-2 flex gap-2">
       <button 
         onClick={() => setShowOptions(!showOptions)}
         className="text-xs font-semibold text-gray-600 hover:bg-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
       >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
          </svg>
          Gestionar Reclamo
       </button>
       
       {showOptions && (
           <div className="flex gap-2 animate-in slide-in-from-left-2 items-center">
               <div className="h-4 w-px bg-gray-300 mx-1"></div>
               <button 
                  onClick={onRefund} 
                  className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded-lg font-medium transition-colors"
               >
                   Devolver dinero
               </button>
               <button 
                  onClick={onMediation}
                  className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 rounded-lg font-medium transition-colors"
               >
                   Pedir mediación
               </button>
           </div>
       )}
    </div>
  );
}

import { useState } from "react";
