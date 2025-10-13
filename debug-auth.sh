#!/bin/bash

echo "🧪 Testing Authentication Flow"
echo "=============================="

# Test 1: Login and get fresh tokens
echo "1. Getting fresh tokens..."
LOGIN_RESPONSE=$(curl -s http://localhost:3000/api/v1/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@minierp.com","password":"password123"}')

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.accessToken')
REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.refreshToken')

echo "✅ Fresh tokens obtained"
echo "Access Token: ${ACCESS_TOKEN:0:50}..."

# Decode JWT to check expiration
echo ""
echo "2. Checking token expiration..."
PAYLOAD=$(echo $ACCESS_TOKEN | cut -d'.' -f2 | base64 -d 2>/dev/null)
EXP=$(echo $PAYLOAD | jq -r '.exp')
CURRENT_TIME=$(date +%s)
EXP_TIME=$(date -r $EXP 2>/dev/null || echo "Invalid timestamp")

echo "Token expires at: $EXP_TIME"
echo "Current time: $(date)"
echo "Seconds until expiry: $((EXP - CURRENT_TIME))"

# Test 3: Test protected endpoint
echo ""
echo "3. Testing protected endpoint..."
PROTECTED_RESPONSE=$(curl -s http://localhost:3000/api/v1/clients \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$PROTECTED_RESPONSE" | jq -e '.items' > /dev/null; then
  echo "✅ Protected endpoint accessible"
else
  echo "❌ Protected endpoint failed"
fi

echo ""
echo "🎯 Frontend Testing Instructions:"
echo "1. Open browser console (F12)"
echo "2. Go to http://localhost:4200"
echo "3. Login with admin@minierp.com / password123"
echo "4. Navigate to /clients"
echo "5. Check console for auth initialization logs"
echo "6. Press F5 and watch console logs"
echo "7. Check if you stay on /clients or get redirected to login"

echo ""
echo "Expected console logs on refresh:"
echo "🔐 Initializing auth state..."
echo "Token exists: true"
echo "Refresh token exists: true"
echo "Token expired: [true/false]"
echo "🛡️ AuthGuard checking: { isAuth: true, url: '/clients' }"
