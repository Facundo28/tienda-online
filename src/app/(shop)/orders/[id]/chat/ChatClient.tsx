"use client";

import { useState, useRef, useEffect } from "react";
import { ImageUpload } from "@/components/chat/ImageUpload";
import { sendMessageAction, processRefundAction, requestMediationAction, unpauseProductAction, closeClaimAction, cancelClaimAction } from "@/app/actions/chat";
import { formatCurrencyFromCents } from "@/lib/money";
import { 
    ShieldCheck, User, Gavel, DollarSign, RefreshCw, 
    AlertTriangle, CheckCircle, MessageSquare, Image as ImageIcon,
    MoreVertical, FileText
} from "lucide-react";

interface ChatClientProps {
  orderId: string;
  initialMessages: any[];
  currentUserId: string;
  isSeller: boolean;
  isAdmin: boolean;
  counterpartName: string;
  orderStatus: string;
  refundStatus: string;
  isProductPaused: boolean;
  productName: string;
  productImage?: string;
  productPrice: number;
  roleBadge: string;
  buyerName: string;
  sellerName: string;
}

export default function ChatClient({ 
  orderId, 
  initialMessages, 
  currentUserId, 
  isSeller, 
  isAdmin,
  orderStatus,
  refundStatus,
  isProductPaused,
  productName,
  productImage,
  productPrice,
  buyerName, 
  sellerName
}: ChatClientProps) {
  
  const [messages, setMessages] = useState(initialMessages);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  // Filter messages with attachments for the "Evidence" tab/section
  const evidenceMessages = messages.filter(m => m.attachmentUrl);

  useEffect(() => {
     if (scrollRef.current) {
         scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
     }
  }, [messages]);

  const handleSubmit = async (formData: FormData) => {
      setLoading(true);
      if (selectedImage) formData.append("image", selectedImage);
      try {
        const newMsg = await sendMessageAction(formData, orderId);
        if (newMsg) setMessages([...messages, newMsg]);
      } finally {
        setLoading(false);
        setSelectedImage(null);
        (document.getElementById("chat-form") as HTMLFormElement)?.reset();
      }
  };

  // Actions
  const handleRefund = async () => {
     if (confirm("¿Confirmar reembolso completo al comprador?")) await processRefundAction(orderId);
  };

  const handleCreateClaim = async () => {
     if (confirm("¿Iniciar mediación con Market E.C?")) await requestMediationAction(orderId);
  };

  const handleCloseClaim = async () => {
     if (confirm("¿Cerrar reclamo y marcar como resuelto?")) await closeClaimAction(orderId);
  };

  const handleCancelClaim = async () => {
     if (confirm("¿Cancelar reclamo?")) await cancelClaimAction(orderId);
  };

  const handleUnpause = async () => {
      await unpauseProductAction(orderId);
      alert("Stock restaurado.");
  };

  return (
    <div className="flex flex-col lg:flex-row h-full bg-white rounded-xl overflow-hidden border border-gray-200 shadow-xl">
        
        {/* LEFT COLUMN: CHAT AREA */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#e5ddd5]/30 relative">
            
            {/* Minimal Chat Header */}
            <div className="bg-white border-b px-4 py-2 flex items-center justify-between shadow-sm z-10 h-14">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-800 text-sm">Chat del Pedido</h2>
                        <p className="text-[10px] text-gray-500">#{orderId.slice(-8)}</p>
                    </div>
                </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={scrollRef}>
                <div className="flex justify-center mb-2">
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-[10px] px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Compra Protegida</span>
                    </div>
                </div>

                {messages.map((msg) => {
                    const isMe = msg.userId === currentUserId;
                    const isSystem = msg.user === null || msg.message.startsWith("[SISTEMA]");
                    const isMsgAdmin = msg.user?.role === 'ADMIN'; 
                    
                    if (isSystem) {
                        return (
                            <div key={msg.id} className="flex justify-center my-1">
                                <span className="bg-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-medium">
                                    {msg.message.replace("[SISTEMA]", "")}
                                </span>
                            </div>
                        );
                    }
                    
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%]`}>
                                    {isMsgAdmin && !isMe && (
                                        <div className="flex items-center gap-1.5 ml-1 mb-1 text-[#126e30] font-bold text-[11px] uppercase tracking-wide">
                                            <div className="bg-[#126e30] text-white rounded-full p-0.5">
                                                <ShieldCheck className="w-3 h-3" />
                                            </div>
                                            Soporte Market E.C
                                        </div>
                                    )}
                                    
                                    <div className={`rounded-lg px-3 py-2 shadow-sm text-sm relative ${
                                        isMe 
                                        ? (isAdmin ? 'bg-[#126e30] text-white rounded-tr-none' : 'bg-[#e7ffdb] text-gray-900 rounded-tr-none border border-green-200') 
                                        : (isMsgAdmin ? 'bg-white border-l-4 border-l-[#126e30] text-gray-800 shadow-md rounded-tl-none' : 'bg-white text-gray-900 rounded-tl-none border border-gray-100')
                                    }`}>
                                        {msg.attachmentUrl && (
                                            <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer">
                                            <img src={msg.attachmentUrl} alt="Adjunto" className="max-w-full h-auto rounded-md mb-1 border hover:opacity-95 transition" />
                                            </a>
                                        )}
                                        <p className="whitespace-pre-wrap leading-snug">{msg.message}</p>
                                        <span className={`text-[9px] block text-right select-none opacity-70 mt-1`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                    {!isMe && !isMsgAdmin && (
                                        <span className="text-[10px] text-gray-400 ml-1 mt-0.5">{msg.user?.name}</span>
                                    )}
                                </div>
                        </div>
                    );
                })}
            </div>

            {/* Input Area */}
            {refundStatus === 'COMPLETED' ? (
                 <div className="p-3 bg-gray-50 border-t text-center text-xs text-gray-500">⛔ Chat cerrado.</div>
            ) : (
                <div className="p-3 bg-white border-t">
                    <form id="chat-form" action={handleSubmit} className="flex items-end gap-2">
                        <ImageUpload onImageSelected={setSelectedImage} />
                        <div className="flex-1">
                            <textarea 
                                name="message" 
                                placeholder={isAdmin ? "Escribir resolución..." : "Mensaje..."}
                                className={`w-full bg-gray-100 border-0 rounded-lg px-3 py-2 text-sm focus:ring-1 outline-none resize-none h-[40px] max-h-24 min-h-[40px] ${isAdmin ? 'focus:ring-purple-500' : 'focus:ring-green-500'}`}
                                rows={1}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        e.currentTarget.form?.requestSubmit();
                                    }
                                }}
                            />
                        </div>
                        <button type="submit" disabled={loading} className={`${isAdmin ? 'bg-purple-600 hover:bg-purple-700' : 'bg-[#12753e] hover:bg-green-800'} text-white p-2 rounded-lg shadow-sm transition-all flex items-center justify-center h-[40px] w-[40px]`}>
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                            </svg>
                        </button>
                    </form>
                </div>
            )}
        </div>

        {/* RIGHT COLUMN: SIDEBAR */}
        <div className="w-full lg:w-[320px] bg-white border-l border-gray-200 overflow-y-auto flex flex-col text-sm h-full">
            
            {/* 1. PRODUCT & STATUS */}
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex gap-3 mb-3">
                     <div className="w-14 h-14 bg-white rounded border flex items-center justify-center shrink-0 overflow-hidden">
                         {productImage ? (
                             <img src={productImage.split('\n')[0]} alt={productName} className="w-full h-full object-cover" />
                         ) : <span>📦</span>}
                     </div>
                     <div className="min-w-0">
                         <h3 className="font-bold text-gray-800 text-xs leading-snug line-clamp-2">{productName}</h3>
                         <p className="text-gray-500 text-xs mt-0.5">{formatCurrencyFromCents(productPrice)}</p>
                     </div>
                </div>
                <div className="flex gap-1 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        orderStatus === 'CANCELLED' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'
                    }`}>
                        {orderStatus}
                    </span>
                    {refundStatus !== 'NONE' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-50 text-orange-600 border border-orange-100">
                            {refundStatus}
                        </span>
                    )}
                </div>
            </div>

            {/* 2. ACTIONS */}
            <div className="p-4 border-b border-gray-100 bg-white">
                <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Acciones</h4>
                  <div className="grid gap-3">
                    {isAdmin && (
                        <>
                            <button onClick={handleRefund} className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 transition-all shadow-sm active:scale-[0.98] text-sm font-medium">
                                <DollarSign className="w-4 h-4" /> Forzar Reembolso
                            </button>
                            <button onClick={handleCloseClaim} className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 py-2.5 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-[0.98] text-sm font-medium">
                                <CheckCircle className="w-4 h-4 text-gray-500" /> Cerrar Caso
                            </button>
                        </>
                    )}
                    {!isAdmin && isSeller && orderStatus !== 'COMPLETED' && refundStatus === 'NONE' && (
                         <button onClick={handleRefund} className="w-full flex items-center justify-center gap-2 bg-[#126e30] text-white py-2.5 rounded-lg hover:bg-[#0e5926] transition-all shadow-sm active:scale-[0.98] text-sm font-medium">
                            <DollarSign className="w-4 h-4" /> Devolver dinero
                        </button>
                    )}
                    {!isAdmin && !isAdmin && (
                        <>
                             <div className="p-3 bg-blue-50 rounded-lg text-blue-800 text-xs mb-2 border border-blue-100 flex items-start gap-2">
                                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                <span>Si tienes problemas con el producto, puedes solicitar ayuda aquí.</span>
                             </div>
                             <button onClick={handleCreateClaim} className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-orange-200 py-2.5 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-all shadow-sm active:scale-[0.98] text-sm font-medium">
                                <AlertTriangle className="w-4 h-4 text-orange-500" /> Solicitar Mediación
                             </button>
                             <button onClick={handleCancelClaim} className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-green-200 py-2.5 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all shadow-sm active:scale-[0.98] text-sm font-medium">
                                <CheckCircle className="w-4 h-4 text-green-600" /> Todo Resuelto
                             </button>
                        </>
                    )}
                    {isSeller && isProductPaused && orderStatus === 'CANCELLED' && (
                        <button onClick={handleUnpause} className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 py-2.5 rounded-lg hover:bg-blue-100 transition-all shadow-sm active:scale-[0.98] text-sm font-medium">
                            <RefreshCw className="w-4 h-4" /> Reactivar Publicación
                        </button>
                    )}
                </div>
            </div>

            {/* 3. PEOPLE */}
            <div className="p-4 text-xs">
                <h4 className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2">Personas</h4>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600 flex items-center gap-1"><User className="w-3 h-3"/> Vendedor</span>
                        <span className="font-medium truncate max-w-[120px]" title={sellerName}>{sellerName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600 flex items-center gap-1"><User className="w-3 h-3"/> Cliente</span>
                        <span className="font-medium truncate max-w-[120px]" title={buyerName}>{buyerName}</span>
                    </div>
                </div>
            </div>

             {/* 4. EVIDENCE */}
             {evidenceMessages.length > 0 && (
                <div className="p-4 border-t border-gray-100">
                    <h4 className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" /> Evidencia
                    </h4>
                    <div className="grid grid-cols-4 gap-2">
                        {evidenceMessages.map((m, idx) => (
                            <a key={idx} href={m.attachmentUrl} target="_blank" className="block aspect-square rounded-md overflow-hidden border border-gray-200 hover:opacity-80 transition">
                                <img src={m.attachmentUrl} alt="Evidencia" className="w-full h-full object-cover" />
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}
