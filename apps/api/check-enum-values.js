const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function checkEnumValues() {
  try {
    // Try to create a product with different statuses to see which ones work
    const statuses = ['REGISTRATION', 'ACTIVE', 'INACTIVE', 'DISCONTINUED', 'DRAFT'];
    
    for (const status of statuses) {
      try {
        console.log(`Testing status: ${status}`);
        // This will fail if the enum value doesn't exist
        await prisma.$executeRaw`SELECT '${status}'::"ProductStatus"`;
        console.log(`✅ ${status} is valid`);
      } catch (error) {
        console.log(`❌ ${status} is invalid: ${error.message}`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEnumValues();
