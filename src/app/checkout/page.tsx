import { requireUser } from "@/lib/auth/session";
import { CheckoutClient } from "./CheckoutClient";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  await requireUser();
  return <CheckoutClient />;
}
