import { prisma } from "../lib/prisma";

async function main() {
  const email = "driver@test.com";
  const user = await prisma.user.findUnique({ where: { email } });
  console.log("User:", email);
  console.log("Role:", user?.role);
}

main();
