import { prisma } from "@/lib/prisma";

export async function Marquee() {
  const announcements = await prisma.announcement.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  if (announcements.length === 0) return null;

  // Duplicate content to ensure smooth seamless loop
  // Use a unique separator or just spaces. The user wants "texto separado".
  // We will replicate the array to ensure loop content.
  const loopItems = [...announcements, ...announcements, ...announcements, ...announcements];

  return (
    <div className="bg-[#12753e] text-white overflow-hidden py-2 relative z-50 pointer-events-none select-none">
      <div className="marquee-container flex whitespace-nowrap">
        <div className="animate-marquee inline-block whitespace-nowrap">
          {loopItems.map((a, i) => (
             <span key={i} className="mx-24 font-bold text-sm tracking-wide inline-block">
                {a.text}
             </span>
          ))}
        </div>
        <div className="animate-marquee inline-block whitespace-nowrap absolute top-2 left-0">
           {loopItems.map((a, i) => (
             <span key={`dup-${i}`} className="mx-24 font-bold text-sm tracking-wide inline-block">
                {a.text}
             </span>
          ))}
        </div>
      </div>
      <style>{`
        /* Custom speed override if needed, though global has 15s */
        .animate-marquee {
          animation-duration: 20s; /* Adjust speed faster/slower here */
        }
      `}</style>
    </div>
  );
}
