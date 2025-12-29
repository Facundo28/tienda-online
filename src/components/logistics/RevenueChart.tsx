"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatCurrencyFromCents } from "@/lib/money";

type DataPoint = {
    name: string; // "Lun", "Mar", etc
    total: number; // in cents
};

export function RevenueChart({ data }: { data: DataPoint[] }) {
    if (data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No hay datos de ingresos esta semana.
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} 
                    dy={10}
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    tickFormatter={(value) => `$${value / 100}`}
                />
                <Tooltip 
                    cursor={{ fill: '#f9fafb' }}
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            return (
                                <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl">
                                    <p className="font-bold mb-1">{payload[0].payload.name}</p>
                                    <p className="font-mono text-green-300">
                                        {formatCurrencyFromCents(payload[0].value as number)}
                                    </p>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Bar 
                    dataKey="total" 
                    fill="#12753e" 
                    radius={[6, 6, 6, 6]} 
                    barSize={32}
                    activeBar={{ fill: '#0e5c30' }}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
