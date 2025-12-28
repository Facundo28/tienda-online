import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
       <AdminSidebar />
       <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader user={user} />
          <main className="flex-1 p-6 lg:p-8 overflow-auto">
             <div className="max-w-[1600px] mx-auto">
                {children}
             </div>
          </main>
       </div>
    </div>
  );
}
