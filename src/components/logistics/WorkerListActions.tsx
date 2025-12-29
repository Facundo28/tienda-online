"use client";

import { useState } from "react";
import { MoreHorizontal, Trash2, Ban, CheckCircle } from "lucide-react";
import { deleteWorkerAction, toggleWorkerStatusAction } from "@/app/(logistics)/logistics/actions";
import { toast } from "sonner";

interface WorkerListActionsProps {
    workerId: string;
    isActive: boolean;
}

export function WorkerListActions({ workerId, isActive }: WorkerListActionsProps) {
    const [loading, setLoading] = useState(false);

    async function handleToggle() {
        if (loading) return;
        setLoading(true);
        try {
            await toggleWorkerStatusAction(workerId, !isActive);
            toast.success(isActive ? "Conductor desactivado" : "Conductor activado");
        } catch (e) {
            toast.error("Error al cambiar estado");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete() {
        if (loading || !confirm("¿Estás seguro de eliminar este conductor? Esta acción no se puede deshacer.")) return;
        setLoading(true);
        try {
            await deleteWorkerAction(workerId);
            toast.success("Conductor eliminado");
        } catch (e) {
            toast.error("Error al eliminar conductor");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="relative group/actions">
             <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                 <MoreHorizontal className="w-5 h-5" />
             </button>

             {/* Dropdown Menu */}
             <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 p-1 hidden group-hover/actions:block z-20 animate-in fade-in zoom-in-95 duration-200">
                 <button 
                    onClick={handleToggle}
                    disabled={loading}
                    className="w-full text-left px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg flex items-center gap-2"
                 >
                     {isActive ? (
                         <>
                            <Ban className="w-4 h-4 text-orange-500" /> Desactivar Acceso
                         </>
                     ) : (
                         <>
                            <CheckCircle className="w-4 h-4 text-green-600" /> Activar Acceso
                         </>
                     )}
                 </button>
                 <div className="h-px bg-gray-50 my-1"></div>
                 <button 
                    onClick={handleDelete}
                    disabled={loading}
                    className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                 >
                     <Trash2 className="w-4 h-4" /> Eliminar
                 </button>
             </div>
        </div>
    );
}
