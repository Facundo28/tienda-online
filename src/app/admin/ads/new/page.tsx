"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, ImageIcon } from "lucide-react";
import { createAdBanner } from "../actions";
import { toast } from "sonner";
import { ImageCropper } from "@/components/ImageCropper";

export default function NewAdPage() {
  console.log("NewAdPage mounting...");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [croppedFile, setCroppedFile] = useState<Blob | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImg(reader.result as string);
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (croppedBlob: Blob) => {
    setCroppedFile(croppedBlob);
    setPreview(URL.createObjectURL(croppedBlob));
    setCropModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Submitting form...");
    toast.loading("Procesando...", { id: "submit-toast" });
    setIsSubmitting(true);
    
    // Explicitly construct FormData to ensure cropped file is included
    const formData = new FormData(e.currentTarget);
    
    if (croppedFile) {
        formData.set("imageFile", croppedFile, "banner.jpg");
    }

    try {
        await createAdBanner(formData);
        toast.dismiss("submit-toast");
        toast.success("Banner creado");
        // Force client-side redirect to ensure state refresh
        window.location.href = "/admin/ads";
    } catch(e) {
        console.error(e);
        toast.dismiss("submit-toast");
        toast.error("Error al crear banner: " + (e as Error).message);
        setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/ads" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Banner</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Título (Referencia)</label>
                <input name="title" required className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Ej: Promo Verano" />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Imagen del Banner</label>
                
                <div 
                    onClick={() => document.getElementById('banner-upload')?.click()}
                    className="cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-8 transition-colors hover:border-[#12753e] hover:bg-green-50 flex flex-col items-center justify-center text-center gap-3 group"
                >
                    {preview ? (
                        <div className="w-full aspect-[6/1] relative overflow-hidden rounded-lg shadow-sm bg-gray-100">
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white font-medium flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5" /> Cambiar Imagen
                                </span>
                             </div>
                        </div>
                    ) : (
                        <>
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-white transition-colors">
                                <ImageIcon className="w-6 h-6 text-gray-400 group-hover:text-[#12753e]" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Haz clic para subir imagen</p>
                                <p className="text-xs text-gray-500">JPG, PNG, WebP (Máx 10MB)</p>
                            </div>
                        </>
                    )}
                </div>
                
                <input 
                    id="banner-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileSelect}
                />
            </div>

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
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                    {isSubmitting ? 'Guardando...' : <><Save className="w-4 h-4" /> Publicar Banner</>}
                </button>
            </div>
        </form>
      </div>

       {cropModalOpen && selectedImg && (
        <ImageCropper
          imageSrc={selectedImg}
          aspect={6 / 1} 
          cropShape="rect"
          onCropComplete={onCropComplete}
          onCancel={() => setCropModalOpen(false)}
        />
      )}
    </div>
  );
}
