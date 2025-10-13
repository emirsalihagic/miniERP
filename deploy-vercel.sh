#!/bin/bash

# Vercel Deployment Script for Mini ERP
# This script helps deploy both frontend and backend to Vercel

set -e

echo "🚀 Mini ERP Vercel Deployment Script"
echo "=================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Please install it first:"
    echo "   npm i -g vercel"
    exit 1
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please log in to Vercel first:"
    vercel login
fi

echo ""
echo "📋 Deployment Options:"
echo "1. Deploy Backend (API) only"
echo "2. Deploy Frontend (UI) only"
echo "3. Deploy Both (Backend first, then Frontend)"
echo "4. Exit"
echo ""

read -p "Select an option (1-4): " choice

case $choice in
    1)
        echo "🔧 Deploying Backend..."
        cd apps/api
        vercel --prod
        echo "✅ Backend deployed successfully!"
        echo "📝 Don't forget to:"
        echo "   - Set environment variables in Vercel dashboard"
        echo "   - Update the API URL in frontend environment"
        ;;
    2)
        echo "🎨 Deploying Frontend..."
        cd apps/ui
        vercel --prod
        echo "✅ Frontend deployed successfully!"
        ;;
    3)
        echo "🔧 Deploying Backend first..."
        cd apps/api
        vercel --prod
        echo "✅ Backend deployed!"
        
        echo ""
        echo "📝 Please note the backend URL and update frontend environment:"
        echo "   Edit apps/ui/src/environments/environment.prod.ts"
        echo "   Update apiUrl with your actual backend URL"
        echo ""
        read -p "Press Enter when you've updated the frontend environment..."
        
        echo "🎨 Deploying Frontend..."
        cd ../ui
        vercel --prod
        echo "✅ Both applications deployed successfully!"
        ;;
    4)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid option. Please select 1-4."
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment completed!"
echo "📖 For detailed instructions, see VERCEL_DEPLOYMENT.md"
