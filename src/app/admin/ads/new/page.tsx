"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, ImageIcon } from "lucide-react";
import { createAdBanner } from "../actions";
import { toast } from "sonner";

export default function NewAdPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // Simple file read for preview, in real app upload to S3/Cloudinary first or use base64
  // For simplicity MVP, let's assume direct URL input or local Base64 (limit size)
  // Actually, I'll use the File Input trick to read as DataURL for the form submission to avoid complexity of uploaders right now.
  // Ideally this should use the same uploader as products.

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/ads" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Banner</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form 
            action={async (formData) => {
                setIsSubmitting(true);
                try {
                    await createAdBanner(formData);
                    toast.success("Banner creado");
                } catch(e) {
                    toast.error("Error al crear banner");
                    setIsSubmitting(false);
                }
            }}
            className="space-y-6"
        >
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Título (Referencia)</label>
                <input name="title" required className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Ej: Promo Verano" />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Imagen URL</label>
                <div className="flex gap-2">
                    <input 
                        name="imageUrl" 
                        required 
                        className="flex-1 border rounded-lg px-3 py-2 text-sm font-mono" 
                        placeholder="https://... o /uploads/..."
                        onChange={(e) => setPreview(e.target.value)}
                    />
                </div>
                <p className="text-xs text-gray-500 mt-1">Recomendado: 1200x400px o Aspecto 3:1</p>
            </div>

            {preview && (
                <div className="aspect-[3/1] bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative">
                    <img src={preview} className="w-full h-full object-cover" onError={() => setPreview(null)} />
                </div>
            )}

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Link de Redirección (Opcional)</label>
                <input name="redirectUrl" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="https://..." />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Posición</label>
                <select name="position" className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                    <option value="HOME_MAIN">Home Principal (Carrusel)</option>
                    <option value="HOME_SECONDARY">Home Secundario</option>
                    <option value="SIDEBAR">Barra Lateral</option>
                </select>
            </div>

            <div className="pt-4">
                <button 
                    disabled={isSubmitting}
                    className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                    {isSubmitting ? 'Guardando...' : <><Save className="w-4 h-4" /> Publicar Banner</>}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}
