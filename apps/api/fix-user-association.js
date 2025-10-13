const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixUserAssociation() {
  console.log('🔧 Fixing user association...\n');
  
  // Get the Royal Agencija client
  const client = await prisma.client.findFirst({
    where: { clientCode: 'CLT-ROYAL-01' }
  });
  
  if (!client) {
    console.log('❌ Royal Agencija client not found');
    return;
  }
  
  console.log(`Found client: ${client.name} (ID: ${client.id})`);
  
  // First, remove association from the other user to avoid conflicts
  await prisma.user.update({
    where: { email: 'info@royalagencija.ba' },
    data: { clientId: null }
  });
  
  console.log('✅ Removed association from info@royalagencija.ba');
  
  // Now update the agencija@royalagencija.ba user to be associated with this client
  const updatedUser = await prisma.user.update({
    where: { email: 'agencija@royalagencija.ba' },
    data: { clientId: client.id }
  });
  
  console.log(`✅ Updated user ${updatedUser.email} to be associated with ${client.name}`);
  
  await prisma.$disconnect();
}

fixUserAssociation().catch(console.error);