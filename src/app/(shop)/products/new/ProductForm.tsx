"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Image from "next/image";
import { formatCurrencyFromCents } from "@/lib/money";
import { toast } from "sonner";
import { Loader2, Upload, X, ImageIcon, Package, Info } from "lucide-react";

type ProductFormProps = {
  user?: any;
  action: (formData: FormData) => Promise<void>;
  initialData?: {
    name: string;
    description: string;
    price: number; // in cents or standard? Form usually takes standard. Let's assume standard input flow.
    // Actually, initialData usually comes from DB (priceCents).
    priceCents: number;
    stock: number;
    category: string;
    condition: string;
    imageUrl: string | null;
    isBoosted?: boolean;
    isActive?: boolean;
  };
  isEditing?: boolean;
};

export default function ProductForm({ user, action, initialData, isEditing = false }: ProductFormProps) {
  const [isPending, startTransition] = useTransition();
  
  // Parse initial images
  const initialUrls = initialData?.imageUrl 
    ? initialData.imageUrl.split('\n').filter(Boolean)
    : [];

  // State
  const [name, setName] = useState(initialData?.name || "");
  const [price, setPrice] = useState(initialData?.priceCents ? (initialData.priceCents / 100).toString() : "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [category, setCategory] = useState(initialData?.category || "OTROS");
  const [stock, setStock] = useState(initialData?.stock?.toString() || "1");
  const [condition, setCondition] = useState(initialData?.condition || "NEW");
  const [isBoosted, setIsBoosted] = useState(initialData?.isBoosted || false);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  // Image State
  const [existingUrls, setExistingUrls] = useState<string[]>(initialUrls);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newFilePreviews, setNewFilePreviews] = useState<string[]>([]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      newFilePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [newFilePreviews]);

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const files = Array.from(e.target.files);
        // Validation
        const invalidToken = files.find(f => f.size > 10 * 1024 * 1024);
        if (invalidToken) {
            toast.error(`La imagen ${invalidToken.name} supera los 10MB.`);
            return;
        }

        const currentCount = existingUrls.length + newFiles.length;
        if (currentCount + files.length > 5) {
             toast.error("Máximo 5 imágenes permitidas.");
             return;
        }
        
        const newPreviews = files.map(f => URL.createObjectURL(f));
        setNewFiles(prev => [...prev, ...files]);
        setNewFilePreviews(prev => [...prev, ...newPreviews]);
        
        e.target.value = "";
    }
  };

  const removeExisting = (index: number) => {
      setExistingUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeNew = (index: number) => {
      setNewFiles(prev => prev.filter((_, i) => i !== index));
      URL.revokeObjectURL(newFilePreviews[index]);
      setNewFilePreviews(prev => prev.filter((_, i) => i !== index));
  };
  
  const totalImages = existingUrls.length + newFiles.length;
  // Use first available image for main preview
  const mainPreviewUrl = newFilePreviews[0] || existingUrls[0] || "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      
      if (totalImages === 0) {
          toast.error("Debes subir al menos una imagen.");
          return;
      }

      const formData = new FormData(e.currentTarget);
      
      // Append manually managed state
      formData.set("isBoosted", isBoosted ? "true" : "false");
      formData.set("isActive", isActive ? "true" : "false"); // Using explicit true/false string
      
      // Append kept existing URLs
      formData.set("imageUrl", existingUrls.join("\n"));
      
      // Append new files
      // Clear native 'image' input if any (we used a controlled input but it might have trash)
      formData.delete("image"); 
      formData.delete("images"); // Clear just in case
      newFiles.forEach(file => {
          formData.append("images", file);
      });

      startTransition(async () => {
          try {
              await action(formData);
              // toast.success handled by redirect usually or component unmount
          } catch (error) {
              console.error(error);
              toast.error("Error al guardar el producto.");
          }
      });
  };

  const currentPriceVal = parseFloat(price || "0");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Form */}
        <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50">
                <div className="mb-6 border-b border-gray-100 pb-4">
                    <h2 className="text-2xl font-bold text-gray-900">{isEditing ? "Editar Producto" : "Nueva Publicación"}</h2>
                    <p className="text-gray-500 text-sm">Completa la información para que tu producto destaque.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Switch: Active/Pause (Only for Edit) */}
                    {isEditing && (
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                             <div className={`w-10 h-6 flex items-center bg-gray-300 rounded-full p-1 cursor-pointer transition-colors ${isActive ? 'bg-green-500' : ''}`} onClick={() => setIsActive(!isActive)}>
                                 <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${isActive ? 'translate-x-4' : ''}`}></div>
                             </div>
                             <span className="text-sm font-medium text-gray-700">{isActive ? "Publicación Activa" : "Publicación Pausada"}</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-bold text-gray-700">Título</label>
                            <input 
                                name="name" 
                                required 
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" 
                                placeholder="Ej. PlayStation 5 Edición Digital" 
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <div className="grid gap-2">
                                <label className="text-sm font-bold text-gray-700">Precio</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-3 text-gray-500 text-sm">$</span>
                                    <input 
                                        name="price" 
                                        type="number" 
                                        required 
                                        value={price}
                                        onChange={e => setPrice(e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono font-bold text-lg" 
                                        placeholder="0.00" 
                                    />
                                </div>
                             </div>
                             <div className="grid gap-2">
                                <label className="text-sm font-bold text-gray-700">Stock</label>
                                <div className="relative">
                                    <Package className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                                    <input 
                                        name="stock" 
                                        type="number" 
                                        required 
                                        value={stock}
                                        onChange={e => setStock(e.target.value)}
                                        min="0"
                                        className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono" 
                                        placeholder="1" 
                                    />
                                </div>
                             </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <div className="grid gap-2">
                                <label className="text-sm font-bold text-gray-700">Condición</label>
                                <select 
                                    name="condition" 
                                    value={condition}
                                    onChange={e => setCondition(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="NEW">Nuevo</option>
                                    <option value="USED">Usado</option>
                                    <option value="REFURBISHED">Reacondicionado</option>
                                </select>
                             </div>
                             <div className="grid gap-2">
                                <label className="text-sm font-bold text-gray-700">Categoría</label>
                                <select 
                                    name="category" 
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="OTROS">Otros</option>
                                    <option value="INDUMENTARIA">Indumentaria</option>
                                    <option value="TECNOLOGIA">Tecnología</option>
                                    <option value="VEHICULOS">Vehículos</option>
                                    <option value="HOGAR">Hogar</option>
                                    <option value="INMUEBLES">Inmuebles</option>
                                    <option value="SERVICIOS">Servicios</option>
                                </select>
                             </div>
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-bold text-gray-700">Descripción</label>
                            <textarea 
                                name="description" 
                                required 
                                rows={6} 
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none" 
                                placeholder="Describe las características principales..." 
                            ></textarea>
                        </div>
                    </div>

                    {/* Image Grid */}
                    <div className="space-y-3">
                         <div className="flex items-center justify-between">
                             <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                 <ImageIcon className="w-4 h-4 text-blue-600" />
                                 Fotos ({totalImages}/5)
                             </label>
                             <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">Máx 10MB c/u</span>
                         </div>
                         
                         <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                             {/* Existing */}
                             {existingUrls.map((url, idx) => (
                                 <div key={`exist-${idx}`} className="relative group aspect-square rounded-lg border overflow-hidden">
                                     <img src={url} className="w-full h-full object-cover" />
                                     <button type="button" onClick={() => removeExisting(idx)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                         <X className="w-3 h-3" />
                                     </button>
                                 </div>
                             ))}
                             {/* New */}
                             {newFilePreviews.map((url, idx) => (
                                 <div key={`new-${idx}`} className="relative group aspect-square rounded-lg border overflow-hidden ring-2 ring-blue-500/20">
                                     <img src={url} className="w-full h-full object-cover" />
                                     <button type="button" onClick={() => removeNew(idx)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                         <X className="w-3 h-3" />
                                     </button>
                                     <span className="absolute bottom-1 right-1 text-[8px] bg-blue-600 text-white px-1 rounded">NUEVA</span>
                                 </div>
                             ))}
                             
                             {/* Add Btn */}
                             {totalImages < 5 && (
                                 <label className="aspect-square flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer">
                                     <Upload className="w-5 h-5 text-gray-400 mb-1" />
                                     <span className="text-[10px] uppercase font-bold text-gray-400">Subir</span>
                                     <input type="file" accept="image/*" multiple className="hidden" onChange={handleFilesSelected} />
                                 </label>
                             )}
                         </div>
                    </div>
                
                    {/* Boost Option (Only New or not boosted?) Let's keep simpler logic for now */}
                    <div 
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative overflow-hidden ${isBoosted ? 'border-[#12753e] bg-green-50 shadow-inner' : 'border-gray-100 hover:border-gray-200'}`} 
                        onClick={() => setIsBoosted(!isBoosted)}
                    >
                         <div className="flex items-center justify-between relative z-10">
                             <div className="flex items-center gap-3">
                                 <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${isBoosted ? 'bg-[#12753e] border-[#12753e]' : 'border-gray-300 bg-white'}`}>
                                     {isBoosted && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>}
                                 </div>
                                 <div>
                                     <h3 className="font-bold text-gray-900">Destacar por 7 días</h3>
                                     <p className="text-xs text-gray-500">Más exposición = Más ventas</p>
                                 </div>
                             </div>
                             <span className="font-bold text-[#12753e] text-lg">$5.000</span>
                         </div>
                    </div>

                    <button 
                        disabled={isPending}
                        type="submit"
                        className="w-full bg-[#12753e] text-white py-4 rounded-xl font-bold hover:bg-[#0f5f32] shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all text-lg flex items-center justify-center gap-2"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Procesando...
                            </>
                        ) : (
                            isEditing ? "Guardar Cambios" : "Publicar Ahora"
                        )}
                    </button>
                    {!isEditing && (
                        <p className="text-xs text-center text-gray-400">
                            Al publicar aceptas los <a href="#" className="underline">términos de servicio</a>.
                        </p>
                    )}
                </form>
            </div>
        </div>

        {/* Right: Preview (Sticky) */}
        <div className="hidden lg:block">
             <div className="sticky top-8 space-y-4">
                 <div className="flex items-center gap-2 mb-2">
                     <Info className="w-4 h-4 text-gray-400" />
                     <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">Vista Previa en vivo</span>
                 </div>
                 
                 <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 max-w-sm mx-auto transform transition-transform hover:scale-[1.02] duration-500">
                     <div className="aspect-[4/3] bg-gray-50 relative flex items-center justify-center text-gray-300 overflow-hidden">
                         {mainPreviewUrl ? (
                             <img src={mainPreviewUrl} className="w-full h-full object-cover" />
                         ) : (
                             <ImageIcon className="w-16 h-16 opacity-20" />
                         )}
                         {isBoosted && (
                             <span className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
                                 DESTACADO
                             </span>
                         )}
                         <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-gray-900 shadow-sm">
                             {condition === "NEW" ? "NUEVO" : "USADO"}
                         </div>
                     </div>
                     <div className="p-6 space-y-3">
                         <div className="flex justify-between items-start">
                            <h3 className="font-bold text-gray-900 line-clamp-2 text-xl leading-tight">
                                {name || "Título de tu publicación"}
                            </h3>
                         </div>
                         <p className="text-3xl font-black text-gray-900 tracking-tight">
                            {currentPriceVal > 0 ? formatCurrencyFromCents(currentPriceVal * 100) : "$ ---"}
                         </p>
                         
                         <div className="pt-3 flex items-center gap-4 text-sm text-gray-500 border-t border-gray-50">
                             <div className="flex items-center gap-1.5 text-green-600 font-bold">
                                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13.43a.75.75 0 00-1.5 0v3.43H5.82a.75.75 0 100 1.5h3.43v3.43a.75.75 0 001.5 0v-3.43h3.43a.75.75 0 000-1.5h-3.43V4.57z" clipRule="evenodd" /></svg>
                                 Envío Gratis
                             </div>
                             <span className="text-gray-300">|</span>
                             <span>Stock: {stock}</span>
                         </div>
                         
                         <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                             {description || "La descripción de tu producto aparecerá aquí. Asegúrate de ser claro y detallado para atraer más compradores."}
                         </p>
                     </div>
                 </div>
                 
                 <div className="text-center">
                    <p className="text-xs text-gray-400">Así verán tu publicación los compradores</p>
                 </div>
             </div>
        </div>
    </div>
  );
}
