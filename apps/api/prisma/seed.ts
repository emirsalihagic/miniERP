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

  console.log(`[SUCCESS] Created ${units.length} units`);

  // Create laptop-specific attributes
  const laptopAttributes = await Promise.all([
    prisma.attribute.create({
      data: {
        name: 'RAM',
        type: 'LIST',
      },
    }),
    prisma.attribute.create({
      data: {
        name: 'Storage Capacity',
        type: 'LIST',
      },
    }),
    prisma.attribute.create({
      data: {
        name: 'CPU',
        type: 'LIST',
      },
    }),
    prisma.attribute.create({
      data: {
        name: 'GPU',
        type: 'LIST',
      },
    }),
    prisma.attribute.create({
      data: {
        name: 'Screen Size',
        type: 'LIST',
      },
    }),
    prisma.attribute.create({
      data: {
        name: 'Operating System',
        type: 'LIST',
      },
    }),
    prisma.attribute.create({
      data: {
        name: 'Weight',
        type: 'NUMBER',
      },
    }),
    prisma.attribute.create({
      data: {
        name: 'Battery Life',
        type: 'NUMBER',
      },
    }),
  ]);

  // Create attribute options for LIST type attributes
  const attributeOptions = [
    // RAM options
    { attributeId: laptopAttributes[0].id, options: ['8GB', '16GB', '18GB', '32GB', '64GB'] },
    // Storage Capacity options
    { attributeId: laptopAttributes[1].id, options: ['256GB', '512GB', '1TB', '2TB', '4TB'] },
    // CPU options
    { attributeId: laptopAttributes[2].id, options: ['Intel i5', 'Intel i7', 'AMD Ryzen 7', 'Apple M3 Pro', 'Apple M3 Max'] },
    // GPU options
    { attributeId: laptopAttributes[3].id, options: ['Integrated', 'RTX 4060', 'RTX 4070', 'RTX 4080', 'Apple M3 Pro GPU'] },
    // Screen Size options
    { attributeId: laptopAttributes[4].id, options: ['13"', '14"', '15"', '16"', '17"'] },
    // Operating System options
    { attributeId: laptopAttributes[5].id, options: ['Windows 11', 'macOS Sonoma', 'Linux Ubuntu', 'Chrome OS'] },
  ];

  for (const attrOption of attributeOptions) {
    for (let i = 0; i < attrOption.options.length; i++) {
      await prisma.attributeOption.create({
        data: {
          attributeId: attrOption.attributeId,
          option: attrOption.options[i],
          sortOrder: i,
        },
      });
    }
  }

  console.log(`[SUCCESS] Created ${laptopAttributes.length} laptop attributes`);

  // Create iPhone-specific attributes for product group variations
  const iPhoneAttributes = await Promise.all([
    prisma.attribute.create({
      data: {
        name: 'Storage',
        type: 'LIST',
      },
    }),
    prisma.attribute.create({
      data: {
        name: 'Color',
        type: 'LIST',
      },
    }),
  ]);

  // Create attribute options for iPhone attributes
  const iPhoneAttributeOptions = [
    // Storage options
    { attributeId: iPhoneAttributes[0].id, options: ['256GB', '512GB'] },
    // Color options
    { attributeId: iPhoneAttributes[1].id, options: ['Black', 'White', 'Mist Blue', 'Sage', 'Lavender'] },
  ];

  for (const attrOption of iPhoneAttributeOptions) {
    for (let i = 0; i < attrOption.options.length; i++) {
      await prisma.attributeOption.create({
        data: {
          attributeId: attrOption.attributeId,
          option: attrOption.options[i],
          sortOrder: i,
        },
      });
    }
  }

  console.log(`[SUCCESS] Created ${iPhoneAttributes.length} iPhone attributes`);

  // Create iPhone 17 product group
  const iPhoneProductGroup = await prisma.productGroup.upsert({
    where: { code: 'IPHONE-17' },
    update: {},
    create: {
      name: 'iPhone 17',
      code: 'IPHONE-17',
      description: 'Apple iPhone 17 with A19 chipset, 6.3-inch OLED ProMotion display, Dual 48MP camera system',
    },
  });

  console.log('[SUCCESS] Created iPhone 17 product group');

  // Create iPhone 17 Pro product group
  const iPhoneProProductGroup = await prisma.productGroup.upsert({
    where: { code: 'IPHONE-17-PRO' },
    update: {},
    create: {
      name: 'iPhone 17 Pro',
      code: 'IPHONE-17-PRO',
      description: 'Apple iPhone 17 Pro with A19 Pro chipset, 6.3-inch OLED ProMotion 120Hz display, Triple 48MP camera system with 8× optical zoom',
    },
  });

  console.log('[SUCCESS] Created iPhone 17 Pro product group');

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

  console.log('[SUCCESS] Created admin user:', adminUser.email);

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

  console.log('[SUCCESS] Created client user:', clientUser.email);

  // Create comprehensive suppliers
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
    prisma.supplier.upsert({
      where: { taxId: 'TAX-EURO-003' },
      update: {},
      create: {
        name: 'European Components GmbH',
        email: 'sales@eurocomponents.de',
        taxId: 'TAX-EURO-003',
        phone: '+49-30-98765432',
        address: 'Hauptstraße 100',
        city: 'Munich',
        country: 'Germany',
      },
    }),
    prisma.supplier.upsert({
      where: { taxId: 'TAX-ASIA-004' },
      update: {},
      create: {
        name: 'Asian Manufacturing Co.',
        email: 'orders@asianmfg.com',
        taxId: 'TAX-ASIA-004',
        phone: '+86-21-1234-5678',
        address: 'Nanjing Road 500',
        city: 'Shanghai',
        country: 'China',
      },
    }),
    prisma.supplier.upsert({
      where: { taxId: 'TAX-TECH-005' },
      update: {},
      create: {
        name: 'Tech Parts International',
        email: 'parts@techparts.com',
        taxId: 'TAX-TECH-005',
        phone: '+1-408-555-0123',
        address: 'Silicon Valley Blvd 1000',
        city: 'San Jose',
        country: 'USA',
      },
    }),
  ]);

  console.log(`[SUCCESS] Created ${suppliers.length} suppliers`);

  // Create realistic demo products
  const products = await Promise.all([
    // Office Supplies
    prisma.product.upsert({
      where: { sku: 'OFF-001' },
      update: { status: 'ACTIVE' },
      create: {
        sku: 'OFF-001',
        name: 'Premium Ballpoint Pen',
        description: 'Smooth-writing ballpoint pen with ergonomic grip',
        category: 'Office Supplies',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[0].id,
        status: 'ACTIVE',
        storageType: 'AMBIENT',
      },
    }),
    prisma.product.upsert({
      where: { sku: 'OFF-002' },
      update: {},
      create: {
        sku: 'OFF-002',
        name: 'A4 Copy Paper (500 sheets)',
        description: 'High-quality white copy paper, 80gsm',
        category: 'Office Supplies',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[1].id,
        status: 'ACTIVE',
        storageType: 'DRY',
      },
    }),
    prisma.product.upsert({
      where: { sku: 'OFF-003' },
      update: {},
      create: {
        sku: 'OFF-003',
        name: 'Stapler Heavy Duty',
        description: 'Professional stapler for up to 20 sheets',
        category: 'Office Supplies',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[2].id,
        status: 'ACTIVE',
        storageType: 'AMBIENT',
      },
    }),
    
    // Electronics
    prisma.product.upsert({
      where: { sku: 'ELEC-001' },
      update: {},
      create: {
        sku: 'ELEC-001',
        name: 'USB-C Cable 2m',
        description: 'High-speed USB-C cable for data transfer and charging',
        category: 'Electronics',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[3].id,
        status: 'ACTIVE',
        storageType: 'AMBIENT',
      },
    }),
    prisma.product.upsert({
      where: { sku: 'ELEC-002' },
      update: {},
      create: {
        sku: 'ELEC-002',
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless optical mouse with USB receiver',
        category: 'Electronics',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[4].id,
        status: 'ACTIVE',
        storageType: 'AMBIENT',
      },
    }),
    prisma.product.upsert({
      where: { sku: 'ELEC-003' },
      update: {},
      create: {
        sku: 'ELEC-003',
        name: 'Mechanical Keyboard',
        description: 'RGB backlit mechanical keyboard with Cherry MX switches',
        category: 'Electronics',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[0].id,
        status: 'ACTIVE',
        storageType: 'AMBIENT',
      },
    }),
    
    // Furniture
    prisma.product.upsert({
      where: { sku: 'FURN-001' },
      update: {},
      create: {
        sku: 'FURN-001',
        name: 'Office Chair Ergonomic',
        description: 'Adjustable height office chair with lumbar support',
        category: 'Furniture',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[1].id,
        status: 'ACTIVE',
        storageType: 'AMBIENT',
      },
    }),
    prisma.product.upsert({
      where: { sku: 'FURN-002' },
      update: {},
      create: {
        sku: 'FURN-002',
        name: 'Desk Lamp LED',
        description: 'Adjustable LED desk lamp with USB charging port',
        category: 'Furniture',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[2].id,
        status: 'ACTIVE',
        storageType: 'AMBIENT',
      },
    }),
    
    // Cleaning Supplies
    prisma.product.upsert({
      where: { sku: 'CLEAN-001' },
      update: {},
      create: {
        sku: 'CLEAN-001',
        name: 'All-Purpose Cleaner',
        description: 'Concentrated all-purpose cleaner, 1L bottle',
        category: 'Cleaning Supplies',
        unitId: units.find(u => u.code === 'l')?.id,
        supplierId: suppliers[3].id,
        status: 'ACTIVE',
        storageType: 'AMBIENT',
      },
    }),
    prisma.product.upsert({
      where: { sku: 'CLEAN-002' },
      update: {},
      create: {
        sku: 'CLEAN-002',
        name: 'Microfiber Cloths (Pack of 10)',
        description: 'High-quality microfiber cleaning cloths',
        category: 'Cleaning Supplies',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[4].id,
        status: 'ACTIVE',
        storageType: 'AMBIENT',
      },
    }),
    
    // IT Equipment
    prisma.product.upsert({
      where: { sku: 'IT-001' },
      update: {},
      create: {
        sku: 'IT-001',
        name: 'Monitor 24" LED',
        description: '24-inch Full HD LED monitor with HDMI and VGA ports',
        category: 'IT Equipment',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[0].id,
        status: 'ACTIVE',
        storageType: 'AMBIENT',
      },
    }),
    prisma.product.upsert({
      where: { sku: 'IT-002' },
      update: {},
      create: {
        sku: 'IT-002',
        name: 'Network Switch 8-Port',
        description: 'Gigabit Ethernet switch with 8 ports',
        category: 'IT Equipment',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[1].id,
        status: 'ACTIVE',
        storageType: 'AMBIENT',
      },
    }),
    
    // Safety Equipment
    prisma.product.upsert({
      where: { sku: 'SAFE-001' },
      update: {},
      create: {
        sku: 'SAFE-001',
        name: 'Safety Glasses Clear',
        description: 'ANSI Z87.1 certified safety glasses',
        category: 'Safety Equipment',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[2].id,
        status: 'ACTIVE',
        storageType: 'AMBIENT',
      },
    }),
    
    // Food & Beverages
    prisma.product.upsert({
      where: { sku: 'FOOD-001' },
      update: {},
      create: {
        sku: 'FOOD-001',
        name: 'Coffee Beans Premium',
        description: 'Arabica coffee beans, 1kg bag',
        category: 'Food & Beverages',
        unitId: units.find(u => u.code === 'kg')?.id,
        supplierId: suppliers[3].id,
        status: 'ACTIVE',
        storageType: 'AMBIENT',
      },
    }),
    prisma.product.upsert({
      where: { sku: 'FOOD-002' },
      update: {},
      create: {
        sku: 'FOOD-002',
        name: 'Energy Drink (Pack of 24)',
        description: 'Sugar-free energy drink cans, 250ml each',
        category: 'Food & Beverages',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[4].id,
        status: 'ACTIVE',
        storageType: 'CHILLED',
      },
    }),
    
    // Different status products for demo
    prisma.product.upsert({
      where: { sku: 'DISCONT-001' },
      update: {},
      create: {
        sku: 'DISCONT-001',
        name: 'Old Model Calculator',
        description: 'Basic calculator (discontinued model)',
        category: 'Office Supplies',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[0].id,
        status: 'INACTIVE',
        storageType: 'AMBIENT',
      },
    }),
    prisma.product.upsert({
      where: { sku: 'NEW-001' },
      update: {},
      create: {
        sku: 'NEW-001',
        name: 'Smart Desk Organizer',
        description: 'Wireless charging desk organizer (coming soon)',
        category: 'Office Supplies',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[1].id,
        status: 'REGISTRATION',
        storageType: 'AMBIENT',
      },
    }),
    
    // Bulk/Industrial items
    prisma.product.upsert({
      where: { sku: 'BULK-001' },
      update: {},
      create: {
        sku: 'BULK-001',
        name: 'Steel Bolts M8x20',
        description: 'Stainless steel bolts, pack of 100',
        category: 'Hardware',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[2].id,
        status: 'ACTIVE',
        storageType: 'DRY',
      },
    }),
    prisma.product.upsert({
      where: { sku: 'BULK-002' },
      update: {},
      create: {
        sku: 'BULK-002',
        name: 'Industrial Lubricant',
        description: 'High-temperature industrial lubricant, 5L can',
        category: 'Industrial Supplies',
        unitId: units.find(u => u.code === 'l')?.id,
        supplierId: suppliers[3].id,
        status: 'ACTIVE',
        storageType: 'HAZMAT',
      },
    }),
    
    // Laptops - High-value products for demo
    prisma.product.upsert({
      where: { sku: 'LAPTOP-001' },
      update: {},
      create: {
        sku: 'LAPTOP-001',
        name: 'MacBook Pro 16" M3 Pro',
        description: 'Apple MacBook Pro 16-inch with M3 Pro chip, 18GB RAM, 512GB SSD',
        category: 'Laptops',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[0].id,
        status: 'ACTIVE',
        storageType: 'AMBIENT',
      },
    }),
    prisma.product.upsert({
      where: { sku: 'LAPTOP-002' },
      update: {},
      create: {
        sku: 'LAPTOP-002',
        name: 'Dell XPS 15 OLED',
        description: 'Dell XPS 15 with Intel i7, 16GB RAM, 1TB SSD, OLED display',
        category: 'Laptops',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[1].id,
        status: 'ACTIVE',
        storageType: 'AMBIENT',
      },
    }),
    prisma.product.upsert({
      where: { sku: 'LAPTOP-003' },
      update: {},
      create: {
        sku: 'LAPTOP-003',
        name: 'HP Spectre x360 14',
        description: 'HP Spectre x360 14-inch 2-in-1 laptop, Intel i5, 8GB RAM, 256GB SSD',
        category: 'Laptops',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[2].id,
        status: 'ACTIVE',
        storageType: 'AMBIENT',
      },
    }),
    prisma.product.upsert({
      where: { sku: 'LAPTOP-004' },
      update: {},
      create: {
        sku: 'LAPTOP-004',
        name: 'Lenovo ThinkPad X1 Carbon',
        description: 'Lenovo ThinkPad X1 Carbon Gen 11, Intel i7, 16GB RAM, 512GB SSD',
        category: 'Laptops',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[3].id,
        status: 'ACTIVE',
        storageType: 'AMBIENT',
      },
    }),
    prisma.product.upsert({
      where: { sku: 'LAPTOP-005' },
      update: {},
      create: {
        sku: 'LAPTOP-005',
        name: 'ASUS ROG Strix G15',
        description: 'ASUS ROG Strix G15 gaming laptop, AMD Ryzen 7, RTX 4060, 16GB RAM',
        category: 'Laptops',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[4].id,
        status: 'ACTIVE',
        storageType: 'AMBIENT',
      },
    }),
    prisma.product.upsert({
      where: { sku: 'LAPTOP-006' },
      update: {},
      create: {
        sku: 'LAPTOP-006',
        name: 'Microsoft Surface Laptop 5',
        description: 'Microsoft Surface Laptop 5, Intel i5, 8GB RAM, 256GB SSD',
        category: 'Laptops',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[0].id,
        status: 'ACTIVE',
        storageType: 'AMBIENT',
      },
    }),
    prisma.product.upsert({
      where: { sku: 'LAPTOP-007' },
      update: {},
      create: {
        sku: 'LAPTOP-007',
        name: 'Acer Swift 3',
        description: 'Acer Swift 3 ultrabook, Intel i5, 8GB RAM, 512GB SSD',
        category: 'Laptops',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[1].id,
        status: 'ACTIVE',
        storageType: 'AMBIENT',
      },
    }),
    prisma.product.upsert({
      where: { sku: 'LAPTOP-008' },
      update: {},
      create: {
        sku: 'LAPTOP-008',
        name: 'MSI Creator Z16',
        description: 'MSI Creator Z16 content creation laptop, Intel i7, RTX 4060, 32GB RAM',
        category: 'Laptops',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[2].id,
        status: 'ACTIVE',
        storageType: 'AMBIENT',
      },
    }),
    prisma.product.upsert({
      where: { sku: 'LAPTOP-009' },
      update: {},
      create: {
        sku: 'LAPTOP-009',
        name: 'Razer Blade 15',
        description: 'Razer Blade 15 gaming laptop, Intel i7, RTX 4070, 16GB RAM, 1TB SSD',
        category: 'Laptops',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[3].id,
        status: 'ACTIVE',
        storageType: 'AMBIENT',
      },
    }),
    prisma.product.upsert({
      where: { sku: 'LAPTOP-010' },
      update: {},
      create: {
        sku: 'LAPTOP-010',
        name: 'Framework Laptop 13',
        description: 'Framework Laptop 13 modular laptop, Intel i5, 8GB RAM, 256GB SSD',
        category: 'Laptops',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[4].id,
        status: 'ACTIVE',
        storageType: 'AMBIENT',
      },
    }),
    
    // iPhone 17 variants - Product group variations
    prisma.product.upsert({
      where: { sku: 'APL-IP17-256-BLK' },
      update: {},
      create: {
        sku: 'APL-IP17-256-BLK',
        name: 'iPhone 17 256GB Black',
        description: 'Apple iPhone 17 with A19 chipset, 6.3-inch OLED ProMotion display, Dual 48MP camera system',
        category: 'Smartphones',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[0].id,
        status: 'ACTIVE',
        storageType: 'AMBIENT',
        groupId: iPhoneProductGroup.id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'APL-IP17-256-WHT' },
      update: {},
      create: {
        sku: 'APL-IP17-256-WHT',
        name: 'iPhone 17 256GB White',
        description: 'Apple iPhone 17 with A19 chipset, 6.3-inch OLED ProMotion display, Dual 48MP camera system',
        category: 'Smartphones',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[0].id,
        status: 'ACTIVE',
        storageType: 'AMBIENT',
        groupId: iPhoneProductGroup.id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'APL-IP17-256-MBL' },
      update: {},
      create: {
        sku: 'APL-IP17-256-MBL',
        name: 'iPhone 17 256GB Mist Blue',
        description: 'Apple iPhone 17 with A19 chipset, 6.3-inch OLED ProMotion display, Dual 48MP camera system',
        category: 'Smartphones',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[0].id,
        status: 'ACTIVE',
        storageType: 'AMBIENT',
        groupId: iPhoneProductGroup.id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'APL-IP17-256-SAGE' },
      update: {},
      create: {
        sku: 'APL-IP17-256-SAGE',
        name: 'iPhone 17 256GB Sage',
        description: 'Apple iPhone 17 with A19 chipset, 6.3-inch OLED ProMotion display, Dual 48MP camera system',
        category: 'Smartphones',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[0].id,
        status: 'ACTIVE',
        storageType: 'AMBIENT',
        groupId: iPhoneProductGroup.id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'APL-IP17-256-LAV' },
      update: {},
      create: {
        sku: 'APL-IP17-256-LAV',
        name: 'iPhone 17 256GB Lavender',
        description: 'Apple iPhone 17 with A19 chipset, 6.3-inch OLED ProMotion display, Dual 48MP camera system',
        category: 'Smartphones',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[0].id,
        status: 'ACTIVE',
        storageType: 'AMBIENT',
        groupId: iPhoneProductGroup.id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'APL-IP17-512-BLK' },
      update: {},
      create: {
        sku: 'APL-IP17-512-BLK',
        name: 'iPhone 17 512GB Black',
        description: 'Apple iPhone 17 with A19 chipset, 6.3-inch OLED ProMotion display, Dual 48MP camera system',
        category: 'Smartphones',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[0].id,
        status: 'ACTIVE',
        storageType: 'AMBIENT',
        groupId: iPhoneProductGroup.id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'APL-IP17-512-WHT' },
      update: {},
      create: {
        sku: 'APL-IP17-512-WHT',
        name: 'iPhone 17 512GB White',
        description: 'Apple iPhone 17 with A19 chipset, 6.3-inch OLED ProMotion display, Dual 48MP camera system',
        category: 'Smartphones',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[0].id,
        status: 'ACTIVE',
        storageType: 'AMBIENT',
        groupId: iPhoneProductGroup.id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'APL-IP17-512-MBL' },
      update: {},
      create: {
        sku: 'APL-IP17-512-MBL',
        name: 'iPhone 17 512GB Mist Blue',
        description: 'Apple iPhone 17 with A19 chipset, 6.3-inch OLED ProMotion display, Dual 48MP camera system',
        category: 'Smartphones',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[0].id,
        status: 'ACTIVE',
        storageType: 'AMBIENT',
        groupId: iPhoneProductGroup.id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'APL-IP17-512-SAGE' },
      update: {},
      create: {
        sku: 'APL-IP17-512-SAGE',
        name: 'iPhone 17 512GB Sage',
        description: 'Apple iPhone 17 with A19 chipset, 6.3-inch OLED ProMotion display, Dual 48MP camera system',
        category: 'Smartphones',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[0].id,
        status: 'ACTIVE',
        storageType: 'AMBIENT',
        groupId: iPhoneProductGroup.id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'APL-IP17-512-LAV' },
      update: {},
      create: {
        sku: 'APL-IP17-512-LAV',
        name: 'iPhone 17 512GB Lavender',
        description: 'Apple iPhone 17 with A19 chipset, 6.3-inch OLED ProMotion display, Dual 48MP camera system',
        category: 'Smartphones',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[0].id,
        status: 'ACTIVE',
        storageType: 'AMBIENT',
        groupId: iPhoneProductGroup.id,
      },
    }),

    // iPhone 17 Pro variants - Product group variations
    prisma.product.upsert({
      where: { sku: 'APL-IP17P-256-DBLUE' },
      update: {},
      create: {
        sku: 'APL-IP17P-256-DBLUE',
        name: 'iPhone 17 Pro 256GB Deep Blue',
        description: 'Apple iPhone 17 Pro with A19 Pro chipset, 6.3-inch OLED ProMotion 120Hz display, Triple 48MP camera system with 8× optical zoom',
        category: 'Smartphones',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[0].id,
        status: 'ACTIVE',
        storageType: 'AMBIENT',
        groupId: iPhoneProProductGroup.id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'APL-IP17P-256-CORNG' },
      update: {},
      create: {
        sku: 'APL-IP17P-256-CORNG',
        name: 'iPhone 17 Pro 256GB Cosmic Orange',
        description: 'Apple iPhone 17 Pro with A19 Pro chipset, 6.3-inch OLED ProMotion 120Hz display, Triple 48MP camera system with 8× optical zoom',
        category: 'Smartphones',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[0].id,
        status: 'ACTIVE',
        storageType: 'AMBIENT',
        groupId: iPhoneProProductGroup.id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'APL-IP17P-256-SIL' },
      update: {},
      create: {
        sku: 'APL-IP17P-256-SIL',
        name: 'iPhone 17 Pro 256GB Silver',
        description: 'Apple iPhone 17 Pro with A19 Pro chipset, 6.3-inch OLED ProMotion 120Hz display, Triple 48MP camera system with 8× optical zoom',
        category: 'Smartphones',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[0].id,
        status: 'ACTIVE',
        storageType: 'AMBIENT',
        groupId: iPhoneProProductGroup.id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'APL-IP17P-512-DBLUE' },
      update: {},
      create: {
        sku: 'APL-IP17P-512-DBLUE',
        name: 'iPhone 17 Pro 512GB Deep Blue',
        description: 'Apple iPhone 17 Pro with A19 Pro chipset, 6.3-inch OLED ProMotion 120Hz display, Triple 48MP camera system with 8× optical zoom',
        category: 'Smartphones',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[0].id,
        status: 'ACTIVE',
        storageType: 'AMBIENT',
        groupId: iPhoneProProductGroup.id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'APL-IP17P-512-CORNG' },
      update: {},
      create: {
        sku: 'APL-IP17P-512-CORNG',
        name: 'iPhone 17 Pro 512GB Cosmic Orange',
        description: 'Apple iPhone 17 Pro with A19 Pro chipset, 6.3-inch OLED ProMotion 120Hz display, Triple 48MP camera system with 8× optical zoom',
        category: 'Smartphones',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[0].id,
        status: 'ACTIVE',
        storageType: 'AMBIENT',
        groupId: iPhoneProProductGroup.id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'APL-IP17P-512-SIL' },
      update: {},
      create: {
        sku: 'APL-IP17P-512-SIL',
        name: 'iPhone 17 Pro 512GB Silver',
        description: 'Apple iPhone 17 Pro with A19 Pro chipset, 6.3-inch OLED ProMotion 120Hz display, Triple 48MP camera system with 8× optical zoom',
        category: 'Smartphones',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[0].id,
        status: 'ACTIVE',
        storageType: 'AMBIENT',
        groupId: iPhoneProProductGroup.id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'APL-IP17P-1TB-DBLUE' },
      update: {},
      create: {
        sku: 'APL-IP17P-1TB-DBLUE',
        name: 'iPhone 17 Pro 1TB Deep Blue',
        description: 'Apple iPhone 17 Pro with A19 Pro chipset, 6.3-inch OLED ProMotion 120Hz display, Triple 48MP camera system with 8× optical zoom',
        category: 'Smartphones',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[0].id,
        status: 'ACTIVE',
        storageType: 'AMBIENT',
        groupId: iPhoneProProductGroup.id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'APL-IP17P-1TB-CORNG' },
      update: {},
      create: {
        sku: 'APL-IP17P-1TB-CORNG',
        name: 'iPhone 17 Pro 1TB Cosmic Orange',
        description: 'Apple iPhone 17 Pro with A19 Pro chipset, 6.3-inch OLED ProMotion 120Hz display, Triple 48MP camera system with 8× optical zoom',
        category: 'Smartphones',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[0].id,
        status: 'ACTIVE',
        storageType: 'AMBIENT',
        groupId: iPhoneProProductGroup.id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'APL-IP17P-1TB-SIL' },
      update: {},
      create: {
        sku: 'APL-IP17P-1TB-SIL',
        name: 'iPhone 17 Pro 1TB Silver',
        description: 'Apple iPhone 17 Pro with A19 Pro chipset, 6.3-inch OLED ProMotion 120Hz display, Triple 48MP camera system with 8× optical zoom',
        category: 'Smartphones',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[0].id,
        status: 'ACTIVE',
        storageType: 'AMBIENT',
        groupId: iPhoneProProductGroup.id,
      },
    }),

    // Add test products with different statuses for filtering
    prisma.product.upsert({
      where: { sku: 'TEST-INACTIVE' },
      update: { status: 'INACTIVE' },
      create: {
        sku: 'TEST-INACTIVE',
        name: 'Inactive Product',
        description: 'This product is inactive for testing',
        category: 'Electronics',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[1].id,
        status: 'INACTIVE',
        storageType: 'AMBIENT',
      },
    }),

    prisma.product.upsert({
      where: { sku: 'TEST-DRAFT' },
      update: { status: 'DRAFT' },
      create: {
        sku: 'TEST-DRAFT',
        name: 'Draft Product',
        description: 'This product is still in draft status for testing',
        category: 'Office Supplies',
        unitId: units.find(u => u.code === 'pc')?.id,
        supplierId: suppliers[2].id,
        status: 'DRAFT',
        storageType: 'AMBIENT',
      },
    }),
  ]);

  console.log(`[SUCCESS] Created ${products.length} products`);

  // Create laptop product attribute values
  const laptopAttributeValues = [
    // MacBook Pro 16" M3 Pro
    { sku: 'LAPTOP-001', attributes: [
      { name: 'RAM', value: '18GB' },
      { name: 'Storage Capacity', value: '512GB' },
      { name: 'CPU', value: 'Apple M3 Pro' },
      { name: 'GPU', value: 'Apple M3 Pro GPU' },
      { name: 'Screen Size', value: '16"' },
      { name: 'Operating System', value: 'macOS Sonoma' },
      { name: 'Weight', value: '2.1' },
      { name: 'Battery Life', value: '22' },
    ]},
    // Dell XPS 15 OLED
    { sku: 'LAPTOP-002', attributes: [
      { name: 'RAM', value: '16GB' },
      { name: 'Storage Capacity', value: '1TB' },
      { name: 'CPU', value: 'Intel i7' },
      { name: 'GPU', value: 'Integrated' },
      { name: 'Screen Size', value: '15"' },
      { name: 'Operating System', value: 'Windows 11' },
      { name: 'Weight', value: '1.8' },
      { name: 'Battery Life', value: '12' },
    ]},
    // HP Spectre x360 14
    { sku: 'LAPTOP-003', attributes: [
      { name: 'RAM', value: '8GB' },
      { name: 'Storage Capacity', value: '256GB' },
      { name: 'CPU', value: 'Intel i5' },
      { name: 'GPU', value: 'Integrated' },
      { name: 'Screen Size', value: '14"' },
      { name: 'Operating System', value: 'Windows 11' },
      { name: 'Weight', value: '1.4' },
      { name: 'Battery Life', value: '10' },
    ]},
    // Lenovo ThinkPad X1 Carbon
    { sku: 'LAPTOP-004', attributes: [
      { name: 'RAM', value: '16GB' },
      { name: 'Storage Capacity', value: '512GB' },
      { name: 'CPU', value: 'Intel i7' },
      { name: 'GPU', value: 'Integrated' },
      { name: 'Screen Size', value: '14"' },
      { name: 'Operating System', value: 'Windows 11' },
      { name: 'Weight', value: '1.1' },
      { name: 'Battery Life', value: '15' },
    ]},
    // ASUS ROG Strix G15
    { sku: 'LAPTOP-005', attributes: [
      { name: 'RAM', value: '16GB' },
      { name: 'Storage Capacity', value: '512GB' },
      { name: 'CPU', value: 'AMD Ryzen 7' },
      { name: 'GPU', value: 'RTX 4060' },
      { name: 'Screen Size', value: '15"' },
      { name: 'Operating System', value: 'Windows 11' },
      { name: 'Weight', value: '2.3' },
      { name: 'Battery Life', value: '6' },
    ]},
    // Microsoft Surface Laptop 5
    { sku: 'LAPTOP-006', attributes: [
      { name: 'RAM', value: '8GB' },
      { name: 'Storage Capacity', value: '256GB' },
      { name: 'CPU', value: 'Intel i5' },
      { name: 'GPU', value: 'Integrated' },
      { name: 'Screen Size', value: '13"' },
      { name: 'Operating System', value: 'Windows 11' },
      { name: 'Weight', value: '1.3' },
      { name: 'Battery Life', value: '18' },
    ]},
    // Acer Swift 3
    { sku: 'LAPTOP-007', attributes: [
      { name: 'RAM', value: '8GB' },
      { name: 'Storage Capacity', value: '512GB' },
      { name: 'CPU', value: 'Intel i5' },
      { name: 'GPU', value: 'Integrated' },
      { name: 'Screen Size', value: '14"' },
      { name: 'Operating System', value: 'Windows 11' },
      { name: 'Weight', value: '1.2' },
      { name: 'Battery Life', value: '11' },
    ]},
    // MSI Creator Z16
    { sku: 'LAPTOP-008', attributes: [
      { name: 'RAM', value: '32GB' },
      { name: 'Storage Capacity', value: '1TB' },
      { name: 'CPU', value: 'Intel i7' },
      { name: 'GPU', value: 'RTX 4060' },
      { name: 'Screen Size', value: '16"' },
      { name: 'Operating System', value: 'Windows 11' },
      { name: 'Weight', value: '2.0' },
      { name: 'Battery Life', value: '8' },
    ]},
    // Razer Blade 15
    { sku: 'LAPTOP-009', attributes: [
      { name: 'RAM', value: '16GB' },
      { name: 'Storage Capacity', value: '1TB' },
      { name: 'CPU', value: 'Intel i7' },
      { name: 'GPU', value: 'RTX 4070' },
      { name: 'Screen Size', value: '15"' },
      { name: 'Operating System', value: 'Windows 11' },
      { name: 'Weight', value: '2.0' },
      { name: 'Battery Life', value: '7' },
    ]},
    // Framework Laptop 13
    { sku: 'LAPTOP-010', attributes: [
      { name: 'RAM', value: '8GB' },
      { name: 'Storage Capacity', value: '256GB' },
      { name: 'CPU', value: 'Intel i5' },
      { name: 'GPU', value: 'Integrated' },
      { name: 'Screen Size', value: '13"' },
      { name: 'Operating System', value: 'Linux Ubuntu' },
      { name: 'Weight', value: '1.3' },
      { name: 'Battery Life', value: '9' },
    ]},
  ];

  // Create product attribute values for laptops
  for (const laptop of laptopAttributeValues) {
    const product = products.find(p => p.sku === laptop.sku);
    if (product) {
      for (const attr of laptop.attributes) {
        const attribute = laptopAttributes.find(a => a.name === attr.name);
        if (attribute) {
          await prisma.productAttributeValue.create({
            data: {
              productId: product.id,
              attributeId: attribute.id,
              value: attr.value,
            },
          });
        }
      }
    }
  }

  console.log('[SUCCESS] Created laptop product attribute values');

  // Create iPhone product attribute values
  const iPhoneAttributeValues = [
    // iPhone 17 256GB variants
    { sku: 'APL-IP17-256-BLK', attributes: [
      { name: 'Storage', value: '256GB' },
      { name: 'Color', value: 'Black' },
    ]},
    { sku: 'APL-IP17-256-WHT', attributes: [
      { name: 'Storage', value: '256GB' },
      { name: 'Color', value: 'White' },
    ]},
    { sku: 'APL-IP17-256-MBL', attributes: [
      { name: 'Storage', value: '256GB' },
      { name: 'Color', value: 'Mist Blue' },
    ]},
    { sku: 'APL-IP17-256-SAGE', attributes: [
      { name: 'Storage', value: '256GB' },
      { name: 'Color', value: 'Sage' },
    ]},
    { sku: 'APL-IP17-256-LAV', attributes: [
      { name: 'Storage', value: '256GB' },
      { name: 'Color', value: 'Lavender' },
    ]},
    // iPhone 17 512GB variants
    { sku: 'APL-IP17-512-BLK', attributes: [
      { name: 'Storage', value: '512GB' },
      { name: 'Color', value: 'Black' },
    ]},
    { sku: 'APL-IP17-512-WHT', attributes: [
      { name: 'Storage', value: '512GB' },
      { name: 'Color', value: 'White' },
    ]},
    { sku: 'APL-IP17-512-MBL', attributes: [
      { name: 'Storage', value: '512GB' },
      { name: 'Color', value: 'Mist Blue' },
    ]},
    { sku: 'APL-IP17-512-SAGE', attributes: [
      { name: 'Storage', value: '512GB' },
      { name: 'Color', value: 'Sage' },
    ]},
    { sku: 'APL-IP17-512-LAV', attributes: [
      { name: 'Storage', value: '512GB' },
      { name: 'Color', value: 'Lavender' },
    ]},
  ];

  // Create product attribute values for iPhones
  for (const iPhone of iPhoneAttributeValues) {
    const product = products.find(p => p.sku === iPhone.sku);
    if (product) {
      for (const attr of iPhone.attributes) {
        const attribute = iPhoneAttributes.find(a => a.name === attr.name);
        if (attribute) {
          await prisma.productAttributeValue.create({
            data: {
              productId: product.id,
              attributeId: attribute.id,
              value: attr.value,
            },
          });
        }
      }
    }
  }

  console.log('[SUCCESS] Created iPhone product attribute values');

  // Create realistic pricing for demo products with different currencies
  const pricingData = [
    { sku: 'OFF-001', price: '2.50', currency: 'USD', description: 'Premium Ballpoint Pen' },
    { sku: 'OFF-002', price: '7.99', currency: 'EUR', description: 'A4 Copy Paper (500 sheets)' },
    { sku: 'OFF-003', price: '15.99', currency: 'USD', description: 'Stapler Heavy Duty' },
    { sku: 'ELEC-001', price: '11.99', currency: 'EUR', description: 'USB-C Cable 2m' },
    { sku: 'ELEC-002', price: '29.99', currency: 'USD', description: 'Wireless Mouse' },
    { sku: 'ELEC-003', price: '79.99', currency: 'EUR', description: 'Mechanical Keyboard' },
    { sku: 'FURN-001', price: '179.99', currency: 'USD', description: 'Office Chair Ergonomic' },
    { sku: 'FURN-002', price: '39.99', currency: 'EUR', description: 'Desk Lamp LED' },
    { sku: 'CLEAN-001', price: '5.99', currency: 'USD', description: 'All-Purpose Cleaner' },
    { sku: 'CLEAN-002', price: '11.99', currency: 'EUR', description: 'Microfiber Cloths (Pack of 10)' },
    { sku: 'IT-001', price: '139.99', currency: 'USD', description: 'Monitor 24" LED' },
    { sku: 'IT-002', price: '35.99', currency: 'EUR', description: 'Network Switch 8-Port' },
    { sku: 'SAFE-001', price: '7.99', currency: 'USD', description: 'Safety Glasses Clear' },
    { sku: 'FOOD-001', price: '22.99', currency: 'EUR', description: 'Coffee Beans Premium' },
    { sku: 'FOOD-002', price: '16.99', currency: 'USD', description: 'Energy Drink (Pack of 24)' },
    { sku: 'DISCONT-001', price: '4.99', currency: 'USD', description: 'Old Model Calculator' },
    { sku: 'NEW-001', price: '69.99', currency: 'EUR', description: 'Smart Desk Organizer' },
    { sku: 'BULK-001', price: '14.99', currency: 'USD', description: 'Steel Bolts M8x20' },
    { sku: 'BULK-002', price: '39.99', currency: 'EUR', description: 'Industrial Lubricant' },
    
    // Laptop pricing - High-value items
    { sku: 'LAPTOP-001', price: '2499.99', currency: 'USD', description: 'MacBook Pro 16" M3 Pro' },
    { sku: 'LAPTOP-002', price: '1899.99', currency: 'USD', description: 'Dell XPS 15 OLED' },
    { sku: 'LAPTOP-003', price: '1299.99', currency: 'EUR', description: 'HP Spectre x360 14' },
    { sku: 'LAPTOP-004', price: '1799.99', currency: 'USD', description: 'Lenovo ThinkPad X1 Carbon' },
    { sku: 'LAPTOP-005', price: '1599.99', currency: 'EUR', description: 'ASUS ROG Strix G15' },
    { sku: 'LAPTOP-006', price: '1199.99', currency: 'USD', description: 'Microsoft Surface Laptop 5' },
    { sku: 'LAPTOP-007', price: '899.99', currency: 'EUR', description: 'Acer Swift 3' },
    { sku: 'LAPTOP-008', price: '2199.99', currency: 'USD', description: 'MSI Creator Z16' },
    { sku: 'LAPTOP-009', price: '2299.99', currency: 'EUR', description: 'Razer Blade 15' },
    { sku: 'LAPTOP-010', price: '1099.99', currency: 'USD', description: 'Framework Laptop 13' },
    
    // iPhone 17 pricing - Product group variants
    { sku: 'APL-IP17-256-BLK', price: '899.00', currency: 'USD', description: 'iPhone 17 256GB Black' },
    { sku: 'APL-IP17-256-WHT', price: '899.00', currency: 'USD', description: 'iPhone 17 256GB White' },
    { sku: 'APL-IP17-256-MBL', price: '899.00', currency: 'USD', description: 'iPhone 17 256GB Mist Blue' },
    { sku: 'APL-IP17-256-SAGE', price: '899.00', currency: 'USD', description: 'iPhone 17 256GB Sage' },
    { sku: 'APL-IP17-256-LAV', price: '899.00', currency: 'USD', description: 'iPhone 17 256GB Lavender' },
    { sku: 'APL-IP17-512-BLK', price: '999.00', currency: 'USD', description: 'iPhone 17 512GB Black' },
    { sku: 'APL-IP17-512-WHT', price: '999.00', currency: 'USD', description: 'iPhone 17 512GB White' },
    { sku: 'APL-IP17-512-MBL', price: '999.00', currency: 'USD', description: 'iPhone 17 512GB Mist Blue' },
    { sku: 'APL-IP17-512-SAGE', price: '999.00', currency: 'USD', description: 'iPhone 17 512GB Sage' },
    { sku: 'APL-IP17-512-LAV', price: '999.00', currency: 'USD', description: 'iPhone 17 512GB Lavender' },
    
    // iPhone 17 Pro pricing - Product group variants
    { sku: 'APL-IP17P-256-DBLUE', price: '1099.00', currency: 'USD', description: 'iPhone 17 Pro 256GB Deep Blue' },
    { sku: 'APL-IP17P-256-CORNG', price: '1099.00', currency: 'USD', description: 'iPhone 17 Pro 256GB Cosmic Orange' },
    { sku: 'APL-IP17P-256-SIL', price: '1099.00', currency: 'USD', description: 'iPhone 17 Pro 256GB Silver' },
    { sku: 'APL-IP17P-512-DBLUE', price: '1199.00', currency: 'USD', description: 'iPhone 17 Pro 512GB Deep Blue' },
    { sku: 'APL-IP17P-512-CORNG', price: '1199.00', currency: 'USD', description: 'iPhone 17 Pro 512GB Cosmic Orange' },
    { sku: 'APL-IP17P-512-SIL', price: '1199.00', currency: 'USD', description: 'iPhone 17 Pro 512GB Silver' },
    { sku: 'APL-IP17P-1TB-DBLUE', price: '1399.00', currency: 'USD', description: 'iPhone 17 Pro 1TB Deep Blue' },
    { sku: 'APL-IP17P-1TB-CORNG', price: '1399.00', currency: 'USD', description: 'iPhone 17 Pro 1TB Cosmic Orange' },
    { sku: 'APL-IP17P-1TB-SIL', price: '1399.00', currency: 'USD', description: 'iPhone 17 Pro 1TB Silver' },
  ];

  await Promise.all(
    pricingData.map((item) => {
      const product = products.find(p => p.sku === item.sku);
      if (product) {
        return prisma.pricing.create({
          data: {
            productId: product.id,
            price: item.price,
            currency: item.currency,
            taxRate: '20',
            discountPercent: '0',
            effectiveFrom: new Date(),
          },
        });
      }
    })
  );

  console.log('[SUCCESS] Created base pricing for all products');

  // Create comprehensive client data - 15 Companies and 5 Individuals
  const companies = [
    {
        name: 'Royal Agencija d.o.o.',
        email: 'info@royalagencija.ba',
        phone: '+38761000000',
      billingStreet: 'Zmaja od Bosne 8',
        billingCity: 'Sarajevo',
      billingZip: '71000',
        billingCountry: 'Bosnia and Herzegovina',
        status: ClientStatus.ACTIVE,
        paymentTerms: PaymentTerms.D30,
        preferredCurrency: Currency.BAM,
        tags: ['vip', 'partner'],
        clientCode: 'CLT-ROYAL-01',
        creditLimit: 50000,
        leadSource: 'Referral',
        notes: 'VIP client with excellent payment history',
      },
    {
        name: 'Tech Solutions Inc',
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
        notes: 'Large enterprise client',
      },
    {
      name: 'Global Manufacturing Ltd',
      email: 'orders@globalmfg.com',
      phone: '+44-20-7946-0958',
      billingStreet: '25 Industrial Park',
      billingCity: 'Manchester',
      billingZip: 'M1 1AA',
      billingCountry: 'United Kingdom',
      status: ClientStatus.ACTIVE,
      paymentTerms: PaymentTerms.D45,
      preferredCurrency: Currency.GBP,
      tags: ['manufacturing', 'bulk'],
      clientCode: 'CLT-GLOBAL-002',
      creditLimit: 250000,
      leadSource: 'Cold Call',
      notes: 'High volume manufacturer',
    },
    {
      name: 'Digital Innovations GmbH',
      email: 'kontakt@digitalinnovations.de',
      phone: '+49-30-12345678',
      billingStreet: 'Unter den Linden 1',
      billingCity: 'Berlin',
      billingZip: '10117',
      billingCountry: 'Germany',
      status: ClientStatus.ACTIVE,
      paymentTerms: PaymentTerms.D30,
      preferredCurrency: Currency.EUR,
      tags: ['tech', 'startup'],
      clientCode: 'CLT-DIGITAL-003',
      creditLimit: 75000,
      leadSource: 'Website',
      notes: 'Fast-growing tech startup',
    },
    {
      name: 'Nordic Trading AB',
      email: 'info@nordictrading.se',
      phone: '+46-8-123-456-78',
      billingStreet: 'Storgatan 42',
      billingCity: 'Stockholm',
      billingZip: '111 51',
      billingCountry: 'Sweden',
      status: ClientStatus.ACTIVE,
      paymentTerms: PaymentTerms.D15,
      preferredCurrency: Currency.GBP,
      tags: ['trading', 'scandinavia'],
      clientCode: 'CLT-NORDIC-004',
      creditLimit: 150000,
      leadSource: 'Partner Referral',
      notes: 'Reliable Nordic partner',
    },
    {
      name: 'Mediterranean Logistics S.A.',
      email: 'logistics@medlog.gr',
      phone: '+30-210-123-4567',
      billingStreet: 'Leoforos Vasilissis Sofias 15',
      billingCity: 'Athens',
      billingZip: '106 75',
      billingCountry: 'Greece',
      status: ClientStatus.ACTIVE,
      paymentTerms: PaymentTerms.D30,
      preferredCurrency: Currency.EUR,
      tags: ['logistics', 'shipping'],
      clientCode: 'CLT-MEDLOG-005',
      creditLimit: 200000,
      leadSource: 'Industry Event',
      notes: 'Major logistics provider',
    },
    {
      name: 'Asian Electronics Co.',
      email: 'sales@asianelectronics.jp',
      phone: '+81-3-1234-5678',
      billingStreet: 'Shibuya 1-1-1',
      billingCity: 'Tokyo',
      billingZip: '150-0002',
      billingCountry: 'Japan',
      status: ClientStatus.ACTIVE,
      paymentTerms: PaymentTerms.D60,
      preferredCurrency: Currency.USD,
      tags: ['electronics', 'asia'],
      clientCode: 'CLT-ASIAN-006',
      creditLimit: 300000,
      leadSource: 'Trade Show',
      notes: 'Premium electronics supplier',
    },
    {
      name: 'Canadian Resources Inc.',
      email: 'info@canadianresources.ca',
      phone: '+1-416-555-0123',
      billingStreet: 'Bay Street 100',
      billingCity: 'Toronto',
      billingZip: 'M5H 2N2',
      billingCountry: 'Canada',
      status: ClientStatus.ACTIVE,
      paymentTerms: PaymentTerms.D30,
      preferredCurrency: Currency.USD,
      tags: ['resources', 'mining'],
      clientCode: 'CLT-CANADIAN-007',
      creditLimit: 180000,
      leadSource: 'Cold Call',
      notes: 'Natural resources company',
    },
    {
      name: 'Australian Ventures Pty Ltd',
      email: 'contact@ausventures.com.au',
      phone: '+61-2-9876-5432',
      billingStreet: 'Collins Street 123',
      billingCity: 'Melbourne',
      billingZip: '3000',
      billingCountry: 'Australia',
      status: ClientStatus.ACTIVE,
      paymentTerms: PaymentTerms.D30,
      preferredCurrency: Currency.USD,
      tags: ['ventures', 'oceania'],
      clientCode: 'CLT-AUSVENT-008',
      creditLimit: 120000,
      leadSource: 'Website',
      notes: 'Diversified business ventures',
    },
    {
      name: 'Brazilian Exports Ltda',
      email: 'exports@brazilian.com.br',
      phone: '+55-11-9876-5432',
      billingStreet: 'Avenida Paulista 1000',
      billingCity: 'São Paulo',
      billingZip: '01310-100',
      billingCountry: 'Brazil',
      status: ClientStatus.ACTIVE,
      paymentTerms: PaymentTerms.D45,
      preferredCurrency: Currency.USD,
      tags: ['exports', 'south-america'],
      clientCode: 'CLT-BRAZIL-009',
      creditLimit: 160000,
      leadSource: 'Trade Show',
      notes: 'Major export company',
    },
    {
      name: 'South African Mining Corp',
      email: 'mining@southafrican.co.za',
      phone: '+27-11-123-4567',
      billingStreet: 'Sandton Drive 50',
      billingCity: 'Johannesburg',
      billingZip: '2196',
      billingCountry: 'South Africa',
      status: ClientStatus.ACTIVE,
      paymentTerms: PaymentTerms.D30,
      preferredCurrency: Currency.USD,
      tags: ['mining', 'africa'],
      clientCode: 'CLT-SAFRICA-010',
      creditLimit: 220000,
      leadSource: 'Industry Event',
      notes: 'Leading mining corporation',
    },
    {
      name: 'Indian Software Solutions',
      email: 'software@indiansolutions.in',
      phone: '+91-80-1234-5678',
      billingStreet: 'MG Road 25',
      billingCity: 'Bangalore',
      billingZip: '560001',
      billingCountry: 'India',
      status: ClientStatus.ACTIVE,
      paymentTerms: PaymentTerms.D15,
      preferredCurrency: Currency.USD,
      tags: ['software', 'it'],
      clientCode: 'CLT-INDIA-011',
      creditLimit: 90000,
      leadSource: 'Website',
      notes: 'IT services provider',
    },
    {
      name: 'Russian Energy Group',
      email: 'energy@russiangroup.ru',
      phone: '+7-495-123-4567',
      billingStreet: 'Red Square 1',
      billingCity: 'Moscow',
      billingZip: '109012',
      billingCountry: 'Russia',
      status: ClientStatus.ACTIVE,
      paymentTerms: PaymentTerms.D60,
      preferredCurrency: Currency.USD,
      tags: ['energy', 'oil-gas'],
      clientCode: 'CLT-RUSSIA-012',
      creditLimit: 500000,
      leadSource: 'Government Contract',
      notes: 'Major energy corporation',
    },
    {
      name: 'Mexican Automotive Parts',
      email: 'parts@mexicanauto.mx',
      phone: '+52-55-1234-5678',
      billingStreet: 'Reforma 222',
      billingCity: 'Mexico City',
      billingZip: '06600',
      billingCountry: 'Mexico',
      status: ClientStatus.ACTIVE,
      paymentTerms: PaymentTerms.D30,
      preferredCurrency: Currency.USD,
      tags: ['automotive', 'manufacturing'],
      clientCode: 'CLT-MEXICO-013',
      creditLimit: 140000,
      leadSource: 'Trade Show',
      notes: 'Automotive parts manufacturer',
    },
    {
      name: 'Turkish Textiles Ltd',
      email: 'textiles@turkish.com.tr',
      phone: '+90-212-123-4567',
      billingStreet: 'Istiklal Caddesi 100',
      billingCity: 'Istanbul',
      billingZip: '34430',
      billingCountry: 'Turkey',
      status: ClientStatus.ACTIVE,
      paymentTerms: PaymentTerms.D30,
      preferredCurrency: Currency.USD,
      tags: ['textiles', 'manufacturing'],
      clientCode: 'CLT-TURKEY-014',
      creditLimit: 110000,
      leadSource: 'Cold Call',
      notes: 'Textile manufacturing company',
    },
    {
      name: 'Polish Construction Co.',
      email: 'construction@polish.pl',
      phone: '+48-22-123-4567',
      billingStreet: 'Marszałkowska 1',
      billingCity: 'Warsaw',
      billingZip: '00-624',
      billingCountry: 'Poland',
      status: ClientStatus.ACTIVE,
      paymentTerms: PaymentTerms.D45,
      preferredCurrency: Currency.USD,
      tags: ['construction', 'building'],
      clientCode: 'CLT-POLAND-015',
      creditLimit: 130000,
      leadSource: 'Industry Event',
      notes: 'Construction and building company',
    },
  ];

  const individuals = [
    {
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1-555-0101',
      billingStreet: '123 Main Street',
      billingCity: 'New York',
      billingZip: '10001',
      billingCountry: 'USA',
      status: ClientStatus.ACTIVE,
      paymentTerms: PaymentTerms.ON_RECEIPT,
      preferredCurrency: Currency.USD,
      tags: ['individual', 'consultant'],
      creditLimit: 10000,
      leadSource: 'Website',
      notes: 'Independent consultant',
    },
    {
      name: 'Maria Garcia',
      email: 'maria.garcia@email.com',
      phone: '+34-91-123-4567',
      billingStreet: 'Calle Gran Via 50',
      billingCity: 'Madrid',
      billingZip: '28013',
      billingCountry: 'Spain',
      status: ClientStatus.ACTIVE,
      paymentTerms: PaymentTerms.D15,
      preferredCurrency: Currency.EUR,
      tags: ['individual', 'freelancer'],
      creditLimit: 15000,
      leadSource: 'Social Media',
      notes: 'Freelance designer',
    },
    {
      name: 'Ahmed Hassan',
      email: 'ahmed.hassan@email.com',
      phone: '+971-4-123-4567',
      billingStreet: 'Sheikh Zayed Road 100',
      billingCity: 'Dubai',
      billingZip: '00000',
      billingCountry: 'UAE',
      status: ClientStatus.PROSPECT,
      paymentTerms: PaymentTerms.ON_RECEIPT,
      preferredCurrency: Currency.USD,
      tags: ['individual', 'startup'],
      creditLimit: 8000,
      leadSource: 'Referral',
      notes: 'Startup entrepreneur',
    },
    {
      name: 'Sophie Dubois',
      email: 'sophie.dubois@email.com',
      phone: '+33-1-23-45-67-89',
      billingStreet: 'Champs-Élysées 25',
      billingCity: 'Paris',
      billingZip: '75008',
      billingCountry: 'France',
      status: ClientStatus.ACTIVE,
      paymentTerms: PaymentTerms.D30,
      preferredCurrency: Currency.EUR,
      tags: ['individual', 'artist'],
      creditLimit: 12000,
      leadSource: 'Website',
      notes: 'Independent artist',
    },
    {
      name: 'Yuki Tanaka',
      email: 'yuki.tanaka@email.com',
      phone: '+81-3-9876-5432',
      billingStreet: 'Ginza 5-1-1',
      billingCity: 'Tokyo',
      billingZip: '104-0061',
      billingCountry: 'Japan',
      status: ClientStatus.ACTIVE,
      paymentTerms: PaymentTerms.D15,
      preferredCurrency: Currency.USD,
      tags: ['individual', 'researcher'],
      creditLimit: 20000,
      leadSource: 'Academic Conference',
      notes: 'Research scientist',
    },
  ];

  // Create all companies
  const createdCompanies = await Promise.all(
    companies.map((company, index) =>
      prisma.client.upsert({
        where: { clientCode: company.clientCode },
        update: {},
        create: {
          ...company,
          type: ClientType.COMPANY,
          assignedToId: adminUser.id,
          lastContactedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
          nextFollowupAt: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within next 30 days
        },
      })
    )
  );

  // Create all individuals
  const createdIndividuals = await Promise.all(
    individuals.map((individual, index) =>
      prisma.client.create({
        data: {
          ...individual,
          type: ClientType.INDIVIDUAL,
          assignedToId: adminUser.id,
          lastContactedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
          nextFollowupAt: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within next 30 days
        },
      })
    )
  );

  const clients = [...createdCompanies, ...createdIndividuals];

  console.log(`[SUCCESS] Created ${clients.length} clients`);

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
    console.log('[SUCCESS] Associated client user with Royal Agencija client');
  } else {
    console.log('[SUCCESS] Client user already associated with Royal Agencija client');
  }

  // Create multiple users for each company (at least 2 users per company)
  console.log('[INFO] Creating multiple users for each company...');
  
  const companyUsers: any[] = [];
  
  for (const company of createdCompanies) {
    // Create 2-3 users per company
    const numUsers = Math.floor(Math.random() * 2) + 2; // 2-3 users per company
    
    for (let i = 0; i < numUsers; i++) {
      const userNumber = i + 1;
      const firstName = company.name.split(' ')[0]; // Use company name for first name
      const lastName = company.name.split(' ').slice(1).join(' ') || 'User';
      
      const userEmail = `${firstName.toLowerCase()}${userNumber}@${company.email.split('@')[1]}`;
      
      try {
        const companyUser = await prisma.user.upsert({
          where: { email: userEmail },
          update: {},
          create: {
            email: userEmail,
            password: hashedPassword,
            firstName: `${firstName} ${userNumber}`,
            lastName: lastName,
            role: UserRole.CLIENT_USER,
            isEmailVerified: true,
            emailVerifiedAt: new Date(),
            clientId: company.id,
          },
        });
        
        companyUsers.push(companyUser);
        console.log(`[SUCCESS] Created user ${userNumber} for ${company.name}: ${userEmail}`);
      } catch (error) {
        console.log(`[WARNING] Could not create user ${userNumber} for ${company.name}: ${error.message}`);
      }
    }
  }
  
  console.log(`[SUCCESS] Created ${companyUsers.length} company users across ${createdCompanies.length} companies`);

  // Create users for some individual clients as well
  console.log('[INFO] Creating users for individual clients...');
  
  const individualUsers: any[] = [];
  
  // Create users for the first 5 individual clients
  for (let i = 0; i < Math.min(5, createdIndividuals.length); i++) {
    const individual = createdIndividuals[i];
    const firstName = individual.name.split(' ')[0];
    const lastName = individual.name.split(' ').slice(1).join(' ') || 'Individual';
    
    const userEmail = `${firstName.toLowerCase()}@${individual.email.split('@')[1]}`;
    
    try {
      const individualUser = await prisma.user.upsert({
        where: { email: userEmail },
        update: {},
        create: {
          email: userEmail,
          password: hashedPassword,
          firstName: firstName,
          lastName: lastName,
          role: UserRole.CLIENT_USER,
          isEmailVerified: true,
          emailVerifiedAt: new Date(),
          clientId: individual.id,
        },
      });
      
      individualUsers.push(individualUser);
      console.log(`[SUCCESS] Created user for individual ${individual.name}: ${userEmail}`);
    } catch (error) {
      console.log(`[WARNING] Could not create user for individual ${individual.name}: ${error.message}`);
    }
  }
  
  console.log(`[SUCCESS] Created ${individualUsers.length} individual users`);

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

  console.log('[SUCCESS] Created client-specific pricing override');

  // Create additional client-specific pricing overrides for demo
  const clientPricingOverrides = [
    {
      clientName: 'Tech Solutions Inc',
      sku: 'ELEC-003',
      price: '69.99',
      currency: 'USD',
      discountPercent: '10',
    },
    {
      clientName: 'Global Manufacturing Ltd',
      sku: 'BULK-001',
      price: '12.99',
      currency: 'USD',
      discountPercent: '15',
    },
    {
      clientName: 'Digital Innovations GmbH',
      sku: 'IT-001',
      price: '119.99',
      currency: 'EUR',
      discountPercent: '20',
    },
    {
      clientName: 'Nordic Trading AB',
      sku: 'FOOD-001',
      price: '19.99',
      currency: 'EUR',
      discountPercent: '5',
    },
    {
      clientName: 'Tech Solutions Inc',
      sku: 'LAPTOP-001',
      price: '2299.99',
      currency: 'USD',
      discountPercent: '8',
    },
    {
      clientName: 'Digital Innovations GmbH',
      sku: 'LAPTOP-004',
      price: '1599.99',
      currency: 'EUR',
      discountPercent: '12',
    },
    {
      clientName: 'Global Manufacturing Ltd',
      sku: 'LAPTOP-007',
      price: '799.99',
      currency: 'USD',
      discountPercent: '15',
    },
    {
      clientName: 'Creative Agency Co',
      sku: 'LAPTOP-008',
      price: '1999.99',
      currency: 'USD',
      discountPercent: '10',
    },
  ];

  for (const override of clientPricingOverrides) {
    const client = clients.find(c => c.name === override.clientName);
    const product = products.find(p => p.sku === override.sku);
    
    if (client && product) {
      await prisma.pricing.create({
        data: {
          productId: product.id,
          clientId: client.id,
          price: override.price,
          currency: override.currency,
          taxRate: '20',
          discountPercent: override.discountPercent,
          effectiveFrom: new Date(),
        },
      });
    }
  }

  console.log('[SUCCESS] Created additional client-specific pricing overrides');

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

    console.log('[SUCCESS] Created sample cart with items');

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

    console.log('[SUCCESS] Created sample orders and invoice');
  }

  // Create additional orders for different companies with different statuses
  console.log('[INFO] Creating additional orders for different companies...');
  
  // Get some company clients and products for orders
  const companyClients = createdCompanies.slice(0, 3); // Use first 3 companies
  const orderProducts = products.filter(p => p.status === 'ACTIVE').slice(0, 10); // Get some active products
  
  const orderStatuses = ['PENDING', 'INVOICE_CREATED', 'SHIPPED', 'DELIVERED', 'COMPLETED'];
  
  for (let i = 0; i < 4; i++) {
    const client = companyClients[i % companyClients.length];
    const status = orderStatuses[i % orderStatuses.length];
    const orderNumber = `ORD-2024-${String(i + 3).padStart(6, '0')}`;
    
    // Select 1-2 random products for this order
    const numProducts = Math.floor(Math.random() * 2) + 1; // 1-2 products
    const selectedProducts = orderProducts.slice(i * 2, i * 2 + numProducts);
    
    if (selectedProducts.length === 0) continue;
    
    // Calculate totals
    let subtotal = 0;
    let taxTotal = 0;
    let grandTotal = 0;
    
    const orderItems = selectedProducts.map((product, index) => {
      const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
      const unitPrice = parseFloat((Math.random() * 500 + 50).toFixed(2)); // $50-$550
      const taxRate = 20; // 20% tax
      const lineSubtotal = unitPrice * quantity;
      const lineTax = lineSubtotal * (taxRate / 100);
      const lineTotal = lineSubtotal + lineTax;
      
      subtotal += lineSubtotal;
      taxTotal += lineTax;
      grandTotal += lineTotal;
      
      return {
        productId: product.id,
        sku: product.sku,
        productName: product.name || 'Unknown Product',
        quantity: quantity.toString(),
        unitPrice: unitPrice.toFixed(2),
        taxRate: taxRate.toFixed(2),
        lineSubtotal: lineSubtotal.toFixed(2),
        lineTax: lineTax.toFixed(2),
        lineTotal: lineTotal.toFixed(2),
      };
    });
    
    try {
      const order = await prisma.order.create({
        data: {
          orderNumber: orderNumber,
          clientId: client.id,
          status: status as any,
          subtotal: subtotal.toFixed(2),
          taxTotal: taxTotal.toFixed(2),
          grandTotal: grandTotal.toFixed(2),
          currency: 'USD',
          notes: `Sample ${status.toLowerCase()} order for ${client.name}`,
          items: {
            create: orderItems,
          },
        },
      });
      
      console.log(`[SUCCESS] Created ${status} order ${orderNumber} for ${client.name} with ${selectedProducts.length} products`);
      
      // Create invoice for orders that should have one
      if (['INVOICE_CREATED', 'SHIPPED', 'DELIVERED', 'COMPLETED'].includes(status)) {
        const invoiceNumber = `INV-2024-${String(i + 2).padStart(6, '0')}`;
        
        try {
          const invoice = await prisma.invoice.create({
            data: {
              invoiceNumber: invoiceNumber,
              clientId: client.id,
              status: status === 'INVOICE_CREATED' ? 'QUOTE' : 
                      status === 'SHIPPED' ? 'ISSUED' : 
                      status === 'DELIVERED' ? 'SENT' : 'PAID',
              subtotal: subtotal.toFixed(2),
              taxTotal: taxTotal.toFixed(2),
              grandTotal: grandTotal.toFixed(2),
              currency: 'USD',
              notes: `Invoice for ${status.toLowerCase()} order ${orderNumber}`,
              items: {
                create: orderItems.map(item => ({
                  productId: item.productId,
                  sku: item.sku,
                  productName: item.productName,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  taxRate: item.taxRate,
                  discountPercent: '0.00',
                  lineSubtotal: item.lineSubtotal,
                  lineTax: item.lineTax,
                  lineDiscount: '0.00',
                  lineTotal: item.lineTotal,
                })),
              },
            },
          });
          
          // Link invoice to order
          await prisma.order.update({
            where: { id: order.id },
            data: { invoiceId: invoice.id },
          });
          
          console.log(`[SUCCESS] Created invoice ${invoiceNumber} for order ${orderNumber}`);
        } catch (error) {
          console.log(`[WARNING] Could not create invoice for order ${orderNumber}: ${error.message}`);
        }
      }
      
      // If order is SHIPPED or DELIVERED, add some additional data
      if (status === 'SHIPPED' || status === 'DELIVERED') {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            shippedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within last week
          },
        });
      }
      
      if (status === 'DELIVERED') {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            deliveredAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000), // Random date within last 3 days
          },
        });
      }
      
    } catch (error) {
      console.log(`[WARNING] Could not create order for ${client.name}: ${error.message}`);
    }
  }
  
  console.log('[SUCCESS] Created additional orders for different companies');

  console.log('[SUCCESS] Database seed completed!');
}

main()
  .catch((e) => {
    console.error('[ERROR] Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
  
