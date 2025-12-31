import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import ChatClient from "./ChatClient";

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const order = await prisma.order.findUnique({
    where: { id },
    include: { 
        items: { include: { product: { include: { user: true } } } },
        messages: { orderBy: { createdAt: 'asc' }, include: { user: true } }
    }, 
  });

  if (!order || (order.userId !== user.id && order.items[0].product.userId !== user.id && user.role !== 'ADMIN')) {
      redirect("/orders");
  }
  
  const sellerId = order.items[0].product.userId;
  const isSeller = user.id === sellerId;
  const counterpartName = isSeller ? order.customerName : (order.items[0].product.user?.name || "Vendedor");
  
  // Check if product is "paused" (effectively stock 0 or inactive)
  // For simplicity checking the first item's product status
  const product = await prisma.product.findUnique({ where: { id: order.items[0].productId } });
  const isProductPaused = product ? (!product.isActive || product.stock === 0) : false;

  // Serialize messages to avoid "Date object" warnings in Client Component
  const serializedMessages = JSON.parse(JSON.stringify(order.messages));

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 h-[calc(100vh-80px)]">
         <div className="mb-4">
             <Link href="/orders" className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1">
                &larr; Volver a mis compras/ventas
             </Link>
         </div>
         
         <ChatClient 
             orderId={id}
             initialMessages={serializedMessages}
             currentUserId={user.id}
             isSeller={isSeller}
             isAdmin={user.role === 'ADMIN'}
             counterpartName={counterpartName}
             orderStatus={order.status}
             refundStatus={order.refundStatus}
             isProductPaused={isProductPaused}
             productName={order.items[0].product.name}
             productPrice={order.items[0].priceCents}
             productImage={order.items[0].product.imageUrl || undefined}
             roleBadge={isSeller ? "Vendedor" : "Comprador"}
             buyerName={order.customerName}
             sellerName={order.items[0].product.user?.name || "Vendedor"}
         />
    </div>
  );
}
