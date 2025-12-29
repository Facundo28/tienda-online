"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera, Save, Globe, Facebook, Instagram, LayoutTemplate } from "lucide-react";
import { toast } from "sonner";
import { ImageCropper } from "@/components/ImageCropper";
import { updateUserPremiumProfile } from "@/app/account/actions"; // We will create this

interface PremiumProfileEditorProps {
    user: {
        bannerUrl?: string | null;
        socialInstagram?: string | null;
        socialFacebook?: string | null;
        socialWebsite?: string | null;
    }
}

export function PremiumProfileEditor({ user }: PremiumProfileEditorProps) {
    const [isEditing, setIsEditing] = useState(false);
    
    // Form State
    const [instagram, setInstagram] = useState(user.socialInstagram || "");
    const [facebook, setFacebook] = useState(user.socialFacebook || "");
    const [website, setWebsite] = useState(user.socialWebsite || "");
    const [previewBanner, setPreviewBanner] = useState<string | null>(user.bannerUrl || null);
    
    // Cropper State
    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setCropImageSrc(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        // Create object URL for preview
        const url = URL.createObjectURL(croppedBlob);
        setPreviewBanner(url);
        setCropImageSrc(null); // Close cropper
        
        // Convert Blob to File for formData potentially, or just keep it for submit
        // For simplicity now, we will upload on Save Changes
        // Actually, to simulate upload we might need to do it here or store the blob.
        // Let's store the blob in a ref or state to upload on save.
        // BUT, for now, let's assume we upload IMMEDIATELY upon crop save to avoid complex state?
        // No, better to wait for "Guardar Cambios".
        // Use a hidden input or state. 
        // Wait, server action needs FormData. I can append the blob there.
        (window as any).__pendingBannerBlob = croppedBlob; 
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        const formData = new FormData();
        formData.append("instagram", instagram);
        formData.append("facebook", facebook);
        formData.append("website", website);
        
        const blob = (window as any).__pendingBannerBlob;
        if (blob) {
            formData.append("banner", blob, "banner.jpg");
        }

        try {
            await updateUserPremiumProfile(formData);
            toast.success("Perfil Premium actualizado");
            setIsEditing(false);
        } catch (e) {
            toast.error("Error al guardar cambios");
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-yellow-200 shadow-sm overflow-hidden mb-8">
            <div className={`relative h-48 bg-gray-100 group ${!user.bannerUrl && !previewBanner ? 'flex items-center justify-center' : ''}`}>
                {/* Banner Preview */}
                {(previewBanner) ? (
                    <img src={previewBanner} className="w-full h-full object-cover" alt="Banner" />
                ) : (
                    <div className="text-gray-400 flex flex-col items-center gap-2">
                        <LayoutTemplate className="w-10 h-10 opacity-20" />
                        <span className="text-sm font-medium">Tu Banner Personalizado</span>
                    </div>
                )}
                
                {/* Edit Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-full font-bold text-sm shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        Cambiar Banner
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                </div>
            </div>

            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            Mi Página
                            <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full border border-yellow-200 uppercase tracking-wide">Premium</span>
                        </h2>
                        <p className="text-sm text-gray-500">Personaliza cómo te ven tus clientes.</p>
                    </div>
                    {isEditing ? (
                        <div className="flex gap-2">
                             <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900 font-medium">Cancelar</button>
                             <button onClick={handleSubmit} disabled={isSaving} className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg hover:bg-gray-800 transition-all flex items-center gap-2">
                                 {isSaving ? "Guardando..." : <><Save className="w-4 h-4" /> Guardar</>}
                             </button>
                        </div>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="text-[#12753e] font-bold text-sm hover:underline">
                            Editar Información
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top-2 duration-200">
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <Instagram className="w-4 h-4" />
                            </span>
                            <input 
                                value={instagram}
                                onChange={(e) => setInstagram(e.target.value)}
                                placeholder="Usuario de Instagram"
                                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#12753e] outline-none"
                            />
                        </div>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <Facebook className="w-4 h-4" />
                            </span>
                             <input 
                                value={facebook}
                                onChange={(e) => setFacebook(e.target.value)}
                                placeholder="Usuario de Facebook"
                                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#12753e] outline-none"
                            />
                        </div>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <Globe className="w-4 h-4" />
                            </span>
                             <input 
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                placeholder="Tu Sitio Web (https://...)"
                                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#12753e] outline-none"
                            />
                        </div>
                    </div>
                ) : (
                   <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                       {instagram ? <div className="flex items-center gap-2"><Instagram className="w-4 h-4 text-pink-600" /> @{instagram}</div> : <span className="opacity-50 flex items-center gap-2"><Instagram className="w-4 h-4" /> -</span>}
                       {facebook ? <div className="flex items-center gap-2"><Facebook className="w-4 h-4 text-blue-600" /> /{facebook}</div> : <span className="opacity-50 flex items-center gap-2"><Facebook className="w-4 h-4" /> -</span>}
                       {website ? <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-gray-600" /> {website}</div> : <span className="opacity-50 flex items-center gap-2"><Globe className="w-4 h-4" /> -</span>}
                   </div>
                )}
            </div>

            {cropImageSrc && (
                <ImageCropper 
                    imageSrc={cropImageSrc}
                    aspect={4/1} 
                    cropShape="rect"
                    onCancel={() => setCropImageSrc(null)}
                    onCropComplete={handleCropComplete}
                />
            )}
        </div>
    );
}
