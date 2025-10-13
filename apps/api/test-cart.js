const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCartAddition() {
  try {
    console.log('Testing cart quantity addition...');
    
    // Get a cart item
    const cartItem = await prisma.cartItem.findFirst({
      include: { cart: true }
    });
    
    if (!cartItem) {
      console.log('No cart items found');
      return;
    }
    
    console.log('Current cart item:', {
      id: cartItem.id,
      quantity: cartItem.quantity,
      quantityType: typeof cartItem.quantity
    });
    
    // Test addition
    const currentQuantity = Number(cartItem.quantity);
    const newQuantity = currentQuantity + 55;
    
    console.log('Addition test:', {
      currentQuantity,
      currentQuantityType: typeof currentQuantity,
      newQuantity,
      newQuantityType: typeof newQuantity
    });
    
    // Update the quantity
    const updated = await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity: newQuantity }
    });
    
    console.log('Updated cart item:', {
      id: updated.id,
      quantity: updated.quantity,
      quantityType: typeof updated.quantity
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCartAddition();
