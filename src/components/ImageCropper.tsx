"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/cropImage";
import { X, Check } from "lucide-react";

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
  aspect?: number;
  cropShape?: "rect" | "round";
}

export function ImageCropper({ imageSrc, onCropComplete, onCancel, aspect = 1, cropShape = "round" }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onCropCompleteHandler = useCallback(
    (_croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleSave = async () => {
    try {
        if (!croppedAreaPixels) return;
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedImage) {
        onCropComplete(croppedImage);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-black/90 text-white animate-in fade-in duration-200">
      <div className="flex items-center justify-between px-6 py-4 bg-black/50 backdrop-blur-sm fixed top-0 left-0 right-0 z-10">
        <h3 className="font-semibold text-lg">Ajustar Imagen</h3>
        <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
        </button>
      </div>

      <div className="relative flex-1 w-full bg-gray-900">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          cropShape={cropShape}
          showGrid={true}
          onCropChange={onCropChange}
          onCropComplete={onCropCompleteHandler}
          onZoomChange={onZoomChange}
        />
      </div>

      <div className="bg-black/80 backdrop-blur-md px-6 py-8 pb-10 flex flex-col gap-6">
         <div className="max-w-md mx-auto w-full flex items-center gap-4">
            <span className="text-xs font-medium text-gray-400">Zoom</span>
            <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => {
                    setZoom(Number(e.target.value));
                }}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#12753e]"
            />
         </div>

         <div className="max-w-md mx-auto w-full flex items-center justify-center gap-4">
             <button 
                onClick={onCancel}
                className="px-6 py-2.5 rounded-full font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
             >
                Cancelar
             </button>
             <button 
                onClick={handleSave}
                className="px-8 py-2.5 rounded-full font-bold bg-[#12753e] hover:bg-[#0f5f32] text-white flex items-center gap-2 shadow-lg hover:shadow-green-900/20 transition-all transform hover:scale-105"
             >
                <Check className="w-4 h-4" />
                Guardar Foto
             </button>
         </div>
      </div>
    </div>
  );
}
