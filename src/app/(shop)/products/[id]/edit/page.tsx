import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import ProductForm from "../../new/ProductForm";
import { saveUploadedFile } from "@/lib/file-upload";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  
  const product = await prisma.product.findUnique({
      where: { id }
  });

  if (!product) notFound();
  
  // Security Check: Only Owner or Admin
  if (product.userId !== user.id && user.role !== "ADMIN") {
      redirect("/vender");
  }

  async function updateProductAction(formData: FormData) {
      "use server";
      const name = formData.get("name") as string;
      const price = parseFloat(formData.get("price") as string) * 100;
      const description = formData.get("description") as string;
      const stock = parseInt(formData.get("stock") as string) || 0;
      const condition = formData.get("condition") as string;
      
      // isActive logic from Form: "true" text means Active (Toggle ON)
      // The shared form sends "isActive" as "true" or "false".
      const isActive = formData.get("isActive") === "true";
      
      // Image Handling
      const existingUrlsRaw = formData.get("imageUrl") as string || "";
      const existingUrls = existingUrlsRaw.split('\n').filter(Boolean);
      
      const imageFiles = formData.getAll("images").filter((v): v is File => v instanceof File);
      let newUrls: string[] = [];
      
      for (const file of imageFiles) {
          if (file.size > 0) {
              const url = await saveUploadedFile(file, "products");
              newUrls.push(url);
          }
      }
      
      const finalUrls = [...existingUrls, ...newUrls].slice(0, 5); // Max 5 enforcement
      const finalImageUrl = finalUrls.join("\n");

      await prisma.product.update({
          where: { id },
          data: {
              name,
              priceCents: Math.round(price),
              description,
              stock,
              condition,
              isActive,
              imageUrl: finalImageUrl
          }
      });
      revalidatePath("/vender");
      revalidatePath(`/products/${id}`);
      redirect("/vender");
  }

  async function deleteProductAction() {
      "use server";
      await prisma.product.delete({
          where: { id }
      });
      revalidatePath("/vender");
      redirect("/vender");
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8">
      <div className="mb-4">
          <a href="/vender" className="text-sm text-gray-500 hover:text-gray-900 mb-2 inline-block">&larr; Volver al panel</a>
      </div>
      
      <ProductForm 
        user={user} 
        action={updateProductAction} 
        isEditing={true}
        initialData={{
            name: product.name,
            description: product.description,
            priceCents: product.priceCents,
            stock: product.stock,
            condition: product.condition,
            category: product.category,
            imageUrl: product.imageUrl,
            isActive: product.isActive
        }}
      />

    </div>
  );
}
