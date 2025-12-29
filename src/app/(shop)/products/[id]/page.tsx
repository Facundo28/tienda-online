import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { formatCurrencyFromCents } from "@/lib/money";
import { AddToCartButton } from "@/components/AddToCartButton";
import { BuyNowButton } from "@/components/BuyNowButton";
import { ProductImageGallery } from "@/components/ProductImageGallery";
import { ProductReviews } from "@/components/ProductReviews";
import { answerProductQuestion, createProductQuestion } from "./actions";
import { ShieldCheck, Truck, Trophy, Star, MapPin } from "lucide-react";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { FavoriteButton } from "@/components/FavoriteButton";

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
    <section className="max-w-[1200px] mx-auto px-4 py-6">
       
       <div className="mb-4 text-sm breadcrumbs text-gray-500 flex items-center gap-2">
          <Link href="/products" className="hover:text-black transition-colors font-medium">Volver al listado</Link>
          <span className="text-gray-300">|</span>
          <span className="text-black font-semibold">{product.category}</span>
       </div>

       <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 grid grid-cols-1 md:grid-cols-[1.5fr_1fr] lg:grid-cols-[2fr_1fr] gap-6 lg:gap-10">
          
          {/* Left Column: Gallery & Description */}
          <div className="flex flex-col gap-10">
              
              {/* Gallery */}
              <div className="w-full">
                  <ProductImageGallery imageUrls={imageUrls} alt={product.name} />
              </div>

              <hr className="border-gray-100" />

              {/* Description */}
              <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-6">Lo que tenés que saber de este producto</h3>
                  <div className="prose prose-sm max-w-none text-gray-600 space-y-4 whitespace-pre-line leading-relaxed">
                      {product.description}
                  </div>
              </div>

              <hr className="border-gray-100" />

              {/* Questions */}
              <div id="preguntas">
                <h3 className="text-xl font-medium text-gray-900 mb-2">Preguntas y respuestas</h3>
                <p className="text-sm text-gray-500 mb-6">Preguntale al vendedor si tenés dudas.</p>

                <form
                  className="mb-8 flex gap-3 items-start"
                  action={createProductQuestion.bind(null, product.id)}
                >
                  <textarea
                    name="text"
                    className="flex-1 min-h-[50px] rounded-xl border border-gray-300 px-4 py-3 text-sm focus:ring-[#12753e] focus:border-[#12753e] resize-none shadow-sm"
                    placeholder="Escribí tu pregunta..."
                    required
                  />
                  <button
                    type="submit"
                    className="bg-[#12753e] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#0e5e32] transition-colors shadow-sm"
                  >
                    Preguntar
                  </button>
                </form>

                {questions.length === 0 ? (
                  <div className="text-sm text-gray-400 italic">
                    Nadie ha preguntado todavía. ¡Sé el primero!
                  </div>
                ) : (
                  <ul className="space-y-6">
                    {questions.map((q: any) => (
                        <li key={q.id} className="group">
                          <div className="flex items-start gap-3 mb-2">
                              <span className="text-gray-800 text-sm">{q.text}</span>
                          </div>
                          
                          {q.answerText ? (
                             <div className="flex items-start gap-3 pl-3 border-l-2 border-gray-200 ml-1">
                                <div className="text-sm text-gray-500">
                                   {q.answerText} <span className="text-xs text-gray-400 ml-2">{new Date(q.answeredAt).toLocaleDateString()}</span>
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
              
              <hr className="border-gray-100" />

              {/* Reviews */}
              <div id="reviews">
                 <ProductReviews productId={product.id} />
              </div>

          </div>

          {/* Right Column: Buy Box */}
          <div className="flex flex-col gap-4">
               <div className="border border-[#12753e]/40 rounded-xl p-5 bg-white relative overflow-hidden">
                   {/* Condition & Sold */}
                   <div className="text-xs text-gray-500 mb-3 flex items-center gap-2">
                       <span>{product.condition === 'NEW' ? 'Nuevo' : 'Usado'}</span>
                       <span className="text-gray-300">|</span>
                       <span>100 vendidos</span>
                   </div>

                   {/* Title */}
                   <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-4 text-balance">
                       {product.name}
                   </h1>

                   {/* Price - GREEN AND BOLD */}
                   <div className="text-4xl font-normal text-[#12753e] mb-4">
                       {formatCurrencyFromCents(product.priceCents)}
                   </div>

                   {/* 5% OFF Banner like Home */}
                   {!product.priceCents || product.priceCents <= 500000 ? (
                        <div className="mb-4">
                             <span className="text-xs bg-[#12753e]/10 text-[#12753e] font-bold px-2 py-1 rounded">5% OFF con transferencia</span>
                        </div>
                   ): null}

                   {/* Stock */}
                   <div className="mb-6 font-medium text-sm text-gray-900">
                       {product.stock > 0 ? (
                           <span className="text-gray-900">Stock disponible: {product.stock}</span>
                       ) : (
                            <span className="text-red-500">Sin stock</span>
                       )}
                   </div>

                   {/* Buttons */}
                   <div className="flex flex-col gap-3">
                       <BuyNowButton
                         product={{
                           id: product.id,
                           name: product.name,
                           priceCents: product.priceCents,
                         }}
                         className="w-full bg-[#12753e] hover:bg-[#0e5e32] text-white font-semibold py-3.5 rounded-lg transition-colors text-[15px]" 
                       />
                       <AddToCartButton
                         product={{
                           id: product.id,
                           name: product.name,
                           priceCents: product.priceCents,
                         }}
                         className="w-full bg-[#e8f5e9] text-[#12753e] font-semibold py-3.5 rounded-lg hover:bg-[#c8e6c9] transition-colors text-[15px]"
                       />
                   </div>

                    {/* Favorite Button Absolute */}
                    <div className="absolute top-4 right-4">
                        <FavoriteButton 
                            productId={product.id} 
                            initialIsFavorited={isFavorited}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50" 
                        />
                    </div>
               </div>

               {/* Seller Info */}
               <div className="border border-gray-200 rounded-xl p-5 bg-white">
                   <h4 className="text-sm font-medium text-gray-900 mb-4">Información del vendedor</h4>
                   
                   {owner ? (
                        <div className="flex items-start gap-3 mb-4">
                            <div className="relative w-10 h-10 rounded-full border border-gray-100 bg-gray-50 overflow-hidden">
                                {owner.avatarUrl ? (
                                    <Image src={normalizeImageSrc(owner.avatarUrl)} alt={owner.name} fill className="object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-sm font-bold text-gray-400">{initials(owner.name)}</div>
                                )}
                            </div>
                            <div>
                                <Link href={`/users/${owner.id}`} className="text-sm font-medium text-gray-900 hover:text-[#12753e] flex items-center gap-1.5">
                                    {owner.name}
                                    {owner.isVerified && <VerifiedBadge />}
                                </Link>
                                {(owner.city || owner.state) && (
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                        <MapPin className="w-3 h-3 text-gray-400" />
                                        <span>{owner.city}, {owner.state}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                   ) : (
                       <div className="text-sm text-gray-500">Vendedor particular</div>
                   )}
                    
                    <Link href={`/users/${owner?.id}`} className="block mt-4 text-xs font-semibold text-[#12753e] hover:text-[#0e5e32]">
                        Ver productos del vendedor
                    </Link>
               </div>
          </div>

       </div>
    </section>
  );
}
