import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "node:crypto";
import { getCurrentUser } from "@/lib/auth/session";
import { DeliveryMethod, DeliveryStatus } from "@/generated/prisma/enums";
import { generarPalabrasClave } from "@/lib/security/words";

type CheckoutItem = {
  productId: string;
  quantity: number;
};

type CheckoutBody = {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  items: CheckoutItem[];
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  const body = (await req.json().catch(() => null)) as CheckoutBody | null;

  if (!body) {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const requiredStrings: Array<[keyof CheckoutBody, unknown]> = [
    ["customerName", body.customerName],
    ["customerEmail", body.customerEmail],
    ["addressLine1", body.addressLine1],
    ["city", body.city],
    ["state", body.state],
    ["postalCode", body.postalCode],
  ];

  for (const [key, value] of requiredStrings) {
    if (!isNonEmptyString(value)) {
      return NextResponse.json(
        { error: `Campo requerido: ${String(key)}` },
        { status: 400 },
      );
    }
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json(
      { error: "Carrito vacío" },
      {
        status: 400,
      },
    );
  }

  const normalizedItems = body.items
    .map((i) => ({
      productId: i.productId,
      quantity: Math.max(1, Math.floor(Number(i.quantity || 1))),
    }))
    .filter((i) => isNonEmptyString(i.productId));

  const productIds = [...new Set(normalizedItems.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });

  if (products.length !== productIds.length) {
    return NextResponse.json(
      { error: "Uno o más productos no existen o no están activos" },
      { status: 400 },
    );
  }

  const priceById = new Map(products.map((p) => [p.id, p.priceCents] as const));

  const totalCents = normalizedItems.reduce((sum, item) => {
    const price = priceById.get(item.productId);
    if (price == null) return sum;
    return sum + price * item.quantity;
  }, 0);

  const order = await prisma.order.create({
    data: {
      customerName: body.customerName.trim(),
      customerEmail: body.customerEmail.trim(),
      customerPhone: body.customerPhone?.trim() || null,
      addressLine1: body.addressLine1.trim(),
      addressLine2: body.addressLine2?.trim() || null,
      city: body.city.trim(),
      state: body.state.trim(),
      postalCode: body.postalCode.trim(),
      totalCents,
      userId: user?.id,
      deliveryMethod: DeliveryMethod.PICKUP,
      deliveryStatus: DeliveryStatus.PENDING,
      pickupCode: crypto.randomBytes(4).toString("hex").toUpperCase(),
      securityKeywords: generarPalabrasClave(),
      items: {
        create: normalizedItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          priceCents: priceById.get(item.productId)!,
        })),
      },
    },
    select: { id: true },
  });

  return NextResponse.json({ orderId: order.id }, { status: 201 });
}
