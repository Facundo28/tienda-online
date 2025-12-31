import Link from "next/link";
import Image from "next/image";
import { formatCurrencyFromCents } from "@/lib/money";
import { AddToCartButton } from "@/components/AddToCartButton";
import { BuyNowButton } from "@/components/BuyNowButton";
import { FavoriteButton } from "@/components/FavoriteButton";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { MapPin, Trophy, ShieldCheck } from "lucide-react";

type Props = {
    product: any;
    owner: any;
    isFavorited: boolean;
    soldCount?: number;
};

function normalizeImageSrc(src: string) {
    if (src.startsWith("http")) return src;
    if (src.startsWith("/")) return src;
    return `/${src}`;
}

function initials(name: string) {
    const parts = name.trim().split(" ").filter(Boolean);
    const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase());
    return letters.join("") || "U";
}

export function ProductBuyBox({ product, owner, isFavorited, soldCount = 0 }: Props) {
    return (
        <div className="flex flex-col gap-4">
            <div className="border border-gray-200 rounded-lg p-6 bg-white relative">
                {/* Condition & Sold */}
                <div className="text-xs text-gray-500 mb-3 flex items-center gap-2">
                    <span>{product.condition === 'NEW' ? 'Nuevo' : 'Usado'}</span>
                    <span className="text-gray-300">|</span>
                    <span>{soldCount} {soldCount === 1 ? 'vendido' : 'vendidos'}</span>
                </div>

                {/* Title */}
                <h1 className="text-xl md:text-2xl font-semibold text-gray-900 leading-snug mb-4 text-balance">
                    {product.name}
                </h1>

                {/* Price */}
                {/* Price */}
                <div className="text-4xl font-bold text-[#12753e] mb-4">
                    {formatCurrencyFromCents(product.priceCents)}
                </div>

                {/* Offer Banner */}
                {!product.priceCents || product.priceCents <= 500000 ? (
                    <div className="mb-6">
                        <span className="text-sm font-medium text-[#00a650]">
                            5% OFF con transferencia
                        </span>
                    </div>
                ) : null}

                {/* Stock */}
                <div className="mb-6 font-medium text-sm text-gray-900">
                    {product.stock > 0 ? (
                        <span className="text-gray-900">Stock disponible: <span className="text-gray-500 font-normal">({product.stock})</span></span>
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
                        className="w-full bg-[#12753e] hover:bg-[#0e5e32] text-white font-semibold py-3 rounded-md transition-colors text-[16px]"
                    />
                    <AddToCartButton
                        product={{
                            id: product.id,
                            name: product.name,
                            priceCents: product.priceCents,
                            sellerId: owner?.id,
                            sellerName: owner?.name,
                            sellerIsVerified: owner?.isVerified,
                            imageUrl: product.imageUrl,
                        }}
                        className="w-full bg-[#e8f5e9] text-[#12753e] font-semibold py-3 rounded-md hover:bg-[#c8e6c9] transition-colors text-[15px]"
                    />
                </div>

                {/* Benefits */}
                <div className="mt-6 flex flex-col gap-3 text-sm text-gray-500">
                   <div className="flex gap-2">
                       <ShieldCheck className="w-4 h-4 text-gray-400 mt-0.5" />
                       <p><span className="text-[#12753e]">Compra Segura</span>, recibí el producto que esperabas o te devolvemos tu dinero.</p>
                   </div>
                </div>

                {/* Favorite Button Absolute */}
                <div className="absolute top-4 right-4">
                    <FavoriteButton
                        productId={product.id}
                        initialIsFavorited={isFavorited}
                        className="text-[#12753e] hover:text-[#0e5e32] hover:bg-green-50"
                    />
                </div>
            </div>

            {/* Seller Info */}
            <div className="border border-gray-200 rounded-lg p-6 bg-white">
                {owner?.isVerified ? (
                     /* OFFICIAL STORE CARD */
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between mb-1">
                             <p className="text-xs font-bold uppercase tracking-widest text-[#12753e]">Tienda oficial</p>
                             <VerifiedBadge className="w-5 h-5 text-[#12753e]" />
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="relative w-14 h-14 rounded-full border border-gray-200 overflow-hidden shrink-0 shadow-sm">
                                {owner.avatarUrl ? (
                                    <Image src={normalizeImageSrc(owner.avatarUrl)} alt={owner.name} fill className="object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full w-full bg-gray-100 text-gray-400 font-bold">
                                        {initials(owner.name)}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-900 leading-none mb-1">{owner.name}</h4>
                                <p className="text-xs text-gray-500">+100 mil ventas</p>
                            </div>
                        </div>

                        <Link 
                            href={`/users/${owner.id}`} 
                            className="flex items-center justify-between group mt-2 w-full py-2 px-3 rounded transition-colors hover:bg-gray-50"
                        >
                            <span className="text-sm font-semibold text-[#12753e] group-hover:text-[#0e5e32]">
                                Visita la Tienda oficial
                            </span>
                            <span className="text-[#12753e] text-lg">›</span>
                        </Link>
                    </div>
                ) : (
                    /* STANDARD SELLER CARD */
                    <>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Información del vendedor</h4>
                        {owner ? (
                            <div className="flex items-start gap-4 mb-4">
                                <div className="relative w-12 h-12 rounded-full border border-gray-100 bg-gray-50 overflow-hidden shrink-0">
                                    {owner.avatarUrl ? (
                                        <Image src={normalizeImageSrc(owner.avatarUrl)} alt={owner.name} fill className="object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-lg font-bold text-gray-400">{initials(owner.name)}</div>
                                    )}
                                </div>
                                <div>
                                    <Link href={`/users/${owner.id}`} className="text-base font-medium text-gray-900 hover:text-[#12753e] flex items-center gap-1.5">
                                        {owner.name}
                                        {owner.isVerified && <VerifiedBadge />}
                                    </Link>
                                    {(owner.city || owner.state) && (
                                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                            <span>{owner.city}, {owner.state}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500">Vendedor particular</div>
                        )}

                        <div className="flex gap-2 mb-4">
                             <span className="text-[#00a650] font-medium text-sm flex items-center gap-1"><Trophy className="w-3 h-3" /> Vendedor Premium</span>
                        </div>
                        
                        <p className="text-xs text-gray-500 mb-4">¡Es uno de los mejores del sitio!</p>

                        <Link href={`/users/${owner?.id}`} className="block text-sm font-semibold text-[#12753e] hover:text-[#0e5e32]">
                            Ver más datos de este vendedor
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
