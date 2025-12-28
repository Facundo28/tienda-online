import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { VerifiedBadge } from "@/components/VerifiedBadge";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/");

  // Next.js 15: searchParams is a promise
  const params = await searchParams;
  const query = params.q || "";

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: query} }, // Case insensitive in SQLite usually requires adding mode: 'insensitive' but default prisma sqlite matches case-blind often or we accept it
        { email: { contains: query } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
           <p className="text-gray-500">Administra permisos, verificación y seguridad.</p>
        </div>
      </div>

      {/* Search Bar */}
      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={query}
          placeholder="Buscar por nombre o email..."
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2"
        />
        <button className="bg-black text-white px-6 py-2 rounded-lg font-medium">Buscar</button>
      </form>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 font-semibold text-gray-900">Usuario</th>
              <th className="px-6 py-3 font-semibold text-gray-900">Rol</th>
              <th className="px-6 py-3 font-semibold text-gray-900">Estado</th>
              <th className="px-6 py-3 font-semibold text-gray-900 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold overflow-hidden">
                       {u.avatarUrl ? (
                         <img src={u.avatarUrl.startsWith("http") ? u.avatarUrl : `/${u.avatarUrl}`} className="w-full h-full object-cover" />
                       ) : u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 flex items-center gap-1">
                        {u.name}
                        {u.isVerified && <VerifiedBadge />}
                      </div>
                      <div className="text-gray-500 text-xs">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                   <div className="flex flex-col gap-1">
                      {u.isVerified ? (
                        <span className="text-xs text-[#12753e] font-medium flex items-center gap-1">
                          ✓ Verificado
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">No verificado</span>
                      )}
                      
                      {u.enabled2FAMethods && u.enabled2FAMethods.length > 0 && (
                          <span className="text-xs text-blue-600 font-medium">🛡️ 2FA Activo</span>
                      )}
                   </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/admin/users/${u.id}`}
                    className="text-indigo-600 hover:text-indigo-900 font-medium text-sm"
                  >
                    Administrar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
            <div className="p-12 text-center text-gray-500">No se encontraron usuarios.</div>
        )}
      </div>
    </div>
  );
}
