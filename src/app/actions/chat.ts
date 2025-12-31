"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { saveUploadedFile } from "@/lib/file-upload";
import { generateTranscript } from '@/lib/chat/transcript';

export async function sendMessageAction(formData: FormData, orderId: string) {
    const user = await requireUser();
    const message = formData.get("message") as string;
    const image = formData.get("image") as File;

    if ((!message || !message.trim()) && !image) return null;

    let attachmentUrl = null;
    if (image && image.size > 0) {
        try {
            attachmentUrl = await saveUploadedFile(image, "chat-images");
        } catch (error) {
            console.error("Error uploading chat image:", error);
        }
    }

    const newMsg = await prisma.orderMessage.create({
        data: {
            orderId,
            userId: user.id,
            message: message ? message.trim() : (attachmentUrl ? "Imagen adjunta" : ""),
            attachmentUrl
        }
    });
    
    // Notify Counterpart
    const order = await prisma.order.findUnique({
         where: { id: orderId },
         include: { items: { include: { product: true } } }
    });
    
    if (order) {
        const sellerId = order.items[0]?.product.userId;
        const buyerId = order.userId;
        const counterpartId = user.id === sellerId ? buyerId : sellerId;
        
        if (counterpartId) {
             await prisma.notification.create({
                 data: {
                     userId: counterpartId,
                     title: "Nuevo Mensaje",
                     message: `Tienes un mensaje en el pedido #${orderId.slice(-4)}`,
                     href: `/orders/${orderId}/chat`,
                     type: 'INFO'
                 }
             });
        }
    }

    revalidatePath(`/orders/${orderId}/chat`);
    return newMsg;
}

export async function processRefundAction(orderId: string) {
   const user = await requireUser();
   
   const order = await prisma.order.update({
       where: { id: orderId },
       data: { 
           status: 'CANCELLED',
           refundStatus: 'COMPLETED' 
       }
   });

   // Also close any associated claim
   await prisma.claim.updateMany({
       where: { orderId, status: 'OPEN' },
       data: { status: 'RESOLVED_REFUNDED' }
   });

   await prisma.orderMessage.create({
       data: {
           orderId,
           userId: user.id,
           message: `[SISTEMA] El vendedor ha realizado la devolución del dinero. Chat cerrado.`
       }
   });

   // Generate transcript and log
   await generateTranscript(orderId);

   // Notify Buyer
   await prisma.notification.create({
        data: {
            userId: order.userId,
            title: "Dinero Reembolsado",
            message: `El vendedor te ha devuelto el dinero del pedido #${orderId.slice(-8)}. Se ha enviado un registro del chat a tu correo.`,
            href: `/orders/${orderId}/chat`,
            type: 'SUCCESS'
        }
   });
   
   revalidatePath(`/orders/${orderId}/chat`);
}

export async function requestMediationAction(orderId: string) {
    const user = await requireUser();
    
    // Create/Upsert Claim
    await prisma.claim.upsert({
        where: { orderId },
        create: {
            orderId,
            userId: user.id,
            type: 'NOT_RECEIVED', // Defaulting for now, could be passed param
            description: "Mediación solicitada desde el chat.",
            status: 'OPEN'
        },
        update: {
            status: 'OPEN',
            updatedAt: new Date()
        }
    });

    await prisma.orderMessage.create({
        data: {
            orderId,
            userId: user.id,
            message: `[SISTEMA] Se ha solicitado la intervención de Market E.C para mediar en este reclamo.`
        }
    });

   // Notify Counterpart
   const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: { include: { product: true } } } });
   if (order) {
        const sellerId = order.items[0]?.product.userId;
        const counterpartId = user.id === sellerId ? order.userId : sellerId;
        
        if (counterpartId) {
            await prisma.notification.create({
                    data: {
                        userId: counterpartId,
                        title: "Mediación Solicitada",
                        message: `La otra parte ha pedido ayuda a Market E.C.`,
                        href: `/orders/${orderId}/chat`,
                        type: 'WARNING'
                    }
            });
        }
   }
    
    revalidatePath(`/orders/${orderId}/chat`);
}

export async function closeClaimAction(orderId: string) {
    const user = await requireUser();
    
    // Only Admin can close without refund? Or user who opened it? 
    // Assuming Admin for "Cerrar Reclamo" effectively favoring Seller or just closing.
    if (user.role !== 'ADMIN') {
        throw new Error("Solo administradores pueden cerrar reclamos.");
    }

    await prisma.claim.updateMany({
        where: { orderId, status: 'OPEN' },
        data: { status: 'RESOLVED_RELEASED' }
    });

    await prisma.orderMessage.create({
        data: {
            orderId,
            userId: user.id,
            message: `[SISTEMA] El reclamo ha sido cerrado por un administrador.`
        }
    });

    revalidatePath(`/orders/${orderId}/chat`);
}

export async function cancelClaimAction(orderId: string) {
    const user = await requireUser();

    // User can cancel their own claim
    const claim = await prisma.claim.findFirst({
        where: { orderId, userId: user.id, status: 'OPEN' }
    });

    if (!claim) return; // No open claim by this user

    await prisma.claim.update({
        where: { id: claim.id },
        data: { status: 'RESOLVED_RELEASED' }
    });

    await prisma.orderMessage.create({
        data: {
            orderId,
            userId: user.id,
            message: `[SISTEMA] El usuario ha cancelado el reclamo. La disputa se considera resuelta.`
        }
    });

    revalidatePath(`/orders/${orderId}/chat`);
}

export async function unpauseProductAction(orderId: string) {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true }
    });
    
    if (!order) return;

    for (const item of order.items) {
        await prisma.product.update({
             where: { id: item.productId },
             data: { 
                 isActive: true,
                 stock: { increment: item.quantity } 
             }
        });
    }
    
    revalidatePath(`/orders/${orderId}/chat`);
}

export async function confirmReceiptAction(orderId: string) {
    const user = await requireUser();
    
    // Verify order exists and belongs to user
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: true } } }
    });

    if (!order || order.userId !== user.id) {
        throw new Error("No tienes permiso o el pedido no existe.");
    }

    // Update Order
    await prisma.order.update({
        where: { id: orderId },
        data: {
            deliveryStatus: 'DELIVERED', 
            fundsReleased: true,
            fundsReleaseAt: new Date(),
        }
    }); // Status stays as is (ON_WAY -> DELIVERED logic usually by courier, but manual override here is accepted)
    
    // Notify Seller
    const sellerId = order.items[0]?.product.userId;
    if (sellerId) {
         await prisma.notification.create({
             data: {
                 userId: sellerId,
                 title: "¡Dinero Disponible!",
                 message: `El comprador confirmó la recepción del pedido #${orderId.slice(-8)}. Los fondos han sido liberados.`,
                 href: `/orders/${orderId}`,
                 type: 'SUCCESS'
             }
         });
    }

    revalidatePath(`/orders/${orderId}`);
    revalidatePath(`/orders/${orderId}/chat`);
}
