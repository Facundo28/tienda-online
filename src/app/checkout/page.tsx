import { requireUser } from "@/lib/auth/session";
import { CheckoutClient } from "./CheckoutClient";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const user = await requireUser();
  return (
    <CheckoutClient
      initialForm={{
        customerName: user.name ?? "",
        customerEmail: user.email ?? "",
        customerPhone: user.phone ?? "",
        addressLine1: user.addressLine1 ?? "",
        addressLine2: user.addressLine2 ?? "",
        city: user.city ?? "",
        state: user.state ?? "",
        postalCode: user.postalCode ?? "",
      }}
    />
  );
}
