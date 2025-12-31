import { requireUser } from "@/lib/auth/session";
import { CartClient } from "./CartClient";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  await requireUser();
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
        <CartClient />
    </div>
  );
}
