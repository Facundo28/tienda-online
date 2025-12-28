import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProductForm from "./ProductForm";

import { saveUploadedFile } from "@/lib/file-upload";

export default async function NewProductPage() {
  const user = await requireUser();

  async function createProductAction(formData: FormData) {
      "use server";
      const name = formData.get("name") as string;
      const price = parseFloat(formData.get("price") as string) * 100;
      const description = formData.get("description") as string;
      const category = formData.get("category") as any;
      const isBoosted = formData.get("isBoosted") === "true";
      const imageFile = formData.get("image") as File;
      
      let imageUrl = "";
      if (imageFile && imageFile.size > 0) {
          imageUrl = await saveUploadedFile(imageFile, "products");
      }

      // Basic validation
      if(!name || !price) throw new Error("Datos incorrectos");

      await prisma.product.create({
          data: {
              name,
              priceCents: Math.round(price),
              description,
              category: category || "OTROS",
              userId: user.id,
              imageUrl: imageUrl || "/placeholder.png",
              boostedUntil: isBoosted ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null 
          }
      });
      redirect("/vender");
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8">
      <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Publicar Nuevo Producto</h1>
          <p className="text-gray-500">Completa la información para comenzar a vender.</p>
      </div>
      
      <ProductForm user={user} createProductAction={createProductAction} />
    </div>
  );
}
