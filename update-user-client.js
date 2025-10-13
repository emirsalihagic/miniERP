const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateUserClient() {
  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: 'info@royalagencija.ba' }
    });

    if (!user) {
      console.log('User not found');
      return;
    }

    // Find the client
    const client = await prisma.client.findFirst({
      where: { email: 'info@royalagencija.ba' }
    });

    if (!client) {
      console.log('Client not found');
      return;
    }

    // Update the user with clientId
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { clientId: client.id }
    });

    console.log('User updated successfully:', {
      id: updatedUser.id,
      email: updatedUser.email,
      clientId: updatedUser.clientId
    });

  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserClient();
