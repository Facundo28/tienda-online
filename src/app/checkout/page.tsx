"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/lib/cart/useCart";
import { formatCurrencyFromCents } from "@/lib/money";

type FormState = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
};

export default function CheckoutPage() {
  const { cart, totals, clear } = useCart();
  const [form, setForm] = useState<FormState>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return (
      cart.items.length > 0 &&
      form.customerName.trim() &&
      form.customerEmail.trim() &&
      form.addressLine1.trim() &&
      form.city.trim() &&
      form.state.trim() &&
      form.postalCode.trim()
    );
  }, [cart.items.length, form]);

  async function submit() {
    setError(null);
    setOrderId(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          customerPhone: form.customerPhone || undefined,
          addressLine2: form.addressLine2 || undefined,
          items: cart.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        }),
      });

      const data = (await res.json().catch(() => null)) as
        | { orderId: string }
        | { error: string }
        import { requireUser } from "@/lib/auth/session";
        import { CheckoutClient } from "./CheckoutClient";

        export const dynamic = "force-dynamic";

        export default async function CheckoutPage() {
          await requireUser();
          return <CheckoutClient />;
        }
      setOrderId((data as { orderId: string }).orderId);
