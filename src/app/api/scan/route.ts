import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { DeliveryMethod, DeliveryStatus, UserRole } from "@/generated/prisma/enums";
import { saveUploadedFile } from "@/lib/file-upload";

// Helper to calculate distance in meters
function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d * 1000; // Distance in meters
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export async function POST(req: Request) {
  const user = await requireUser();
  
  // Handle both JSON and FormData
  let code: string;
  let lat: number | undefined;
  let lng: number | undefined;
  let deliveryWords: string | undefined;
  let proofPhotoFile: File | null = null;

  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
      const body = await req.json().catch(() => null);
      if (!body) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
      code = body.code;
      lat = body.lat;
      lng = body.lng;
      deliveryWords = body.words;
  } else if (contentType.includes("multipart/form-data")) {
      const fd = await req.formData();
      code = fd.get("code") as string;
      lat = Number(fd.get("lat"));
      lng = Number(fd.get("lng"));
      deliveryWords = fd.get("words") as string;
      proofPhotoFile = fd.get("proofPhoto") as File;
  } else {
      return NextResponse.json({ error: "Content-Type no soportado" }, { status: 400 });
  }

  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Código inválido" }, { status: 400 });
  }

  code = code.trim(); 

  // 1. Intentar encontrar por CÓDIGO DE RETIRO (Corto, Mayúsculas)
  // Lógica: Vendedor escaneando a un Comprador
  const pickupOrder = await prisma.order.findFirst({
    where: {
        pickupCode: code.toUpperCase(),
        deliveryMethod: DeliveryMethod.PICKUP
    },
    include: { items: { include: { product: true } } }
  });

  if (pickupOrder) {
      // VERIFICACIÓN DE PERMISOS
      const isSeller = pickupOrder.items.some(item => item.product.userId === user.id) || user.role === UserRole.ADMIN;

      if (!isSeller) {
           return NextResponse.json({ error: "No tienes permiso para entregar este pedido." }, { status: 403 });
      }

      if (pickupOrder.deliveryStatus === DeliveryStatus.DELIVERED) {
          return NextResponse.json({ error: "Ya fue entregado" }, { status: 400 });
      }

      // Marcar como Entregado
      await prisma.order.update({
          where: { id: pickupOrder.id },
          data: {
              deliveryStatus: DeliveryStatus.DELIVERED,
              status: "FULFILLED",
              fundsReleased: true, // Retiro libera fondos inmediatamente al escanear
              scanLatitude: lat,
              scanLongitude: lng
          }
      });
      
      return NextResponse.json({ success: true, type: "PICKUP", orderId: pickupOrder.id });
  }

  // 2. Intentar encontrar por ID DE ORDEN (UUID) -> Flujo de Delivery
  // Lógica: Repartidor escaneando ID del Paquete
  const deliveryOrder = await prisma.order.findUnique({
      where: { id: code },
      include: { items: true }
  });

  if (deliveryOrder && deliveryOrder.deliveryMethod === DeliveryMethod.DELIVERY) {
      
      if (user.role !== UserRole.DRIVER && user.role !== UserRole.LOGISTICS_ADMIN && user.role !== UserRole.ADMIN) {
           return NextResponse.json({ error: "Solo repartidores pueden realizar entregas a domicilio." }, { status: 403 });
      }

      // VERIFICACIÓN DE SEGURIDAD 1: PALABRAS CLAVE
      if (deliveryOrder.securityKeywords !== deliveryWords) {
          return NextResponse.json({ error: "Palabras clave incorrectas. La entrega no puede ser validada." }, { status: 403 });
      }

      // VERIFICACIÓN DE SEGURIDAD 2: FOTO DE PRUEBA (Obligatorio ahora)
      let proofUrl = null;
      if (proofPhotoFile && proofPhotoFile.size > 0) {
          proofUrl = await saveUploadedFile(proofPhotoFile, "proofs");
      } else {
          return NextResponse.json({ error: "Falta la foto de prueba de entrega." }, { status: 400 });
      }

      // VERIFICACIÓN DE SEGURIDAD 3: UBICACIÓN
      if (lat && lng && deliveryOrder.deliveryLat && deliveryOrder.deliveryLng) {
          const distance = getDistanceFromLatLonInM(lat, lng, deliveryOrder.deliveryLat, deliveryOrder.deliveryLng);
          // Tolerancia de 400m para ser generosos con el GPS
          if (distance > 400) { 
               // Registrar advertencia?
          }
      }

      const oneDayFromNow = new Date();
      oneDayFromNow.setHours(oneDayFromNow.getHours() + 24);

      await prisma.order.update({
          where: { id: deliveryOrder.id },
          data: {
              deliveryStatus: DeliveryStatus.DELIVERED,
              status: "FULFILLED",
              fundsReleased: false, // Esperar 24h
              fundsReleaseAt: oneDayFromNow,
              scanLatitude: lat,
              scanLongitude: lng,
              deliveryTime: new Date(),
              proofUrl: proofUrl
          }
      });

      return NextResponse.json({ success: true, type: "DELIVERY", orderId: deliveryOrder.id });
  }

  return NextResponse.json({ error: "Código no encontrado" }, { status: 404 });
}
