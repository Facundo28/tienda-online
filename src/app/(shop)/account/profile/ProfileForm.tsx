"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import { Camera, Save, Loader2, Store } from "lucide-react";
import { toast } from "sonner";
import { updateProfile } from "@/app/(shop)/account/actions";
import { ImageCropper } from "@/components/ImageCropper";

// Actually updateProfile is in ./actions.ts relative to page. We might need to import it from parent or keep it there.
// If updateProfile is "use server", we can pass it as prop or import it.
// Let's assume we import the action string or function.

interface ProfileFormProps {
  user: {
    name: string;
    email: string;
    phone: string | null;
    phoneCountryCode: string | null;
    avatarUrl: string | null;
    isVerified: boolean;
  };
  updateProfileAction: any; // Server Action
}

function normalizeImageSrc(src: string) {
  if (src.startsWith("http")) return src;
  if (src.startsWith("/")) return src;
  return `/${src}`;
}

export function ProfileForm({ user, updateProfileAction }: ProfileFormProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [croppedImageBlob, setCroppedImageBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    user.avatarUrl ? normalizeImageSrc(user.avatarUrl) : null
  );
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Hidden input to actually send the cropped file
  const finalInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result?.toString() || null);
        // Clear value so same file can be selected again if needed
        e.target.value = ""; 
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (croppedBlob: Blob) => {
    setCroppedImageBlob(croppedBlob);
    
    // Create a Preview URL
    const url = URL.createObjectURL(croppedBlob);
    setPreviewUrl(url);

    // Prepare for Form Submission
    // We can't easily set value of file input programmatically for security, 
    // BUT we can use DataTransfer to set it on a fresh input or the same one.
    if (finalInputRef.current) {
        const file = new File([croppedBlob], "avatar-cropped.jpg", { type: "image/jpeg" });
        const container = new DataTransfer();
        container.items.add(file);
        finalInputRef.current.files = container.files;
    }

    // Close Cropper
    setImageSrc(null);
  };

  const onCancel = () => {
    setImageSrc(null);
  };

  return (
    <>
      {imageSrc && (
        <ImageCropper 
            imageSrc={imageSrc} 
            onCropComplete={onCropComplete} 
            onCancel={onCancel} 
        />
      )}

      <form className="mt-6 grid gap-6" action={updateProfileAction}>
          
          {/* Avatar Section */}
          <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
            <div className="relative h-20 w-20 overflow-hidden rounded-full border bg-gray-50 ring-2 ring-white shadow">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt={user.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                  unoptimized={previewUrl.startsWith("blob:")} // Needed for blob preview
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-gray-400">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-900 mb-1">Foto de Perfil</label>
              <div className="flex items-center gap-3">
                  {/* Visual Button mimicking input */}
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    Subir Imagen
                  </button>
                  
                  {/* Hidden Real Inputs */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  
                  {/* The input that actually gets sent with name="avatar" */}
                  <input 
                    ref={finalInputRef}
                    type="file" 
                    name="avatar" 
                    className="hidden"
                  />
              </div>
              <p className="mt-1 text-xs text-gray-500">Puedes recortar y ajustar la imagen antes de subirla.</p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
              <div className="grid gap-1.5">
                <label className="text-sm font-medium text-gray-700" htmlFor="name">
                  Nombre Completo
                </label>
                <input
                  id="name"
                  name="name"
                  defaultValue={user.name}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-[#12753e] focus:border-[#12753e]"
                  required
                />
              </div>

              <div className="grid gap-1.5">
                <label className="text-sm font-medium text-gray-700" htmlFor="email">
                  Email (Cuenta)
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={user.email}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-[#12753e] focus:border-[#12753e]"
                  placeholder="ejemplo@email.com"
                />
              </div>

              <div className="grid gap-1.5">
                <label className="text-sm font-medium text-gray-700" htmlFor="CustomerPhone">
                  Teléfono
                </label>
                <div className="flex gap-2">
                    <select
                        name="phoneCountryCode"
                        defaultValue={user.phoneCountryCode || "+54"}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-[#12753e] focus:border-[#12753e] bg-gray-50 max-w-[100px]"
                    >
                        <option value="+54">🇦🇷 +54</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+52">🇲🇽 +52</option>
                        <option value="+55">🇧🇷 +55</option>
                        <option value="+56">🇨🇱 +56</option>
                        <option value="+57">🇨🇴 +57</option>
                        <option value="+58">🇻🇪 +58</option>
                        <option value="+598">🇺🇾 +598</option>
                        <option value="+595">🇵🇾 +595</option>
                        <option value="+51">🇵🇪 +51</option>
                        <option value="+34">🇪🇸 +34</option>
                    </select>
                    <input
                      id="CustomerPhone"
                      name="customerPhone"
                      defaultValue={user.phone ?? ""}
                      placeholder="11 1234 5678"
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-[#12753e] focus:border-[#12753e]"
                    />
                  </div>
               </div>
          </div>
           
          <div className="flex justify-end pt-4 border-t border-gray-100">
             <button
                type="submit"
                className="bg-black text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-shadow shadow-sm"
              >
                Guardar Cambios
              </button>
          </div>
      </form>
    </>
  );
}
