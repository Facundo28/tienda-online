export type CartItem = {
  productId: string;
  name: string;
  priceCents: number;
  quantity: number;
  sellerId?: string;
  sellerName?: string;
  sellerIsVerified?: boolean;
  imageUrl?: string;
};

export type Cart = {
  items: CartItem[];
};
