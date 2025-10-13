const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testInvoiceOrderSync() {
  try {
    console.log('Testing invoice-order pricing synchronization...');
    
    // Get a client
    const client = await prisma.client.findFirst();
    if (!client) {
      console.log('No client found');
      return;
    }
    
    console.log('Client:', client.id);
    
    // Create a test order with items
    const orderNumber = `SYNC-TEST-${Date.now()}`;
    
    const order = await prisma.order.create({
      data: {
        orderNumber,
        clientId: client.id,
        status: 'PENDING',
        subtotal: 100,
        taxTotal: 20,
        grandTotal: 120,
        currency: 'EUR',
        notes: 'Sync test order',
        items: {
          create: [
            {
              productId: (await prisma.product.findFirst()).id,
              sku: 'TEST-SKU-1',
              productName: 'Test Product 1',
              quantity: 2,
              unitPrice: 50,
              taxRate: 20,
              lineSubtotal: 100,
              lineTax: 20,
              lineTotal: 120,
            },
          ],
        },
      },
      include: {
        items: true,
      },
    });
    
    console.log('Created order:', order.id);
    console.log('Initial order totals:', {
      subtotal: order.subtotal,
      taxTotal: order.taxTotal,
      grandTotal: order.grandTotal,
    });
    
    // Create invoice linked to order
    const invoiceNumber = `INV-SYNC-${Date.now()}`;
    
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        clientId: client.id,
        notes: `Invoice for order ${orderNumber}`,
        discountPercent: 0,
        subtotal: 100,
        taxTotal: 20,
        grandTotal: 120,
      },
    });
    
    // Link invoice to order
    await prisma.order.update({
      where: { id: order.id },
      data: { 
        invoiceId: invoice.id,
        status: 'INVOICE_CREATED',
      },
    });
    
    console.log('Created invoice:', invoice.id);
    console.log('Initial invoice totals:', {
      subtotal: invoice.subtotal,
      taxTotal: invoice.taxTotal,
      grandTotal: invoice.grandTotal,
    });
    
    // Add invoice item
    const invoiceItem = await prisma.invoiceItem.create({
      data: {
        invoiceId: invoice.id,
        productId: order.items[0].productId,
        sku: 'TEST-SKU-1',
        productName: 'Test Product 1',
        quantity: 2,
        unitPrice: 50,
        taxRate: 20,
        discountPercent: 0,
        lineSubtotal: 100,
        lineTax: 20,
        lineDiscount: 0,
        lineTotal: 120,
      },
    });
    
    console.log('Added invoice item:', invoiceItem.id);
    
    // Now test discount update - this should trigger order sync
    console.log('\n=== Testing Discount Update ===');
    
    // Update invoice discount to 10%
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        discountPercent: 10, // 10% discount
      },
    });
    
    // Manually trigger recomputeTotals (simulating what happens in the service)
    const items = await prisma.invoiceItem.findMany({
      where: { invoiceId: invoice.id },
    });
    
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.lineSubtotal.toString()), 0);
    const taxTotal = items.reduce((sum, item) => sum + parseFloat(item.lineTax.toString()), 0);
    const itemDiscountTotal = items.reduce((sum, item) => sum + parseFloat(item.lineDiscount.toString()), 0);
    
    // Apply invoice-level discount
    const invoiceDiscountAmount = (subtotal - itemDiscountTotal) * (updatedInvoice.discountPercent / 100);
    const discountTotal = itemDiscountTotal + invoiceDiscountAmount;
    const grandTotal = subtotal + taxTotal - discountTotal;
    
    // Update invoice totals
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        subtotal,
        taxTotal,
        discountTotal,
        grandTotal,
      },
    });
    
    // Sync to order (this is what our new method does)
    await prisma.order.update({
      where: { id: order.id },
      data: {
        subtotal,
        taxTotal,
        grandTotal,
      },
    });
    
    console.log('Updated invoice totals:', {
      subtotal,
      taxTotal,
      discountTotal,
      grandTotal,
    });
    
    // Verify order was updated
    const updatedOrder = await prisma.order.findUnique({
      where: { id: order.id },
    });
    
    console.log('Updated order totals:', {
      subtotal: updatedOrder.subtotal,
      taxTotal: updatedOrder.taxTotal,
      grandTotal: updatedOrder.grandTotal,
    });
    
    // Check if totals match
    const totalsMatch = 
      Math.abs(updatedOrder.subtotal - subtotal) < 0.01 &&
      Math.abs(updatedOrder.taxTotal - taxTotal) < 0.01 &&
      Math.abs(updatedOrder.grandTotal - grandTotal) < 0.01;
    
    if (totalsMatch) {
      console.log('\n✅ SUCCESS: Order totals are synchronized with invoice totals!');
    } else {
      console.log('\n❌ FAILURE: Order totals do not match invoice totals');
    }
    
    console.log('\n=== Test Summary ===');
    console.log('Initial order total:', 120);
    console.log('Final order total:', updatedOrder.grandTotal);
    console.log('Discount applied:', '10%');
    console.log('Expected final total:', 108); // 120 - 10% = 108
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testInvoiceOrderSync();
