const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  let updated = 0;

  for (const user of users) {
    const nombre = user.firstName.trim().split(/\s+/)[0].toLowerCase();
    const apellidos = user.lastName.trim().split(/\s+/);
    const iniciales = apellidos.map(a => a[0]?.toLowerCase() || "").join("");
    const newEmail = `${nombre}${iniciales}.mmendoza@gmail.com`;

    if (user.email !== newEmail) {
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { email: newEmail },
        });
        console.log(`  ${user.firstName} ${user.lastName} => ${newEmail}`);
        updated++;
      } catch (err) {
        // Duplicate email - append nip
        const fallback = `${nombre}${iniciales}${user.nip}.mmendoza@gmail.com`;
        await prisma.user.update({
          where: { id: user.id },
          data: { email: fallback },
        });
        console.log(`  ${user.firstName} ${user.lastName} => ${fallback} (duplicado)`);
        updated++;
      }
    }
  }

  console.log(`\nEmails actualizados: ${updated} / ${users.length}`);
  await prisma.$disconnect();
}

main().catch(console.error);
