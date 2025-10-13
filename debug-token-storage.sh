#!/bin/bash

echo "🔍 Debugging Authentication Token Storage"
echo "========================================"

echo ""
echo "1. Testing login API directly..."
LOGIN_RESPONSE=$(curl -s http://localhost:3000/api/v1/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@minierp.com","password":"password123"}')

echo "Login response:"
echo "$LOGIN_RESPONSE" | jq '.'

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.accessToken')
REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.refreshToken')

echo ""
echo "2. Checking if tokens are valid..."
if [ "$ACCESS_TOKEN" != "null" ] && [ "$ACCESS_TOKEN" != "" ]; then
  echo "✅ Access token received: ${ACCESS_TOKEN:0:50}..."
else
  echo "❌ No access token received"
fi

if [ "$REFRESH_TOKEN" != "null" ] && [ "$REFRESH_TOKEN" != "" ]; then
  echo "✅ Refresh token received: ${REFRESH_TOKEN:0:50}..."
else
  echo "❌ No refresh token received"
fi

echo ""
echo "3. Testing protected endpoint with token..."
if [ "$ACCESS_TOKEN" != "null" ] && [ "$ACCESS_TOKEN" != "" ]; then
  PROTECTED_RESPONSE=$(curl -s http://localhost:3000/api/v1/clients \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  
  if echo "$PROTECTED_RESPONSE" | jq -e '.items' > /dev/null; then
    echo "✅ Protected endpoint accessible with token"
  else
    echo "❌ Protected endpoint failed with token"
    echo "Response: $PROTECTED_RESPONSE"
  fi
else
  echo "❌ Cannot test protected endpoint - no access token"
fi

echo ""
echo "🎯 Frontend Testing Instructions:"
echo "1. Open browser console (F12)"
echo "2. Go to http://localhost:4200"
echo "3. Login with admin@minierp.com / password123"
echo "4. Watch console for these logs:"
echo "   - 💾 Setting session: { remember: true/false, hasAccessToken: true, hasRefreshToken: true }"
echo "   - 💾 Session set in: localStorage/sessionStorage"
echo "   - 💾 Access token stored: YES"
echo "   - 💾 Refresh token stored: YES"
echo "5. Check DevTools → Application → Storage to see if tokens are actually stored"
echo "6. Navigate to /clients and refresh (F5)"
echo "7. Check if you see the storage loading logs"

echo ""
echo "Expected behavior:"
echo "- Login should show 💾 logs with tokens being stored"
echo "- Refresh should show 📂 logs loading user from storage"
echo "- Should stay on /clients page, not redirect to login"
