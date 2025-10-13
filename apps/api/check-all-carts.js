const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAllCarts() {
  try {
    console.log('Checking all cart items...');
    
    const cartItems = await prisma.cartItem.findMany({
      include: {
        cart: {
          include: {
            client: true
          }
        },
        product: true
      }
    });
    
    console.log(`Found ${cartItems.length} cart items:`);
    
    cartItems.forEach((item, index) => {
      console.log(`\nCart Item #${index + 1}:`);
      console.log('  ID:', item.id);
      console.log('  Cart ID:', item.cartId);
      console.log('  Client:', item.cart.client?.name || 'No client');
      console.log('  Product:', item.product.name);
      console.log('  Quantity:', item.quantity);
      console.log('  Quantity Type:', typeof item.quantity);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllCarts();
