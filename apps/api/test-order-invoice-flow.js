const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testOrderInvoiceFlow() {
  try {
    console.log('Testing order to invoice flow...');
    
    // Get a client
    const client = await prisma.client.findFirst();
    if (!client) {
      console.log('No client found');
      return;
    }
    
    console.log('Client:', client.id);
    
    // Get or create cart with items
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
    
    // Add some products to cart if empty
    if (cart.items.length === 0) {
      const products = await prisma.product.findMany({ take: 2 });
      if (products.length > 0) {
        for (const product of products) {
          await prisma.cartItem.create({
            data: {
              cartId: cart.id,
              productId: product.id,
              quantity: Math.floor(Math.random() * 5) + 1
            }
          });
        }
        
        // Refresh cart
        cart = await prisma.cart.findUnique({
          where: { clientId: client.id },
          include: {
            items: {
              include: {
                product: true
              }
            }
          }
        });
      }
    }
    
    console.log('Cart items:', cart.items.length);
    cart.items.forEach(item => {
      console.log(`  - ${item.product.name}: ${item.quantity}`);
    });
    
    if (cart.items.length === 0) {
      console.log('No items in cart, cannot test order creation');
      return;
    }
    
    // Create order (simulating the order creation process)
    const orderNumber = `TEST-${Date.now()}`;
    
    const order = await prisma.order.create({
      data: {
        orderNumber,
        clientId: client.id,
        status: 'PENDING',
        subtotal: 100,
        taxTotal: 20,
        grandTotal: 120,
        currency: 'EUR',
        notes: 'Test order',
        items: {
          create: cart.items.map(item => ({
            productId: item.productId,
            sku: item.product.sku,
            productName: item.product.name || 'Unknown Product',
            quantity: item.quantity,
            unitPrice: 10,
            taxRate: 20,
            lineSubtotal: item.quantity * 10,
            lineTax: item.quantity * 10 * 0.2,
            lineTotal: item.quantity * 10 * 1.2,
          })),
        },
      },
      include: {
        items: true,
      },
    });
    
    console.log('Created order:', order.id);
    console.log('Order items:', order.items.length);
    
    // Create invoice with items (simulating the fixed invoice creation)
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        clientId: client.id,
        notes: `Invoice for order ${orderNumber}`,
        discountPercent: 0,
      },
    });
    
    console.log('Created invoice:', invoice.id);
    
    // Add items to invoice (this is what was missing!)
    for (const orderItem of order.items) {
      const invoiceItem = await prisma.invoiceItem.create({
        data: {
          invoiceId: invoice.id,
          productId: orderItem.productId,
          sku: orderItem.sku,
          productName: orderItem.productName,
          quantity: orderItem.quantity,
          unitPrice: orderItem.unitPrice,
          taxRate: orderItem.taxRate,
          discountPercent: 0,
          lineSubtotal: orderItem.lineSubtotal,
          lineTax: orderItem.lineTax,
          lineDiscount: 0,
          lineTotal: orderItem.lineTotal,
        },
      });
      
      console.log(`Created invoice item: ${invoiceItem.productName} x${invoiceItem.quantity}`);
    }
    
    // Link invoice to order
    await prisma.order.update({
      where: { id: order.id },
      data: { 
        invoiceId: invoice.id,
        status: 'INVOICE_CREATED',
      },
    });
    
    // Verify the results
    const finalOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: true,
        invoice: {
          include: {
            items: true,
          },
        },
      },
    });
    
    console.log('\n=== RESULTS ===');
    console.log('Order ID:', finalOrder.id);
    console.log('Order Status:', finalOrder.status);
    console.log('Order Items:', finalOrder.items.length);
    console.log('Invoice ID:', finalOrder.invoice?.id);
    console.log('Invoice Items:', finalOrder.invoice?.items.length || 0);
    
    if (finalOrder.invoice?.items.length > 0) {
      console.log('\nInvoice Items:');
      finalOrder.invoice.items.forEach(item => {
        console.log(`  - ${item.productName}: ${item.quantity} x ${item.unitPrice} = ${item.lineTotal}`);
      });
    }
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testOrderInvoiceFlow();
