"use client";

import { adminDeleteCompany } from "./actions";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export function DeleteCompanyButton({ companyId }: { companyId: string }) {
  return (
    <button 
      onClick={async () => {
        if (confirm("¿Estás seguro de que deseas eliminar esta empresa? Esta acción no se puede deshacer.")) {
            try {
                await adminDeleteCompany(companyId);
                toast.success("Empresa eliminada");
            } catch (error) {
                toast.error("Error al eliminar empresa");
            }
        }
      }}
      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
      title="Eliminar Empresa"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
