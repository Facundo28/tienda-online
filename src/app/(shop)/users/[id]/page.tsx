import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Calendar, Star, MessageCircle, Instagram, Facebook, Globe, AlertTriangle, BadgeCheck } from "lucide-react";
import { formatCurrencyFromCents } from "@/lib/money";

export const dynamic = "force-dynamic";

interface UserProfileProps {
    params: {
        id: string;
    };
}

function firstImageUrl(raw: string | null) {
  if (!raw) return null;
  const first = raw.split(/[\n,]+/g).map((s) => s.trim()).filter(Boolean)[0];
  return first ? (first.startsWith("http") || first.startsWith("/") ? first : `/${first}`) : null;
}

export default async function UserProfilePage({ params }: UserProfileProps) {
    const { id } = await params;
    
    // 1. Get User Data
    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            products: {
                where: { isActive: true, isDeleted: false },
                orderBy: { createdAt: "desc" },
                take: 12
            }
        }
    });

    if (!user) {
        notFound();
    }

    const bannerUrl = user.bannerUrl;
    const avatarUrl = user.avatarUrl;
    // Fallback initials
    const initials = user.name?.substring(0, 2).toUpperCase() || "EC";

    return (
        <div className="bg-white min-h-screen pb-12">
            
            {/* 1. Hero Banner */}
            <div className="relative w-full h-[120px] md:h-[180px] bg-gray-200">
                {bannerUrl ? (
                    <Image 
                        src={bannerUrl} 
                        alt="Banner" 
                        fill 
                        className="object-cover"
                        priority 
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-gray-800 to-gray-900 flex items-center justify-center">
                        <span className="text-gray-600 font-bold text-2xl opacity-20 uppercase tracking-widest">
                            Official Store
                        </span>
                    </div>
                )}
                
                {/* Back Button Removed - Now integrated into Shop Layout */}
                
                <div className="absolute inset-0 bg-black/20" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
                
                {/* 2. Profile Card */}
                <div className="relative mb-8 flex flex-col md:flex-row items-start md:items-end gap-6 pb-6 border-b border-gray-100">
                    
                    {/* Avatar - Pulled up to overlap banner */}
                    <div className="-mt-16 md:-mt-20 w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white relative z-10 shrink-0 mx-auto md:mx-0">
                        {avatarUrl ? (
                            <Image src={avatarUrl} alt={user.name} fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-3xl font-bold text-gray-400">
                                {initials}
                            </div>
                        )}
                    </div>

                    {/* Info - Starts BELOW the banner (no negative margin) */}
                    <div className="flex-1 text-center md:text-left w-full mt-4">
                        {user.isVerified && (
                             <p className="text-[10px] font-bold text-black uppercase tracking-widest mb-1 opacity-80">
                                 Tienda oficial
                             </p>
                        )}
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center justify-center md:justify-start gap-2 mb-1">
                            {user.name}
                            {user.isVerified && <BadgeCheck className="w-5 h-5 text-blue-500" />}
                        </h1>
                        <p className="text-gray-600 text-xs md:text-sm flex items-center justify-center md:justify-start gap-4">
                            <span className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 opacity-70" />
                                {user.city || "Argentina"}, {user.state || "Capital"}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-gray-300 hidden md:block" />
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 opacity-70" />
                                Se unió en {new Date(user.createdAt).getFullYear()}
                            </span>
                        </p>
                        
                        {/* About Text */}
                        {user.aboutText && (
                            <p className="mt-3 text-sm text-gray-700 max-w-2xl leading-relaxed mx-auto md:mx-0">
                                {user.aboutText}
                            </p>
                        )}
                    </div>

                    {/* 3. Action / Socials */}
                    <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto mt-4 md:mt-0">
                        
                        {/* WhatsApp / Contact Main Button */}
                        {user.socialWhatsapp && (
                            <a 
                                href={`https://wa.me/${user.socialWhatsapp}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-[#25D366] hover:bg-[#128C7E] text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-green-200 transition-all hover:scale-105 flex items-center gap-2"
                            >
                                <MessageCircle className="w-5 h-5 fill-current" />
                                Contactar por WhatsApp
                            </a>
                        )}

                        {/* Disclaimer Only if external contact is available */}
                        {user.socialWhatsapp && (
                            <div className="flex items-center gap-1.5 text-[10px] text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100">
                                <AlertTriangle className="w-3 h-3" />
                                Compras fuera de Market E.C no están protegidas.
                            </div>
                        )}

                        <div className="flex items-center gap-3 mt-1">
                            {user.socialInstagram && (
                                <a href={`https://instagram.com/${user.socialInstagram}`} target="_blank" className="p-2 bg-gray-50 rounded-full text-pink-600 hover:bg-pink-50 transition-colors">
                                    <Instagram className="w-5 h-5" />
                                </a>
                            )}
                            {user.socialFacebook && (
                                <a href={`https://facebook.com/${user.socialFacebook}`} target="_blank" className="p-2 bg-gray-50 rounded-full text-blue-600 hover:bg-blue-50 transition-colors">
                                    <Facebook className="w-5 h-5" />
                                </a>
                            )}
                             {user.socialWebsite && (
                                <a href={user.socialWebsite} target="_blank" className="p-2 bg-gray-50 rounded-full text-gray-600 hover:bg-gray-100 transition-colors">
                                    <Globe className="w-5 h-5" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* 4. Products Grid */}
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    Productos en Venta
                    <span className="text-sm font-normal text-gray-500">({user.products.length})</span>
                </h2>

                {user.products.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                         {user.products.map((p: any) => {
                            const imageSrc = firstImageUrl(p.imageUrl);
                            const href = `/products/${p.id}`; // Public route

                            return (
                                <div
                                key={p.id}
                                className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden border border-gray-100"
                                >
                                <Link
                                    href={href}
                                    className="absolute inset-0 z-10"
                                    aria-label={`Ver ${p.name}`}
                                />

                                {/* Image Section */}
                                <div className="relative aspect-square w-full bg-white border-b border-gray-50 flex items-center justify-center p-6">
                                    {imageSrc ? (
                                    <Image
                                        src={imageSrc}
                                        alt={p.name}
                                        fill
                                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 20vw"
                                    />
                                    ) : (
                                    <div className="text-xs text-gray-300 font-medium">Sin imagen</div>
                                    )}
                                </div>

                                {/* Content Section */}
                                <div className="p-3 flex-1 flex flex-col">
                                     <div className="font-normal text-xl text-[#12753e]">
                                        {formatCurrencyFromCents(p.priceCents)}
                                     </div>
                                     <h3 className="mt-2 text-xs font-medium text-gray-700 line-clamp-2 leading-relaxed group-hover:text-[#12753e] transition-colors">
                                        {p.name}
                                     </h3>
                                </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-500">Este vendedor aún no ha publicado productos.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
