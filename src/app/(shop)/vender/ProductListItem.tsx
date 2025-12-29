"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { formatCurrencyFromCents } from "@/lib/money";
import { toggleProduct, deleteProduct } from "@/app/admin/products/actions";
import { toast } from "sonner";
import { Loader2, Trash2, PauseCircle, PlayCircle, Edit } from "lucide-react";
import { useRouter } from "next/navigation";

// Simple Modal Component
function ConfirmModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    description, 
    isPending 
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    onConfirm: () => void; 
    title: string; 
    description: string;
    isPending: boolean;
}) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 mb-6 text-sm">{description}</p>
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={onClose} 
                        disabled={isPending}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={onConfirm} 
                        disabled={isPending}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
}

type Product = {
    id: string;
    name: string;
    priceCents: number;
    imageUrl: string | null;
    isActive: boolean;
};

export default function ProductListItem({ product }: { product: Product }) {
    const [isPending, startTransition] = useTransition();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const router = useRouter();

    const handleToggle = () => {
        startTransition(async () => {
            try {
                await toggleProduct(product.id, !product.isActive);
                toast.success(product.isActive ? "Publicación pausada" : "Publicación activa");
            } catch {
                toast.error("Error al cambiar estado");
            }
        });
    };

    const handleDelete = () => {
        startTransition(async () => {
            try {
                await deleteProduct(product.id);
                toast.success("Publicación eliminada");
                setShowDeleteModal(false);
                // Force refresh usually happens via server action revalidatePath, 
                // but client verification often helps feel more responsive if list removes item.
                // However, since we are listed by server page, revalidatePath is key.
            } catch {
                toast.error("Error al eliminar");
            }
        });
    };

    const firstImage = product.imageUrl?.split('\n')[0] || product.imageUrl?.split(',')[0] || "/placeholder.png";

    return (
        <>
            <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-gray-50 transition-colors group">
                {/* Image & Main Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden border border-gray-200 relative">
                         <img src={firstImage} className={`w-full h-full object-cover transition-opacity ${product.isActive ? 'opacity-100' : 'opacity-60 grayscale'}`} />
                         {!product.isActive && (
                             <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                 <PauseCircle className="w-6 h-6 text-white drop-shadow-md" />
                             </div>
                         )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                             <h3 className={`font-bold text-gray-900 truncate ${product.isActive ? '' : 'text-gray-500'}`}>{product.name}</h3>
                             <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${product.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                 {product.isActive ? 'Activa' : 'Pausada'}
                             </span>
                        </div>
                        <p className="text-sm font-medium text-gray-600">{formatCurrencyFromCents(product.priceCents)}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 ml-auto sm:ml-0 pt-2 sm:pt-0 border-t sm:border-0 border-gray-100 w-full sm:w-auto">
                    {/* Toggle Pause */}
                    <button 
                        onClick={handleToggle}
                        disabled={isPending}
                        className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium ${product.isActive ? 'text-gray-500 hover:bg-yellow-50 hover:text-yellow-700' : 'text-green-600 hover:bg-green-50'}`}
                        title={product.isActive ? "Pausar publicación" : "Reanudar publicación"}
                    >
                        {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : product.isActive ? <PauseCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                        <span className="sm:hidden">{product.isActive ? "Pausar" : "Activar"}</span>
                    </button>

                    {/* Edit */}
                    <Link 
                        href={`/products/${product.id}/edit`} 
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                        title="Editar"
                    >
                        <Edit className="w-5 h-5" />
                        <span className="sm:hidden">Editar</span>
                    </Link>

                    {/* Delete */}
                    <button 
                        onClick={() => setShowDeleteModal(true)}
                        disabled={isPending}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium group/delete"
                        title="Eliminar"
                    >
                        <Trash2 className="w-5 h-5" />
                        <span className="sm:hidden group-hover/delete:text-red-600">Eliminar</span>
                    </button>
                </div>
            </div>

            <ConfirmModal 
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="¿Eliminar publicación?"
                description="Estás a punto de eliminar este producto permanentemente. Esta acción no se puede deshacer."
                isPending={isPending}
            />
        </>
    );
}
