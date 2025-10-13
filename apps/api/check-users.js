const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  console.log('🔍 Checking users and their associations...\n');
  
  // Get all users
  const users = await prisma.user.findMany({
    include: {
      client: true,
      supplier: true
    }
  });
  
  console.log(`Found ${users.length} users:`);
  users.forEach(user => {
    console.log(`- ${user.email} (${user.role})`);
    console.log(`  Name: ${user.firstName} ${user.lastName}`);
    console.log(`  Client ID: ${user.clientId || 'None'}`);
    console.log(`  Supplier ID: ${user.supplierId || 'None'}`);
    if (user.client) {
      console.log(`  Client: ${user.client.name}`);
    }
    if (user.supplier) {
      console.log(`  Supplier: ${user.supplier.name}`);
    }
    console.log('');
  });
  
  // Get all clients
  const clients = await prisma.client.findMany();
  console.log(`\nFound ${clients.length} clients:`);
  clients.forEach(client => {
    console.log(`- ${client.name} (${client.clientCode})`);
  });
  
  await prisma.$disconnect();
}

checkUsers().catch(console.error);
