const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDirectUpdate() {
  try {
    console.log('Testing direct database update...');
    
    // Get a cart item
    const cartItem = await prisma.cartItem.findFirst();
    
    if (!cartItem) {
      console.log('No cart items found');
      return;
    }
    
    console.log('Current item:', {
      id: cartItem.id,
      quantity: cartItem.quantity,
      quantityType: typeof cartItem.quantity
    });
    
    // Direct update with explicit number
    const newQuantity = 70; // This should be 15 + 55 = 70
    
    const updated = await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity: newQuantity }
    });
    
    console.log('Updated item:', {
      id: updated.id,
      quantity: updated.quantity,
      quantityType: typeof updated.quantity
    });
    
    // Now test the API response
    console.log('Testing API response...');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDirectUpdate();
