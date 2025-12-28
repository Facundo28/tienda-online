"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface Notification {
  id: string;
  title: string;
  description: string;
  href: string;
  date: Date;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error' | string;
}

export function NotificationsMenu({ notifications }: { notifications: Notification[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="hover:opacity-100 opacity-90 relative p-1 outline-none flex items-center justify-center"
        aria-label="Notificaciones"
      >
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
         </svg>
         {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full border border-[#12753e]"></span>
         )}
      </button>

      {isOpen && (
        <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
            <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden text-gray-800 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                <div className="absolute -top-2 right-3 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-white"></div>
                
                <div className="bg-[#12753e] text-white px-4 py-3 text-sm font-semibold flex justify-between items-center shadow-sm">
                    <span>Notificaciones</span>
                    {unreadCount > 0 && <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">{unreadCount} nuevas</span>}
                </div>

                <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                        <div className="py-10 px-8 text-center text-gray-500 text-sm flex flex-col items-center gap-2">
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 opacity-20">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                             </svg>
                            <p>No tienes notificaciones nuevas.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {notifications.map((n) => (
                                <li key={n.id} className={`hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50/20' : ''}`}>
                                    <Link href={n.href} className="block px-4 py-3" onClick={() => setIsOpen(false)}>
                                        <div className="flex gap-3">
                                            <div className="pt-1 shrink-0">
                                               {n.type === 'success' && <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm shadow-green-200"></div>}
                                               {n.type === 'warning' && <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-200"></div>}
                                               {n.type === 'info' && <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-200"></div>}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{n.title}</p>
                                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{n.description}</p>
                                                <p className="text-[10px] text-gray-400 mt-1.5 capitalize font-medium">
                                                    {formatDistanceToNow(n.date, { addSuffix: true, locale: es })}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="p-2 text-center border-t border-gray-100 bg-gray-50/50">
                      <Link href="/orders" className="text-xs text-[#3483fa] font-medium hover:underline">Ver mis compras</Link>
                </div>
            </div>
        </>
      )}
    </div>
  );
}
