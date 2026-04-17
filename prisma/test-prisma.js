const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.findFirst().then(u => {
  console.log('Prisma works:', !!u);
  console.log('Has sexo field:', u ? 'sexo' in u : 'no user');
  p.$disconnect();
}).catch(e => {
  console.log('Error:', e.message);
  p.$disconnect();
});
