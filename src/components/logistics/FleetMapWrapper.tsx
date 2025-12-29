"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

// Dynamically import the map with SSR disabled
const FleetMap = dynamic(() => import("./FleetMap"), { 
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 animate-pulse rounded-3xl flex items-center justify-center text-gray-400">Cargando Mapa...</div>
});

type Driver = {
    id: string;
    name: string;
    lastLat: number | null;
    lastLng: number | null;
    isActive: boolean;
};

export function FleetMapWrapper({ drivers }: { drivers: any[] }) {
    // Cast drivers to expected type if needed, or pass through
    return <FleetMap drivers={drivers} />;
}
