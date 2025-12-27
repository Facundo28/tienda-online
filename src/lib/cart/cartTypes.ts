export type CartItem = {
  productId: string;
  name: string;
  priceCents: number;
  quantity: number;
};

export type Cart = {
  items: CartItem[];
};
