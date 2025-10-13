const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addPricingData() {
  try {
    console.log('🔍 Finding products...');
    
    // Get all products
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        supplierId: true
      }
    });
    
    console.log(`Found ${products.length} products`);
    
    if (products.length === 0) {
      console.log('❌ No products found. Please create some products first.');
      return;
    }
    
    // Add base pricing for each product
    for (const product of products) {
      console.log(`📦 Adding pricing for product: ${product.name} (${product.sku})`);
      
      // Check if pricing already exists
      const existingPricing = await prisma.pricing.findFirst({
        where: {
          productId: product.id,
          clientId: null,
          supplierId: null
        }
      });
      
      if (existingPricing) {
        console.log(`  ⚠️  Pricing already exists for ${product.name}`);
        continue;
      }
      
      // Create base pricing
      await prisma.pricing.create({
        data: {
          productId: product.id,
          clientId: null, // Base price
          supplierId: null, // Base price
          price: 10.00, // Default price
          currency: 'EUR',
          taxRate: 20.00, // 20% VAT
          discountPercent: 0.00,
          effectiveFrom: new Date(),
          effectiveTo: null
        }
      });
      
      console.log(`  ✅ Added base pricing for ${product.name}`);
    }
    
    console.log('🎉 Pricing data added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding pricing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addPricingData();