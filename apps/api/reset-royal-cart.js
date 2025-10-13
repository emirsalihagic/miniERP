const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetRoyalCart() {
  try {
    console.log('Resetting Royal Agencija cart...');
    
    // Find the Royal Agencija client
    const client = await prisma.client.findFirst({
      where: { name: { contains: 'Royal Agencija' } }
    });
    
    if (!client) {
      console.log('Royal Agencija client not found');
      return;
    }
    
    console.log('Found client:', client.name, client.id);
    
    // Delete all cart items for this client
    const cart = await prisma.cart.findUnique({
      where: { clientId: client.id },
      include: { items: true }
    });
    
    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id }
      });
      console.log('Deleted', cart.items.length, 'cart items');
    }
    
    console.log('Cart reset complete');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetRoyalCart();
