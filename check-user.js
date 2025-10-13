const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'info@royalagencija.ba' },
      include: {
        client: true,
        supplier: true
      }
    });

    console.log('User record:', JSON.stringify(user, null, 2));

  } catch (error) {
    console.error('Error checking user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
