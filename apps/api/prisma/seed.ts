import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@minierp.com' },
    update: {},
    create: {
      email: 'admin@minierp.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.EMPLOYEE,
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  console.log('✅ Created admin user:', adminUser.email);

  // Create suppliers
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        name: 'ACME Corp',
        email: 'contact@acme.com',
        taxId: 'TAX-ACME-001',
        phone: '+1-555-0100',
        address: '123 Business St',
        city: 'New York',
        country: 'USA',
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'Global Supplies Ltd',
        email: 'info@globalsupplies.com',
        taxId: 'TAX-GS-002',
        phone: '+1-555-0200',
        address: '456 Industry Ave',
        city: 'Los Angeles',
        country: 'USA',
      },
    }),
  ]);

  console.log(`✅ Created ${suppliers.length} suppliers`);

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        sku: 'WIDGET-001',
        name: 'Super Widget',
        description: 'High-quality widget for all your needs',
        category: 'Electronics',
        unit: 'pcs',
        supplierId: suppliers[0].id,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'GADGET-002',
        name: 'Premium Gadget',
        description: 'Advanced gadget with premium features',
        category: 'Electronics',
        unit: 'pcs',
        supplierId: suppliers[0].id,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'TOOL-003',
        name: 'Industrial Tool',
        description: 'Heavy-duty industrial tool',
        category: 'Tools',
        unit: 'pcs',
        supplierId: suppliers[1].id,
      },
    }),
  ]);

  console.log(`✅ Created ${products.length} products`);

  // Create base pricing
  await Promise.all(
    products.map((product, index) =>
      prisma.pricing.create({
        data: {
          productId: product.id,
          price: (100 + index * 50).toString(),
          currency: 'USD',
          taxRate: '20',
          discountPercent: '0',
          effectiveFrom: new Date(),
        },
      }),
    ),
  );

  console.log('✅ Created base pricing for all products');

  // Create clients
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        name: 'Tech Solutions Inc',
        email: 'billing@techsolutions.com',
        taxId: 'TAX-TS-001',
        phone: '+1-555-1000',
        address: '789 Corporate Blvd',
        city: 'San Francisco',
        country: 'USA',
      },
    }),
    prisma.client.create({
      data: {
        name: 'Retail Giants LLC',
        email: 'finance@retailgiants.com',
        taxId: 'TAX-RG-002',
        phone: '+1-555-2000',
        address: '321 Commerce St',
        city: 'Chicago',
        country: 'USA',
      },
    }),
  ]);

  console.log(`✅ Created ${clients.length} clients`);

  // Create client-specific pricing override
  await prisma.pricing.create({
    data: {
      productId: products[0].id,
      clientId: clients[0].id,
      price: '85.00',
      currency: 'USD',
      taxRate: '20',
      discountPercent: '5',
      effectiveFrom: new Date(),
    },
  });

  console.log('✅ Created client-specific pricing override');

  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

