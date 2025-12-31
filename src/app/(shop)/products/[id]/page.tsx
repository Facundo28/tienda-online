import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { formatCurrencyFromCents } from "@/lib/money";
import { ProductBuyBox } from "@/components/products/ProductBuyBox";
import { ProductImageGallery } from "@/components/products/ProductImageGallery";
import { ProductReviews } from "@/components/products/ProductReviews";
import { answerProductQuestion, createProductQuestion } from "./actions";
import { ShieldCheck, Truck, Trophy, Star, MapPin } from "lucide-react";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { FavoriteButton } from "@/components/FavoriteButton";
import { HistoryTracker } from "@/components/products/HistoryTracker";

export const dynamic = "force-dynamic";

function normalizeImageSrc(src: string) {
  if (src.startsWith("http")) return src;
  if (src.startsWith("/")) return src;
  return `/${src}`;
}

function parseImageUrls(raw: string | null | undefined) {
  if (!raw) return [];
  return raw
    .split(/[\n,]+/g)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(normalizeImageSrc);
}

function initials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase());
  return letters.join("") || "U";
}

type ProductDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const currentUser = await requireUser();
  const { id } = await params;

  // Optimizing parallel fetching
  const [product, favorite] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            reputationTier: true,
            isVerified: true,
            bannerUrl: true,
            storeName: true,
            city: true,
            state: true,
            createdAt: true,
          },
        },
        questions: {
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            orderItems: true
          }
        }
      },
    }) as any,
    prisma.favorite.findUnique({
        where: {
            userId_productId: {
                userId: currentUser.id,
                productId: id
            }
        }
    })
  ]);

  if (!product || !product.isActive) notFound();
  
  const isFavorited = !!favorite;
  const imageUrls = parseImageUrls(product.imageUrl);
  const owner = product.user;
  const isOwner = Boolean(owner?.id && owner.id === currentUser.id);
  const questions = (product.questions ?? []);

  return (
    <div className="bg-[#ededed] min-h-screen pb-12">
      {/* Official Store Top Banner (Full Width) */}
      {/* Official Store Top Banner (Full Width) */}
      {owner?.isVerified && (
           <div className="w-full h-[160px] md:h-[260px] relative group z-10 transition-all">
               {/* Banner Image Container */}
               <div className="absolute inset-0 bg-zinc-900 overflow-hidden">
                   {owner.bannerUrl ? (
                       <Image 
                          src={owner.bannerUrl} 
                          alt={`Banner de ${owner.storeName || owner.name}`} 
                          fill 
                          className="object-cover"
                          priority
                       />
                   ) : (
                       <div className="w-full h-full bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d]" />
                   )}
                   {/* Gradient Overlay - Subtle bottom shade */}
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
               </div>

               {/* Content Container (Logo Box - Top Left) */}
               <div className="max-w-[1184px] mx-auto px-4 h-full relative">
                   <div className="absolute top-6 left-4 md:left-0 z-20">
                       <Link href={`/users/${owner.id}`} className="bg-white rounded-md p-3 shadow-sm border border-gray-200 flex items-center gap-3 hover:shadow-md transition-all max-w-[90vw] md:max-w-md group/card">
                           <div className="w-12 h-12 rounded-lg border border-gray-100 overflow-hidden relative shrink-0">
                                {owner.avatarUrl ? (
                                    <Image src={normalizeImageSrc(owner.avatarUrl)} alt={owner.name} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-xs">{initials(owner.storeName || owner.name)}</div>
                                )}
                           </div>
                           <div className="flex-1 min-w-0 pr-2 flex flex-col justify-center">
                               <div className="flex items-center gap-1.5">
                                   <h3 className="font-bold text-gray-900 text-base leading-tight truncate">{owner.storeName || owner.name}</h3>
                                   <VerifiedBadge className="w-4 h-4 text-green-600 shrink-0" />
                               </div>
                               <p className="text-xs text-green-600 hover:text-green-700 hover:underline mt-0.5 font-medium">Visita la Tienda oficial</p>
                           </div>
                       </Link>
                   </div>
               </div>
           </div>
       )}

      {/* Main Content with Negative Margin Overlap if Verified */}
      <div className={`max-w-[1184px] mx-auto px-4 relative z-20 ${owner?.isVerified ? '-mt-12 md:-mt-24' : 'pt-4'}`}>
        
        <HistoryTracker productId={id} />
       
       <div className={`mb-4 text-xs md:text-sm breadcrumbs flex flex-wrap items-center gap-2 ${owner?.isVerified ? 'text-white/90 shadow-black/50 drop-shadow-sm' : 'text-gray-500'}`}>
          <Link href="/products" className={`transition-colors font-medium ${owner?.isVerified ? 'hover:text-white' : 'hover:text-black'}`}>Volver al listado</Link>
          <span className={`${owner?.isVerified ? 'text-white/60' : 'text-gray-300'}`}>|</span>
          <span className={`line-clamp-1 ${owner?.isVerified ? 'text-white font-bold' : 'text-black font-semibold'}`}>{product.category}</span>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          
          {/* Left Column: Gallery, Description, Questions, Reviews */}
          <div className="lg:col-span-8 flex flex-col gap-4">
              
              {/* Gallery (White Box) */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                  <ProductImageGallery imageUrls={imageUrls} alt={product.name} />
              </div>

              {/* Mobile Buy Box (Visible only on mobile/tablet) */}
              <div className="lg:hidden">
                 <ProductBuyBox 
                    product={product} 
                    owner={owner} 
                    isFavorited={isFavorited} 
                    soldCount={product._count?.orderItems || 0}
                 />
              </div>

              {/* Description & Content (White Box) */}
              <div className="bg-white rounded-lg shadow-sm p-8">
                  <h3 className="text-[24px] font-normal text-gray-900 mb-6">Lo que tenés que saber de este producto</h3>
                  <div className="prose prose-slate max-w-none text-gray-600 space-y-4 whitespace-pre-line leading-relaxed text-[16px]">
                      {product.description}
                  </div>
              </div>

              {/* Questions (White Box) */}
              <div id="preguntas" className="bg-white rounded-lg shadow-sm p-8">
                <h3 className="text-[20px] font-medium text-gray-900 mb-2">Preguntas y respuestas</h3>
                <p className="text-[16px] font-semibold text-gray-900 mb-6">Preguntale al vendedor</p>

                <form
                  className="mb-8 flex gap-3 items-start"
                  action={createProductQuestion.bind(null, product.id)}
                >
                  <textarea
                    name="text"
                    className="flex-1 min-h-[48px] rounded-lg border border-gray-300 px-4 py-3 text-[16px] focus:ring-blue-500 focus:border-blue-500 resize-none shadow-sm transition-shadow placeholder:text-gray-400"
                    placeholder="Escribí tu pregunta..."
                    required
                  />
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg text-base font-semibold hover:bg-blue-600 transition-colors shadow-sm"
                  >
                    Preguntar
                  </button>
                </form>

                <h3 className="text-[18px] font-semibold text-gray-900 mb-4">Últimas realizadas</h3>

                {questions.length === 0 ? (
                  <div className="text-sm text-gray-400 italic">
                    Nadie ha preguntado todavía. ¡Sé el primero!
                  </div>
                ) : (
                  <ul className="space-y-6">
                    {questions.map((q: any) => (
                        <li key={q.id} className="group">
                          <div className="flex items-start gap-3 mb-1">
                              <span className="text-gray-800 text-[16px] leading-snug">{q.text}</span>
                          </div>
                          
                          {q.answerText ? (
                             <div className="flex items-start gap-3 pl-0 ml-0 mt-2">
                                <div className="text-[15px] text-gray-500 leading-snug">
                                  <span className="block border-l-2 border-gray-200 pl-3">
                                   {q.answerText} <span className="text-xs text-gray-400 ml-2">{new Date(q.answeredAt).toLocaleDateString()}</span>
                                  </span>
                                </div>
                             </div>
                          ) : isOwner && (
                            <form className="mt-2 pl-4" action={answerProductQuestion.bind(null, q.id)}>
                               <div className="flex gap-2">
                                  <input name="answerText" placeholder="Responder..." className="flex-1 text-sm border rounded px-2 py-1" required />
                                  <button type="submit" className="text-xs bg-blue-600 text-white px-3 py-1 rounded">Responder</button>
                               </div>
                            </form>
                          )}
                        </li>
                    ))}
                  </ul>
                )}
              </div>
              
              {/* Reviews */}
              <div id="reviews" className="bg-white rounded-lg shadow-sm p-8">
                 <ProductReviews productId={product.id} />
              </div>

          </div>

          {/* Right Column: Buy Box (Sticky - Desktop Only) */}
          <div className="hidden lg:block lg:col-span-4 relative">
             <div className="sticky top-4 flex flex-col gap-4">
                 <ProductBuyBox 
                    product={product} 
                    owner={owner} 
                    isFavorited={isFavorited} 
                    soldCount={product._count?.orderItems || 0}
                 />
             </div>
          </div>

       </div>
      </div>
    </div>
  );
}
