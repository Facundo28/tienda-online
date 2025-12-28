"use client";

import { useState } from "react";
import Image from "next/image";
import { formatCurrencyFromCents } from "@/lib/money";

export default function ProductForm({ user, createProductAction }: any) {
  const [formData, setFormData] = useState({
      name: "",
      price: "",
      description: "",
      category: "OTROS",
      imageUrl: "",
  });
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isBoosted, setIsBoosted] = useState(false);

  const handleChange = (e: any) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const currentPrice = parseFloat(formData.price || "0");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Form */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-xl font-bold mb-4">Detalles de la Publicación</h2>
                <form action={createProductAction} className="space-y-4">
                    <input type="hidden" name="isBoosted" value={isBoosted ? "true" : "false"} />
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">Nombre del producto</label>
                        <input 
                            name="name" 
                            required 
                            className="w-full border rounded-lg px-3 py-2 text-sm" 
                            placeholder="Ej. iPhone 15 Pro Max" 
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Precio (ARS)</label>
                            <input 
                                name="price" 
                                type="number" 
                                required 
                                className="w-full border rounded-lg px-3 py-2 text-sm" 
                                placeholder="0.00" 
                                onChange={handleChange}
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium mb-1">Categoría</label>
                            <select name="category" className="w-full border rounded-lg px-3 py-2 text-sm bg-white" onChange={handleChange}>
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

                    <div>
                        <label className="block text-sm font-medium mb-1">Descripción Detallada</label>
                        <textarea 
                            name="description" 
                            required 
                            rows={8} 
                            className="w-full border rounded-lg px-3 py-2 text-sm resize-none" 
                            placeholder="Describe tu producto con detalle..." 
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Fotos del Producto</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition cursor-pointer relative">
                             <input 
                                type="file" 
                                name="image" 
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleImageChange}
                             />
                             <div className="space-y-2 pointer-events-none">
                                 <div className="text-4xl">📸</div>
                                 <p className="text-sm text-gray-500 font-medium">Click o arrastra tu imagen aquí</p>
                                 <p className="text-xs text-gray-400">JPG, PNG, WebP (Máx 5MB)</p>
                             </div>
                        </div>
                    </div>
                    
                    {/* Boost Toggle */}
                    <div className={`p-4 rounded-xl border-2 transition-colors cursor-pointer ${isBoosted ? 'border-[#12753e] bg-green-50' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => setIsBoosted(!isBoosted)}>
                         <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                 <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${isBoosted ? 'bg-[#12753e] border-[#12753e]' : 'border-gray-300 bg-white'}`}>
                                     {isBoosted && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>}
                                 </div>
                                 <div>
                                     <h3 className="font-bold text-gray-900">Destacar por 7 días</h3>
                                     <p className="text-xs text-gray-500">Aumenta exposición y ventas por $5.000</p>
                                 </div>
                             </div>
                             <span className="font-bold text-[#12753e]">$5.000</span>
                         </div>
                    </div>

                    <button className="w-full bg-[#12753e] text-white py-3 rounded-lg font-bold hover:bg-[#0f5f32] shadow-lg shadow-green-900/10">
                        Publicar Producto
                    </button>
                    <p className="text-xs text-center text-gray-400">
                        Al publicar aceptas los términos y condiciones.
                    </p>
                </form>
            </div>
        </div>

        {/* Right: Preview */}
        <div className="hidden lg:block space-y-4">
             <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Vista Previa</h2>
             <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 max-w-sm mx-auto sticky top-8">
                 <div className="aspect-square bg-gray-100 relative flex items-center justify-center text-gray-400">
                     {previewUrl ? (
                         <img src={previewUrl} className="w-full h-full object-cover" />
                     ) : (
                         <span className="text-4xl opacity-20">📷</span>
                     )}
                     {isBoosted && (
                         <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                             DESTACADO
                         </span>
                     )}
                 </div>
                 <div className="p-4 space-y-2">
                     <p className="text-2xl font-light text-gray-900">
                        {currentPrice > 0 ? formatCurrencyFromCents(currentPrice * 100) : "$ ---"}
                     </p>
                     <h3 className="font-medium text-gray-800 line-clamp-2">
                         {formData.name || "Título de tu publicación"}
                     </h3>
                     <div className="pt-2 flex items-center gap-2 text-xs text-green-600">
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13.43a.75.75 0 00-1.5 0v3.43H5.82a.75.75 0 100 1.5h3.43v3.43a.75.75 0 001.5 0v-3.43h3.43a.75.75 0 000-1.5h-3.43V4.57z" clipRule="evenodd" /></svg>
                         Envío Gratis
                     </div>
                     <p className="text-xs text-gray-500 line-clamp-3 pt-2 border-t border-gray-50">
                         {formData.description || "Aquí aparecerá la descripción de tu producto..."}
                     </p>
                 </div>
             </div>
        </div>
    </div>
  );
}
