import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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
      const isActive = formData.get("isActive") === "on";

      await prisma.product.update({
          where: { id },
          data: {
              name,
              priceCents: Math.round(price),
              description,
              isActive
          }
      });
      revalidatePath("/vender");
      redirect("/vender");
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Editar Producto</h1>
      
      <form action={updateProductAction} className="space-y-6 bg-white p-6 rounded-xl border border-gray-200">
          <div>
              <label className="block text-sm font-medium mb-1">Nombre del producto</label>
              <input name="name" defaultValue={product.name} required className="w-full border rounded-lg px-3 py-2" />
          </div>
          
           <div>
              <label className="block text-sm font-medium mb-1">Precio</label>
              <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input name="price" defaultValue={product.priceCents / 100} type="number" required className="w-full border rounded-lg pl-7 pr-3 py-2" />
              </div>
          </div>

          <div>
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <textarea name="description" defaultValue={product.description || ""} required rows={4} className="w-full border rounded-lg px-3 py-2"></textarea>
          </div>

          <div className="flex items-center gap-2">
              <input type="checkbox" name="isActive" id="isActive" defaultChecked={product.isActive} className="w-4 h-4 text-green-600 rounded" />
              <label htmlFor="isActive" className="text-sm font-medium">Producto Activo (Visible en catálogo)</label>
          </div>

          <button className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800">
              Guardar Cambios
          </button>
      </form>
    </div>
  );
}
