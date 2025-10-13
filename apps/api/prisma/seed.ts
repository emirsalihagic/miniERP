import { PrismaClient, UserRole, ClientType, ClientStatus, PaymentTerms, Currency, UnitGroup } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create units as specified in requirements
  const units = await Promise.all([
    // WEIGHT units
    prisma.unit.upsert({
      where: { code: 'g' },
      update: {},
      create: {
        code: 'g',
        name: 'Gram',
        group: UnitGroup.WEIGHT,
        isBase: true,
        toBaseFactor: 1,
      },
    }),
    prisma.unit.upsert({
      where: { code: 'kg' },
      update: {},
      create: {
        code: 'kg',
        name: 'Kilogram',
        group: UnitGroup.WEIGHT,
        isBase: false,
        toBaseFactor: 1000,
      },
    }),
    prisma.unit.upsert({
      where: { code: 't' },
      update: {},
      create: {
        code: 't',
        name: 'Tonne',
        group: UnitGroup.WEIGHT,
        isBase: false,
        toBaseFactor: 1000000,
      },
    }),
    
    // VOLUME units
    prisma.unit.upsert({
      where: { code: 'ml' },
      update: {},
      create: {
        code: 'ml',
        name: 'Milliliter',
        group: UnitGroup.VOLUME,
        isBase: true,
        toBaseFactor: 1,
      },
    }),
    prisma.unit.upsert({
      where: { code: 'l' },
      update: {},
      create: {
        code: 'l',
        name: 'Liter',
        group: UnitGroup.VOLUME,
        isBase: false,
        toBaseFactor: 1000,
      },
    }),
    
    // LENGTH units
    prisma.unit.upsert({
      where: { code: 'mm' },
      update: {},
      create: {
        code: 'mm',
        name: 'Millimeter',
        group: UnitGroup.LENGTH,
        isBase: true,
        toBaseFactor: 1,
      },
    }),
    prisma.unit.upsert({
      where: { code: 'cm' },
      update: {},
      create: {
        code: 'cm',
        name: 'Centimeter',
        group: UnitGroup.LENGTH,
        isBase: false,
        toBaseFactor: 10,
      },
    }),
    prisma.unit.upsert({
      where: { code: 'm' },
      update: {},
      create: {
        code: 'm',
        name: 'Meter',
        group: UnitGroup.LENGTH,
        isBase: false,
        toBaseFactor: 1000,
      },
    }),
    
    // COUNT units
    prisma.unit.upsert({
      where: { code: 'pc' },
      update: {},
      create: {
        code: 'pc',
        name: 'Piece',
        group: UnitGroup.COUNT,
        isBase: true,
        toBaseFactor: 1,
      },
    }),
  ]);

  console.log(`✅ Created ${units.length} units`);

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

  // Create client user for Royal Agencija
  const clientUser = await prisma.user.upsert({
    where: { email: 'agencija@royalagencija.ba' },
    update: {},
    create: {
      email: 'agencija@royalagencija.ba',
      password: hashedPassword,
      firstName: 'Agencija',
      lastName: 'Royal',
      role: UserRole.CLIENT_USER,
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  console.log('✅ Created client user:', clientUser.email);

  // Create suppliers
  const suppliers = await Promise.all([
    prisma.supplier.upsert({
      where: { taxId: 'TAX-ACME-001' },
      update: {},
      create: {
        name: 'ACME Corp',
        email: 'contact@acme.com',
        taxId: 'TAX-ACME-001',
        phone: '+1-555-0100',
        address: '123 Business St',
        city: 'New York',
        country: 'USA',
      },
    }),
    prisma.supplier.upsert({
      where: { taxId: 'TAX-GS-002' },
      update: {},
      create: {
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
    prisma.product.upsert({
      where: { sku: 'WIDGET-001' },
      update: { status: 'ACTIVE' },
      create: {
        sku: 'WIDGET-001',
        name: 'Super Widget',
        description: 'High-quality widget for all your needs',
        category: 'Electronics',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[0].id,
        status: 'ACTIVE',
      },
    }),
    prisma.product.upsert({
      where: { sku: 'GADGET-002' },
      update: { status: 'ACTIVE' },
      create: {
        sku: 'GADGET-002',
        name: 'Premium Gadget',
        description: 'Advanced gadget with premium features',
        category: 'Electronics',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[0].id,
        status: 'ACTIVE',
      },
    }),
    prisma.product.upsert({
      where: { sku: 'TOOL-003' },
      update: { status: 'ACTIVE' },
      create: {
        sku: 'TOOL-003',
        name: 'Industrial Tool',
        description: 'Heavy-duty industrial tool',
        category: 'Tools',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[1].id,
        status: 'ACTIVE',
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

  // Create clients with new structure
  const clients = await Promise.all([
    prisma.client.upsert({
      where: { clientCode: 'CLT-ROYAL-01' },
      update: {},
      create: {
        name: 'Royal Agencija d.o.o.',
        type: ClientType.COMPANY,
        email: 'info@royalagencija.ba',
        phone: '+38761000000',
        billingCity: 'Sarajevo',
        billingCountry: 'Bosnia and Herzegovina',
        status: ClientStatus.ACTIVE,
        paymentTerms: PaymentTerms.D30,
        preferredCurrency: Currency.BAM,
        tags: ['vip', 'partner'],
        clientCode: 'CLT-ROYAL-01',
        assignedToId: adminUser.id,
        creditLimit: 50000,
        leadSource: 'Referral',
        lastContactedAt: new Date('2024-01-15'),
        nextFollowupAt: new Date('2024-02-15'),
        notes: 'VIP client with excellent payment history',
      },
    }),
    prisma.client.create({
      data: {
        name: 'Test Individual',
        type: ClientType.INDIVIDUAL,
        email: 'user@example.com',
        billingCity: 'Mostar',
        billingCountry: 'Bosnia and Herzegovina',
        status: ClientStatus.PROSPECT,
        paymentTerms: PaymentTerms.ON_RECEIPT,
        preferredCurrency: Currency.EUR,
        tags: ['lead'],
        creditLimit: 5000,
        leadSource: 'Website',
        notes: 'New prospect, needs follow-up',
      },
    }),
    prisma.client.upsert({
      where: { clientCode: 'CLT-TECH-001' },
      update: {},
      create: {
        name: 'Tech Solutions Inc',
        type: ClientType.COMPANY,
        email: 'billing@techsolutions.com',
        phone: '+1-555-1000',
        billingStreet: '789 Corporate Blvd',
        billingCity: 'San Francisco',
        billingZip: '94105',
        billingCountry: 'USA',
        status: ClientStatus.ACTIVE,
        paymentTerms: PaymentTerms.D15,
        preferredCurrency: Currency.USD,
        tags: ['enterprise', 'tech'],
        clientCode: 'CLT-TECH-001',
        creditLimit: 100000,
        leadSource: 'Trade Show',
        lastContactedAt: new Date('2024-01-10'),
        nextFollowupAt: new Date('2024-02-10'),
        notes: 'Large enterprise client',
      },
    }),
  ]);

  console.log(`✅ Created ${clients.length} clients`);

  // Associate client user with Royal Agencija client
  // Check if there's already a user associated with this client
  const existingClientUser = await prisma.user.findFirst({
    where: { clientId: clients[0].id },
  });

  if (!existingClientUser) {
    await prisma.user.update({
      where: { id: clientUser.id },
      data: { clientId: clients[0].id },
    });
    console.log('✅ Associated client user with Royal Agencija client');
  } else {
    console.log('✅ Client user already associated with Royal Agencija client');
  }

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

  // Create sample cart for client user
  const clientUserWithClient = await prisma.user.findFirst({
    where: { 
      role: UserRole.CLIENT_USER,
      clientId: { not: null }
    },
  });

  if (clientUserWithClient && clientUserWithClient.clientId) {
    // Create or update cart
    const cart = await prisma.cart.upsert({
      where: { clientId: clientUserWithClient.clientId },
      update: {},
      create: {
        clientId: clientUserWithClient.clientId,
      },
    });

    // Add sample items to cart
    const sampleProducts = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      take: 3,
    });

    for (const product of sampleProducts) {
      await prisma.cartItem.upsert({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: product.id,
          },
        },
        update: {
          quantity: 2.5,
        },
        create: {
          cartId: cart.id,
          productId: product.id,
          quantity: 2.5,
        },
      });
    }

    console.log('✅ Created sample cart with items');

    // Delete existing orders first to ensure clean creation
    await prisma.orderItem.deleteMany({
      where: {
        order: {
          orderNumber: {
            in: ['ORD-2024-000001', 'ORD-2024-000002']
          }
        }
      }
    });
    await prisma.order.deleteMany({
      where: {
        orderNumber: {
          in: ['ORD-2024-000001', 'ORD-2024-000002']
        }
      }
    });

    // Create sample orders
    const order1 = await prisma.order.create({
      data: {
        orderNumber: 'ORD-2024-000001',
        clientId: clientUserWithClient.clientId,
        status: 'PENDING',
        subtotal: '150.00',
        taxTotal: '30.00',
        grandTotal: '180.00',
        currency: 'EUR',
        notes: 'Sample pending order',
        items: {
          create: sampleProducts.slice(0, 2).map((product, index) => ({
            productId: product.id,
            sku: product.sku,
            productName: product.name || 'Unknown Product',
            quantity: '1.0',
            unitPrice: '50.00',
            taxRate: '20.00',
            lineSubtotal: '50.00',
            lineTax: '10.00',
            lineTotal: '60.00',
          })),
        },
      },
    });

    const order2 = await prisma.order.create({
      data: {
        orderNumber: 'ORD-2024-000002',
        clientId: clientUserWithClient.clientId,
        status: 'INVOICE_CREATED',
        subtotal: '200.00',
        taxTotal: '40.00',
        grandTotal: '240.00',
        currency: 'EUR',
        notes: 'Sample order with invoice',
        items: {
          create: sampleProducts.slice(1, 3).map((product, index) => ({
            productId: product.id,
            sku: product.sku,
            productName: product.name || 'Unknown Product',
            quantity: '2.0',
            unitPrice: '50.00',
            taxRate: '20.00',
            lineSubtotal: '100.00',
            lineTax: '20.00',
            lineTotal: '120.00',
          })),
        },
      },
    });

    // Delete existing invoice first to ensure clean creation
    await prisma.invoiceItem.deleteMany({
      where: {
        invoice: {
          invoiceNumber: 'INV-2024-000001'
        }
      }
    });
    await prisma.invoice.deleteMany({
      where: {
        invoiceNumber: 'INV-2024-000001'
      }
    });

    // Create invoice for order2
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2024-000001',
        clientId: clientUserWithClient.clientId,
        status: 'QUOTE',
        subtotal: '200.00',
        taxTotal: '40.00',
        grandTotal: '240.00',
        currency: 'EUR',
        notes: 'Invoice for order ORD-2024-000002',
        items: {
          create: sampleProducts.slice(1, 3).map((product, index) => ({
            productId: product.id,
            sku: product.sku,
            productName: product.name || 'Unknown Product',
            quantity: '2.0',
            unitPrice: '50.00',
            taxRate: '20.00',
            discountPercent: '0.00',
            lineSubtotal: '100.00',
            lineTax: '20.00',
            lineDiscount: '0.00',
            lineTotal: '120.00',
          })),
        },
      },
    });

    // Link invoice to order
    await prisma.order.update({
      where: { id: order2.id },
      data: { invoiceId: invoice.id },
    });

    console.log('✅ Created sample orders and invoice');
  }

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

