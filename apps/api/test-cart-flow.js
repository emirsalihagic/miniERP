const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCartFlow() {
  try {
    console.log('Testing cart flow...');
    
    // Get a client
    const client = await prisma.client.findFirst();
    if (!client) {
      console.log('No client found');
      return;
    }
    
    console.log('Client:', client.id);
    
    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { clientId: client.id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });
    
    if (!cart) {
      cart = await prisma.cart.create({
        data: { clientId: client.id },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });
    }
    
    console.log('Cart:', cart.id);
    
    // Get a product
    const product = await prisma.product.findFirst();
    if (!product) {
      console.log('No product found');
      return;
    }
    
    console.log('Product:', product.id);
    
    // Check if item exists
    const existingItem = cart.items.find(item => item.productId === product.id);
    
    if (existingItem) {
      console.log('Existing item found:', {
        id: existingItem.id,
        quantity: existingItem.quantity,
        quantityType: typeof existingItem.quantity
      });
      
      // Test addition
      const currentQuantity = Number(existingItem.quantity);
      const newQuantity = currentQuantity + 55;
      
      console.log('Addition:', {
        currentQuantity,
        newQuantity
      });
      
      // Update quantity
      const updated = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity }
      });
      
      console.log('Updated item:', {
        id: updated.id,
        quantity: updated.quantity,
        quantityType: typeof updated.quantity
      });
      
    } else {
      console.log('No existing item, creating new one');
      
      // Create new item
      const newItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          quantity: 15
        }
      });
      
      console.log('Created item:', {
        id: newItem.id,
        quantity: newItem.quantity,
        quantityType: typeof newItem.quantity
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCartFlow();
