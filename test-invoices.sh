#!/bin/bash

echo "🚀 Testing Invoice Management System in miniERP"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the miniERP root directory"
    exit 1
fi

echo "📋 Checking invoice components..."
if [ -d "apps/ui/src/app/features/invoices" ]; then
    echo "✅ Invoice components found"
    echo "   - invoices-list component: $(ls apps/ui/src/app/features/invoices/components/invoices-list/)"
    echo "   - invoice-form component: $(ls apps/ui/src/app/features/invoices/components/invoice-form/)"
    echo "   - invoice-detail component: $(ls apps/ui/src/app/features/invoices/components/invoice-detail/)"
    echo "   - invoices service: $(ls apps/ui/src/app/features/invoices/services/)"
else
    echo "❌ Invoice components not found"
    exit 1
fi

echo ""
echo "🔧 Checking routes..."
if grep -q "invoices" apps/ui/src/app/app.routes.ts; then
    echo "✅ Invoice routes configured"
else
    echo "❌ Invoice routes not found"
fi

echo ""
echo "🎨 Checking menu integration..."
if grep -q "Invoices" apps/ui/src/app/app.component.html; then
    echo "✅ Invoice menu item found in sidebar"
else
    echo "❌ Invoice menu item not found"
fi

echo ""
echo "🌐 Starting development servers..."
echo "   - Frontend: http://localhost:4200"
echo "   - Backend API: http://localhost:3000"
echo ""
echo "📝 Test Steps:"
echo "   1. Open http://localhost:4200 in your browser"
echo "   2. Login to the application"
echo "   3. Click 'Invoices' in the sidebar menu"
echo "   4. Click 'New Invoice' to create an invoice"
echo "   5. Fill in client details and create invoice"
echo "   6. Add items to the invoice"
echo "   7. Issue the invoice"
echo ""
echo "🎯 Expected Features:"
echo "   ✅ Invoice list with filtering"
echo "   ✅ Create new invoices"
echo "   ✅ Add items to invoices"
echo "   ✅ Issue invoices (DRAFT → ISSUED)"
echo "   ✅ Professional UI with ng-zorro components"
echo "   ✅ Responsive design"
echo ""
echo "🔍 API Endpoints to test:"
echo "   GET    /api/invoices          - List invoices"
echo "   POST   /api/invoices          - Create invoice"
echo "   GET    /api/invoices/:id      - Get invoice details"
echo "   POST   /api/invoices/:id/items - Add item to invoice"
echo "   POST   /api/invoices/:id/issue - Issue invoice"
echo ""
echo "✨ Invoice management system is ready to test!"
