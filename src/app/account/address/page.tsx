import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AddressSelector } from "./AddressSelector";

export default async function AddressPage() {
  const user = await requireUser();

  async function updateAddress(formData: FormData) {
    "use server";
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const street = formData.get("street") as string;
    const zip = formData.get("zip") as string;
    const apartment = formData.get("apartment") as string;
    const instructions = formData.get("instructions") as string;
    const type = formData.get("type") as string;
    
    const contactName = formData.get("contactName") as string;
    const contactPhone = formData.get("contactPhone") as string;

    await prisma.user.update({
        where: { id: user.id },
        data: {
            city: city,
            state: state,
            addressLine1: street,
            addressLine2: apartment,
            postalCode: zip,
            addressInstructions: instructions,
            addressType: type,
            name: contactName,
            phone: contactPhone
        }
    });
    
    revalidatePath("/account/address");
    revalidatePath("/");
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4">
        <AddressSelector 
            user={user}
            updateAction={updateAddress}
        />
    </div>
  );
}
