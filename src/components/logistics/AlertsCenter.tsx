"use client";

import { Bell, AlertTriangle, Timer, ShieldAlert } from "lucide-react";

export type AlertType = {
    id: string;
    type: "warning" | "critical";
    title: string;
    message: string;
    time: string;
};

interface AlertsCenterProps {
    alerts: AlertType[];
}

export function AlertsCenter({ alerts }: AlertsCenterProps) {
    if (alerts.length === 0) {
        return (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-3">
                    <Bell className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900">Sin Alertas</h3>
                <p className="text-sm text-gray-400">Todo opera con normalidad.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                 <h3 className="font-bold text-gray-800 flex items-center gap-2">
                     <AlertTriangle className="w-5 h-5 text-orange-500" />
                     Centro de Alertas
                 </h3>
                 <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-bold">
                     {alerts.length}
                 </span>
            </div>
            
            <div className="space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                {alerts.map(alert => (
                    <div key={alert.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-orange-50/50 transition-colors group cursor-pointer">
                        <div className="flex justify-between items-start mb-1">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                alert.type === 'critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                                {alert.type === 'critical' ? 'Crítico' : 'Atención'}
                            </span>
                            <span className="text-[10px] text-gray-400">{alert.time}</span>
                        </div>
                        <h4 className="font-bold text-gray-900 text-sm mb-0.5 flex items-center gap-1.5">
                             {alert.type === 'critical' ? <ShieldAlert className="w-3.5 h-3.5" /> : <Timer className="w-3.5 h-3.5" />}
                             {alert.title}
                        </h4>
                        <p className="text-xs text-gray-500 leading-snug">
                            {alert.message}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
