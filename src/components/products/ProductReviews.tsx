"use client";

import { useState, useEffect } from "react";
import { StarRating } from "../StarRating";
import { toast } from "sonner";
import { User } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
    avatarUrl: string | null;
  };
}

export function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function fetchReviews() {
    try {
      const res = await fetch(`/api/products/${productId}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) return toast.error("Por favor selecciona una calificación");
    
    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Error al enviar reseña");
      }

      toast.success("¡Gracias por tu opinión!");
      setRating(0);
      setComment("");
      fetchReviews(); // Refresh list
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }
  
  const average = reviews.length 
    ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
            Opiniones del producto
            {average && (
                <span className="text-2xl font-bold ml-2 text-indigo-600">{average}</span>
            )}
        </h3>
        <p className="text-sm text-muted-foreground">{reviews.length} calificaciones</p>
      </div>

      {/* Review Form */}
      <form onSubmit={handleSubmit} className="rounded-xl border bg-muted/20 p-6 space-y-4">
        <h4 className="font-medium">Escribe tu opinión</h4>
        <div className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">Calificación</span>
            <StarRating rating={rating} onRatingChange={setRating} size={28} />
        </div>
        <div>
            <label className="text-sm text-muted-foreground mb-1 block">Comentario (Opcional)</label>
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[100px]"
                placeholder="¿Qué te pareció el producto?"
            />
        </div>
        <button
            disabled={submitting || rating === 0}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
            {submitting ? "Enviando..." : "Publicar reseña"}
        </button>
      </form>

      {/* List */}
      <div className="space-y-6">
        {reviews.map((review) => (
            <div key={review.id} className="border-b pb-6 last:border-0">
                <div className="flex items-center gap-2 mb-2">
                    <StarRating rating={review.rating} readOnly size={14} />
                    <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                </div>
                {review.comment && (
                    <p className="text-sm text-foreground/80 mb-3">{review.comment}</p>
                )}
                <div className="flex items-center gap-2">
                     <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                        {review.user.avatarUrl ? (
                            <img src={review.user.avatarUrl} className="h-full w-full rounded-full" />
                        ) : (
                            <User size={14} />
                        )}
                     </div>
                     <span className="text-xs font-medium text-foreground/60">{review.user.name}</span>
                </div>
            </div>
        ))}
        {!loading && reviews.length === 0 && (
            <p className="text-muted-foreground text-sm italic">Sé el primero en opinar sobre este producto.</p>
        )}
      </div>
    </div>
  );
}
