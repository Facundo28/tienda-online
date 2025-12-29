"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import { User } from "lucide-react";

// Fix Leaflet icons in Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Custom Driver Icon (maybe purple or brand green?)
const driverIcon = L.divIcon({
  className: "bg-transparent border-none",
  html: `<div class="w-8 h-8 bg-green-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg></div>`
});

type Driver = {
    id: string;
    name: string;
    lastLat: number | null;
    lastLng: number | null;
    isActive: boolean;
};

export default function FleetMap({ drivers }: { drivers: Driver[] }) {
    // Default center (Buenos Aires, for example) or average of drivers
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-full w-full bg-gray-100 animate-pulse rounded-3xl" />;

    const activeDrivers = drivers.filter(d => d.lastLat && d.lastLng && d.isActive);
    const center: [number, number] = activeDrivers.length > 0 
        ? [activeDrivers[0].lastLat!, activeDrivers[0].lastLng!] 
        : [-34.6037, -58.3816]; // Buenos Aires Obelisco default

    return (
        <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%", borderRadius: "1.5rem" }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            {activeDrivers.map(driver => (
                <Marker 
                    key={driver.id} 
                    position={[driver.lastLat!, driver.lastLng!]}
                    icon={driverIcon}
                >
                    <Popup>
                        <div className="text-center">
                            <h3 className="font-bold text-gray-900">{driver.name}</h3>
                            <p className="text-xs text-green-600 font-bold">Activo</p>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
