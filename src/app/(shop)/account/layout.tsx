
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { requireUser } from "@/lib/auth/session";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sticky top-24">
                <div className="mb-6 px-4 pt-2">
                    <h2 className="font-bold text-gray-900">Mi Cuenta</h2>
                    <p className="text-xs text-gray-500">Gestiona tus datos</p>
                </div>
                <AccountSidebar />
            </div>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-9">
             {children}
        </main>
      </div>
    </div>
  );
}
