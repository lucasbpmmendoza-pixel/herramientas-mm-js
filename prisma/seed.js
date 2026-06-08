import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de base de datos...");

  // Limpiar datos existentes
  await prisma.auditLog.deleteMany({});
  await prisma.estadistica.deleteMany({});
  await prisma.vacacion.deleteMany({});
  await prisma.permiso.deleteMany({});
  await prisma.user.deleteMany({});

  // Crear usuarios admin
  const adminPassword = await bcryptjs.hash("admin123", 10);
  const userPassword = await bcryptjs.hash("user123", 10);

  const admin = await prisma.user.create({
    data: {
      username: "admin",
      nip: "0001",
      password: adminPassword,
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "User",
      isAdmin: true,
      role: "ADMIN",
    },
  });

  const user1 = await prisma.user.create({
    data: {
      username: "jdoe",
      nip: "0002",
      password: userPassword,
      email: "john.doe@example.com",
      firstName: "John",
      lastName: "Doe",
      isAdmin: false,
      role: "USER",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      username: "msmith",
      nip: "0003",
      password: userPassword,
      email: "maria.smith@example.com",
      firstName: "Maria",
      lastName: "Smith",
      isAdmin: false,
      role: "USER",
    },
  });

  // Crear datos de prueba para estadisticas
  const currentDate = new Date();
  await prisma.estadistica.create({
    data: {
      userId: user1.id,
      metaTrabajo: 160,
      horasTrabajadas: 152,
      proyectos: 5,
      tareasCompletas: 45,
      tareasRetrasadas: 2,
      calificacion: 4.5,
      mes: currentDate.getMonth() + 1,
      año: currentDate.getFullYear(),
    },
  });

  await prisma.estadistica.create({
    data: {
      userId: user2.id,
      metaTrabajo: 160,
      horasTrabajadas: 155,
      proyectos: 4,
      tareasCompletas: 38,
      tareasRetrasadas: 1,
      calificacion: 4.7,
      mes: currentDate.getMonth() + 1,
      año: currentDate.getFullYear(),
    },
  });

  console.log("✅ Seed completado exitosamente!");
  console.log("AdminUser:", admin);
  console.log("RegularUsers:", [user1, user2]);
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
