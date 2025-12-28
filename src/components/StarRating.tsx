"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number; // 0 to 5
  max?: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  readOnly?: boolean;
}

export function StarRating({
  rating,
  max = 5,
  onRatingChange,
  size = 20,
  readOnly = false,
}: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => {
        const isFilled = i < Math.floor(rating);
        const isHalf = i === Math.floor(rating) && rating % 1 !== 0; // Simple logic, assumes whole numbers for input mostly

        return (
          <button
            key={i}
            type="button"
            className={`${readOnly ? "cursor-default" : "cursor-pointer hover:scale-110 transition-transform"}`}
            onClick={() => !readOnly && onRatingChange?.(i + 1)}
            disabled={readOnly}
          >
            <Star
              size={size}
              className={`${
                isFilled
                  ? "fill-indigo-500 text-indigo-500" // New Brand Color
                  : "fill-muted text-muted-foreground/30"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
