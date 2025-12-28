import { requireUser } from "@/lib/auth/session";
import { CartClient } from "./CartClient";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  await requireUser();
  return <CartClient />;
}
