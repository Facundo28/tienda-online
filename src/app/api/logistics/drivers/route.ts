import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { UserRole } from "@/generated/prisma/enums";
import { hashPassword } from "@/lib/auth/password";

export async function POST(req: Request) {
  try {
      const user = await requireUser();
      
      // Get Company
      const company = await prisma.logisticsCompany.findUnique({
          where: { ownerId: user.id }
      });

      if (!company) {
          return NextResponse.json({ error: "No tienes una empresa registrada" }, { status: 403 });
      }

      const formData = await req.formData();
      const name = formData.get("name") as string;
      const email = formData.get("email") as string;
      const phone = formData.get("phone") as string;
      const dni = formData.get("dni") as string; // We should store this in identityDocUrl or a new field? For now in User or separate profile?
      // For MVP, putting DNI in addressInstructions or a new field would be better, but user schema has identityDocUrl.
      // Let's assume we store it in a generic way or update schema later if specific DNI field needed.
      // Using 'phone' is standard.

      // Default password for workers
      const defaultPassword = await hashPassword("trabajador123");

      const newWorker = await prisma.user.create({
          data: {
              name,
              email,
              phone,
              passwordHash: defaultPassword,
              role: UserRole.DRIVER,
              workerOfId: company.id,
              isVerified: true, // Auto verify employees?
              // Store DNI in a hacky way if needed or add field. Let's append to addressInstructions for now or ignore.
              addressInstructions: `DNI: ${dni}`
          }
      });

      // Redirect back to dashboard
      return NextResponse.redirect(new URL("/logistics", req.url));

  } catch (e: any) {
      // Handle unique email error
      if (e.code === 'P2002') {
          // If using form submission, hard to show error toast without client component. 
          // For now redirect with error query?
          return NextResponse.redirect(new URL("/logistics?error=email_exists", req.url));
      }
      return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
