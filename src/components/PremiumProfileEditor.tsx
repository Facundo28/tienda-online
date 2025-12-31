"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera, Save, Globe, Facebook, Instagram, LayoutTemplate, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { ImageCropper } from "@/components/ImageCropper";
import { updateUserPremiumProfile } from "@/app/(shop)/account/actions"; // We will create this

interface PremiumProfileEditorProps {
    user: {
        id: string;
        bannerUrl?: string | null;
        storeName?: string | null;
        socialInstagram?: string | null;
        socialFacebook?: string | null;
        socialWebsite?: string | null;
        socialWhatsapp?: string | null;
        aboutText?: string | null;
    }
}

export function PremiumProfileEditor({ user }: PremiumProfileEditorProps) {
    const [isEditing, setIsEditing] = useState(false);
    
    // Form State
    const [instagram, setInstagram] = useState(user.socialInstagram || "");
    const [facebook, setFacebook] = useState(user.socialFacebook || "");
    const [website, setWebsite] = useState(user.socialWebsite || "");
    const [whatsapp, setWhatsapp] = useState(user.socialWhatsapp || "");
    const [storeName, setStoreName] = useState(user.storeName || "");
    const [aboutText, setAboutText] = useState(user.aboutText || "");
    
    const [previewBanner, setPreviewBanner] = useState<string | null>(user.bannerUrl || null);
    const [bannerBlob, setBannerBlob] = useState<Blob | null>(null);
    
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
        setBannerBlob(croppedBlob);
        setCropImageSrc(null); // Close cropper
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        const formData = new FormData();
        formData.append("instagram", instagram);
        formData.append("facebook", facebook);
        formData.append("website", website);
        formData.append("whatsapp", whatsapp);
        formData.append("storeName", storeName);
        formData.append("aboutText", aboutText);
        
        if (bannerBlob) {
            const file = new File([bannerBlob], "banner.jpg", { type: "image/jpeg" });
            formData.append("banner", file);
        }

        try {
            await updateUserPremiumProfile(formData);
            toast.success("Perfil Premium actualizado");
            setIsEditing(false);
        } catch (e: any) {
            toast.error(e.message || "Error al guardar cambios");
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header branding */}
            <div className="bg-[#12753e] text-white px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                     <LayoutTemplate className="w-5 h-5" />
                     <h2 className="font-bold text-lg tracking-wide">Personalización de Tienda Oficial</h2>
                </div>
                {!isEditing && (
                    <button 
                        onClick={() => setIsEditing(true)} 
                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm"
                    >
                        Editar Perfil
                    </button>
                )}
            </div>

            {/* Banner Section */}
            <div className="relative group bg-gray-50 border-b border-gray-100 transition-colors hover:bg-gray-100">
                <div className="relative w-full h-[180px] sm:h-[240px] flex items-center justify-center overflow-hidden">
                    {previewBanner ? (
                        <img 
                            src={previewBanner} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                            alt="Vista previa del banner" 
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-3 text-gray-400">
                            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                                <Camera className="w-8 h-8 opacity-50" />
                            </div>
                            <span className="text-sm font-medium">Sube tu Banner (1920x480 recomendado)</span>
                        </div>
                    )}

                    {/* Overlay Action */}
                    <div className={`absolute inset-0 bg-black/40 transition-opacity flex items-center justify-center ${previewBanner ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                        <label className="cursor-pointer bg-white text-[#12753e] px-6 py-3 rounded-full font-bold text-sm shadow-xl hover:scale-105 transition-transform flex items-center gap-2">
                            <Camera className="w-4 h-4" />
                            {previewBanner ? "Cambiar Imagen de Fondo" : "Subir Imagen de Fondo"}
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={!isEditing && !!previewBanner} />
                        </label>
                    </div>
                </div>
            </div>

            <div className="p-6 sm:p-8">
                {isEditing ? (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-8">
                        
                        {/* Section: Basic Info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2 mb-4">Información del Negocio</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre de la Tienda</label>
                                    <input 
                                        value={storeName}
                                        onChange={(e) => setStoreName(e.target.value)}
                                        placeholder="Ej. Adidas Official Store"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#12753e] focus:border-[#12753e] outline-none transition-all placeholder:text-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp de Contacto</label>
                                    <div className="relative">
                                        <MessageCircle className="absolute left-3.5 top-2.5 w-5 h-5 text-gray-400" />
                                        <input 
                                            value={whatsapp}
                                            onChange={(e) => setWhatsapp(e.target.value)}
                                            placeholder="54911..."
                                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#12753e] focus:border-[#12753e] outline-none transition-all placeholder:text-gray-400"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Sobre Nosotros</label>
                                <textarea 
                                    value={aboutText}
                                    onChange={(e) => setAboutText(e.target.value)}
                                    placeholder="Describe tu negocio, horarios de atención, o qué te hace único..."
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#12753e] focus:border-[#12753e] outline-none transition-all min-h-[100px] resize-y placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        {/* Section: specific links */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2 mb-4">Redes Sociales y Web</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-500">Instagram</label>
                                    <div className="relative group/input">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Instagram className="h-4 w-4 text-gray-400 group-focus-within/input:text-[#12753e] transition-colors" />
                                        </div>
                                        <input
                                            value={instagram}
                                            onChange={(e) => setInstagram(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#12753e] focus:border-transparent transition-all"
                                            placeholder="usuario_insta"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-500">Facebook</label>
                                    <div className="relative group/input">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Facebook className="h-4 w-4 text-gray-400 group-focus-within/input:text-[#12753e] transition-colors" />
                                        </div>
                                        <input
                                            value={facebook}
                                            onChange={(e) => setFacebook(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#12753e] focus:border-transparent transition-all"
                                            placeholder="paginafacebook"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-500">Sitio Web</label>
                                    <div className="relative group/input">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Globe className="h-4 w-4 text-gray-400 group-focus-within/input:text-[#12753e] transition-colors" />
                                        </div>
                                        <input
                                            value={website}
                                            onChange={(e) => setWebsite(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#12753e] focus:border-transparent transition-all"
                                            placeholder="https://mitienda.com"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                             <button 
                                onClick={() => setIsEditing(false)}
                                className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                             >
                                 Cancelar
                             </button>
                             <button 
                                onClick={handleSubmit} 
                                disabled={isSaving}
                                className="bg-[#12753e] hover:bg-[#0e5e32] text-white px-8 py-2.5 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all transform active:scale-95 flex items-center gap-2"
                             >
                                 {isSaving ? (
                                     <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                                        Guardando...
                                     </>
                                 ) : (
                                     <>
                                        <Save className="w-4 h-4" />
                                        Guardar Cambios
                                     </>
                                 )}
                             </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                         {/* Display Mode */}
                         <div className="flex flex-col md:flex-row gap-8">
                             <div className="flex-1 space-y-4">
                                <h3 className="text-xl font-bold text-gray-900">{storeName || user.storeName || "Tu Tienda Oficial"}</h3>
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    {aboutText || user.aboutText || "Sin descripción definida. Agrega una descripción para contarle a tus clientes sobre tu negocio."}
                                </p>
                                
                                <div className="pt-4 flex flex-wrap gap-3">
                                    {whatsapp && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                            <MessageCircle className="w-3.5 h-3.5" /> {whatsapp}
                                        </span>
                                    )}
                                    {instagram && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-pink-50 text-pink-700 border border-pink-100">
                                            <Instagram className="w-3.5 h-3.5" /> @{instagram}
                                        </span>
                                    )}
                                    {facebook && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                            <Facebook className="w-3.5 h-3.5" /> /{facebook}
                                        </span>
                                    )}
                                    {website && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-100">
                                            <Globe className="w-3.5 h-3.5" /> {website}
                                        </span>
                                    )}
                                </div>
                             </div>
                             
                             <div className="md:w-64 shrink-0 flex flex-col gap-3">
                                 <a 
                                    href={`/users/${user.id}`} 
                                    target="_blank"
                                    className="w-full bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-4 py-3 rounded-xl font-bold text-center transition-all flex items-center justify-center gap-2 shadow-sm"
                                 >
                                     <LayoutTemplate className="w-4 h-4" />
                                     Ver Tienda Pública
                                 </a>
                                 <div className="bg-blue-50 p-4 rounded-xl text-xs text-blue-800 leading-relaxed">
                                     <span className="font-bold block mb-1">Tip de Venta:</span>
                                     Mantén tu banner actualizado con ofertas de temporada para atraer más clientes.
                                 </div>
                             </div>
                         </div>
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
