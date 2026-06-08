const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function getUltimoAniversario(antiguedadAnios) {
  if (!antiguedadAnios) return null;
  const inicio = new Date(antiguedadAnios);
  const hoy = new Date();

  let años = hoy.getFullYear() - inicio.getFullYear();
  const mesOffset = hoy.getMonth() - inicio.getMonth();
  if (mesOffset < 0 || (mesOffset === 0 && hoy.getDate() < inicio.getDate())) {
    años--;
  }

  if (años < 1) return null;
  return new Date(inicio.getFullYear() + años, inicio.getMonth(), inicio.getDate());
}

function calcularDiasVacaciones(antiguedadAnios) {
  if (!antiguedadAnios) return 0;
  const inicio = new Date(antiguedadAnios);
  const hoy = new Date();

  let años = hoy.getFullYear() - inicio.getFullYear();
  const mesOffset = hoy.getMonth() - inicio.getMonth();
  if (mesOffset < 0 || (mesOffset === 0 && hoy.getDate() < inicio.getDate())) {
    años--;
  }

  if (años < 1) return 0;
  if (años <= 5) return 12 + (años - 1) * 2;
  const periodos = Math.floor((años - 5) / 5);
  return 20 + periodos * 2;
}

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, firstName: true, lastName: true, antiguedadAnios: true, diasVacaciones: true, diasVacUsados: true },
  });

  const vacacionesAprobadas = await prisma.vacacion.findMany({
    where: { estado: "APROBADO" },
    select: { userId: true, diasTotal: true, fechaInicio: true },
  });

  let updated = 0;
  for (const u of users) {
    const diasVacaciones = calcularDiasVacaciones(u.antiguedadAnios);
    const ultimoAniversario = getUltimoAniversario(u.antiguedadAnios);

    const diasVacUsados = ultimoAniversario
      ? vacacionesAprobadas
          .filter((v) => v.userId === u.id && new Date(v.fechaInicio) >= ultimoAniversario)
          .reduce((sum, v) => sum + v.diasTotal, 0)
      : 0;

    if (u.diasVacaciones !== diasVacaciones) {
      await prisma.user.update({
        where: { id: u.id },
        data: { diasVacaciones },
      });
      console.log(`✔ ${u.firstName} ${u.lastName}: diasVacaciones=${diasVacaciones} (era ${u.diasVacaciones})`);
      updated++;
    } else {
      console.log(`  ${u.firstName} ${u.lastName}: sin cambios (${diasVacaciones} dias)`);
    }
  }

  console.log(`\nActualizados: ${updated} / ${users.length} usuarios`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
