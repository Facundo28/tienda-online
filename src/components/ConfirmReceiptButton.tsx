"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";
import { confirmReceiptAction } from "@/app/actions/chat";

interface ConfirmReceiptButtonProps {
    orderId: string;
    isDelivered: boolean;
    fundsReleased: boolean;
}

export function ConfirmReceiptButton({ orderId, isDelivered, fundsReleased }: ConfirmReceiptButtonProps) {
    const [isPending, startTransition] = useTransition();

    const handleConfirm = () => {
        const confirmed = window.confirm("¿Confirmas que has recibido el pedido correctamente? Se liberará el dinero al vendedor.");
        if (!confirmed) return;

        startTransition(async () => {
            try {
                await confirmReceiptAction(orderId);
                toast.success("¡Recepción confirmada! Gracias por tu compra.");
            } catch (error) {
                toast.error("Error al confirmar recepción.");
            }
        });
    };

    if (fundsReleased) {
        return (
            <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl border border-green-200 flex items-center justify-center gap-2 font-medium w-full">
                <CheckCircle2 className="w-5 h-5" />
                Compra Completada
            </div>
        );
    }

    if (!isDelivered) {
        // If not marked as delivered by courier/system yet, we shouldn't allow confirmation just yet? 
        // Or maybe we DO allow it if they got it early? 
        // MercadoLibre allows "Ya tengo el producto" even if system says "On Way".
        // Let's allow it but warn.
        // Actually, let's allow it always.
    }

    return (
        <button
            onClick={handleConfirm}
            disabled={isPending}
            className="w-full bg-[#12753e] hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-md transition-all hover:shadow-lg flex items-center justify-center gap-2"
        >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            Confirmar Recepción
        </button>
    );
}
