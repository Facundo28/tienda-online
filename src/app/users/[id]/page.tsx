import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";

import { prisma } from "@/lib/prisma";
import { formatCurrencyFromCents } from "@/lib/money";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { Package, Calendar, Star, MapPin, BadgeCheck, Facebook, Instagram, Globe } from "lucide-react";

export const dynamic = "force-dynamic";

function normalizeImageSrc(src: string) {
  if (src.startsWith("http")) return src;
  if (src.startsWith("/")) return src;
  return `/${src}`;
}

function firstImageUrl(raw: string | null) {
  if (!raw) return null;
  const first = raw
    .split(/[\n,]+/g)
    .map((s) => s.trim())
    .filter(Boolean)[0];
  return first ? normalizeImageSrc(first) : null;
}

function initials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase());
  return letters.join("") || "U";
}

type PublicUserProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function PublicUserProfilePage({
  params,
}: PublicUserProfilePageProps) {
  const { id } = await params;

  const profile = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      createdAt: true,
      city: true,
      state: true,
      isVerified: true,
      reputationTier: true,
      bannerUrl: true,
      socialInstagram: true,
      socialFacebook: true,
      socialWebsite: true,
      membershipExpiresAt: true,
      products: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          description: true,
          priceCents: true,
          imageUrl: true,
        },
      },
    },
  });

  if (!profile) notFound();

  const avatarSrc = profile.avatarUrl
    ? normalizeImageSrc(profile.avatarUrl)
    : null;

  const isPremium = profile.membershipExpiresAt && profile.membershipExpiresAt > new Date();
  const bannerSrc = isPremium && profile.bannerUrl ? normalizeImageSrc(profile.bannerUrl) : null;

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      {/* Navigation */}
      <div className="mb-6">
        <Link 
            href="/products" 
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m15 18-6-6 6-6"/></svg>
            Volver a productos
        </Link>
      </div>

      {/* Profile Header Card */}
      <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-10 ${isPremium ? 'border-yellow-200 ring-2 ring-yellow-50' : ''}`}>
        
        {/* Banner Section */}
        <div className="h-32 md:h-48 w-full relative group bg-gray-100">
             {bannerSrc ? (
                 <Image src={bannerSrc} alt="Banner" fill className="object-cover" priority />
             ) : (
                 <div className="w-full h-full bg-gradient-to-r from-gray-100 to-gray-200"></div>
             )}
             {isPremium && !bannerSrc && (
                 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5">
                     <span className="text-white font-bold drop-shadow-md">Premium Seller</span>
                 </div>
             )}
        </div>

        <div className="px-8 pb-8 relative">
            <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 gap-6">
                {/* Avatar */}
                <div className="relative h-32 w-32 rounded-full border-4 border-white bg-white shadow-md overflow-hidden flex-shrink-0 z-10">
                    {avatarSrc ? (
                    <Image
                        src={avatarSrc}
                        alt={profile.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 128px"
                        unoptimized={avatarSrc.startsWith("/uploads/")}
                    />
                    ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-50 text-3xl font-bold text-gray-400">
                        {initials(profile.name)}
                    </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 pb-1 w-full relative">
                    {/* Socials - Top Right (Desktop) or Below (Mobile) */}
                    {isPremium && (
                        <div className="absolute top-4 right-0 hidden md:flex gap-3">
                             {profile.socialInstagram && (
                                 <a href={`https://instagram.com/${profile.socialInstagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 rounded-full text-pink-600 hover:bg-pink-50 transition-colors">
                                     <Instagram className="w-5 h-5" />
                                 </a>
                             )}
                             {profile.socialFacebook && (
                                 <a href={`https://facebook.com/${profile.socialFacebook.replace('/','')}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 rounded-full text-blue-600 hover:bg-blue-50 transition-colors">
                                     <Facebook className="w-5 h-5" />
                                 </a>
                             )}
                             {profile.socialWebsite && (
                                 <a href={profile.socialWebsite.startsWith('http') ? profile.socialWebsite : `https://${profile.socialWebsite}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 rounded-full text-gray-600 hover:bg-gray-100 transition-colors">
                                     <Globe className="w-5 h-5" />
                                 </a>
                             )}
                        </div>
                    )}

                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        {profile.name}
                        {profile.isVerified && <VerifiedBadge />}
                        {isPremium && <Star className="w-6 h-6 text-yellow-500 fill-current" />}
                    </h1>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-full">
                            <Calendar className="w-3.5 h-3.5" /> 
                            Miembro desde {profile.createdAt.getFullYear()}
                        </span>
                        {(profile.city || profile.state) && (
                            <span className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-full">
                                <MapPin className="w-3.5 h-3.5" /> 
                                {profile.city}, {profile.state}
                            </span>
                        )}
                         <span className="flex items-center gap-1.5 bg-yellow-50 text-yellow-700 border border-yellow-200/50 px-2.5 py-1 rounded-full font-medium">
                            <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" /> 
                            Vendedor Confiable
                        </span>
                    </div>

                    {/* Socials Mobile Row */}
                    {isPremium && (
                        <div className="flex md:hidden gap-4 mt-4 border-t border-gray-50 pt-3">
                             {profile.socialInstagram && (
                                 <a href={`https://instagram.com/${profile.socialInstagram}`} target="_blank" rel="noopener noreferrer" className="text-pink-600">
                                     <Instagram className="w-5 h-5" />
                                 </a>
                             )}
                             {profile.socialFacebook && (
                                 <a href={`https://facebook.com/${profile.socialFacebook}`} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                                     <Facebook className="w-5 h-5" />
                                 </a>
                             )}
                             {profile.socialWebsite && (
                                 <a href={profile.socialWebsite} target="_blank" rel="noopener noreferrer" className="text-gray-600">
                                     <Globe className="w-5 h-5" />
                                 </a>
                             )}
                        </div>
                    )}
                </div>

                 {/* Stats */}
                 <div className="flex items-center gap-8 border-l border-gray-100 pl-8 hidden md:flex">
                     <div className="text-center">
                         <div className="text-2xl font-bold text-gray-900">{profile.products.length}</div>
                         <div className="text-xs text-gray-500 uppercase tracking-wide">Publicaciones</div>
                     </div>
                     <div className="text-center">
                         <div className="text-2xl font-bold text-[#12753e]">100%</div>
                         <div className="text-xs text-gray-500 uppercase tracking-wide">Recomendado</div>
                     </div>
                 </div>
            </div>
        </div>
      </div>

      {/* Products Grid */}
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Package className="w-5 h-5 text-gray-400" />
          Publicaciones del vendedor
      </h2>

      {profile.products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">Este usuario no tiene publicaciones activas por el momento.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-2 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 bg-gray-50/50 sm:bg-transparent p-2 sm:p-0 rounded-xl">
          {profile.products.map((p: any) => {
            const imageSrc = firstImageUrl(p.imageUrl);

            return (
              <li
                key={p.id}
                className="group relative bg-white rounded-xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden border border-gray-100"
              >
                <Link
                  href={`/products/${p.id}`}
                  className="absolute inset-0 z-10"
                  aria-label={`Ver ${p.name}`}
                />
                
                {/* Image Section */}
                <div className="relative aspect-square w-full bg-white border-b border-gray-50 flex items-center justify-center p-8">
                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt={p.name}
                      fill
                      className="object-contain transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 20vw"
                      unoptimized={imageSrc.startsWith("/uploads/")}
                    />
                  ) : (
                    <div className="text-xs text-gray-300 font-medium">Sin imagen</div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                        <div className="font-normal text-2xl text-[#12753e]">
                          {formatCurrencyFromCents(p.priceCents)}
                        </div>
                        
                         {!p.priceCents || p.priceCents <= 500000 ? (
                            <p className="text-xs text-green-600 font-bold mt-1">
                                5% OFF
                            </p>
                         ): null}
                        
                        <h3 className="mt-3 text-sm font-bold text-gray-900 line-clamp-2 leading-relaxed group-hover:text-[#12753e] transition-colors">
                            {p.name}
                        </h3>
                    </div>

                    {/* Seller Info (Same styles as Home) */}
                    <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-2">
                        <div className="relative w-5 h-5 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                            {profile.avatarUrl ? (
                                <Image src={normalizeImageSrc(profile.avatarUrl)} alt={profile.name} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-gray-400">
                                    {profile.name?.charAt(0).toUpperCase() || "V"}
                                </div>
                            )}
                        </div>
                        <span className="text-xs text-gray-400 truncate flex-1 leading-none">
                            {profile.name}
                        </span>
                        {profile.isVerified && (
                            <BadgeCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                        )}
                    </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
