import { prisma } from "./src/lib/prisma.ts";
async function checkUsers() {
  const users = await prisma.user.findMany();
  console.log('Users:', JSON.stringify(users, null, 2));
}
checkUsers().catch(console.error);
