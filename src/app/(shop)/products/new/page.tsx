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
      const stock = parseInt(formData.get("stock") as string) || 1;
      const condition = formData.get("condition") as string || "NEW";
      const isBoosted = formData.get("isBoosted") === "true";
      
      const imageFiles = formData.getAll("images").filter((v): v is File => v instanceof File);
      
      let imageUrls: string[] = [];
      
      for (const file of imageFiles) {
          if (file.size > 0) {
              const url = await saveUploadedFile(file, "products");
              imageUrls.push(url);
          }
      }
      
      const finalImageUrl = imageUrls.join("\n");

      try {
          // Basic validation
          if(!name || !price) throw new Error("Datos incorrectos");

          await prisma.product.create({
              data: {
                  name,
                  priceCents: Math.round(price),
                  description,
                  category: category || "OTROS",
                  stock,
                  condition,
                  userId: user.id,
                  imageUrl: finalImageUrl || "/placeholder.png",
                  boostedUntil: isBoosted ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null 
              }
          });
      } catch (error) {
          console.error("Error creating product:", error);
          throw error; // Re-throw so client sees it
      }
      
      redirect("/vender");
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8">
      <ProductForm user={user} action={createProductAction} />
    </div>
  );
}
