#!/bin/bash

echo "🔧 Testing Authentication Fix"
echo "============================="

echo ""
echo "1. Testing login API with user object..."
LOGIN_RESPONSE=$(curl -s http://localhost:3000/api/v1/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@minierp.com","password":"password123"}')

echo "Login response:"
echo "$LOGIN_RESPONSE" | jq '.'

USER_OBJECT=$(echo $LOGIN_RESPONSE | jq -r '.user')
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.accessToken')

echo ""
echo "2. Checking if user object is present..."
if [ "$USER_OBJECT" != "null" ] && [ "$USER_OBJECT" != "" ]; then
  echo "✅ User object received: $USER_OBJECT"
else
  echo "❌ No user object received"
fi

echo ""
echo "3. Testing protected endpoint..."
if [ "$ACCESS_TOKEN" != "null" ] && [ "$ACCESS_TOKEN" != "" ]; then
  PROTECTED_RESPONSE=$(curl -s http://localhost:3000/api/v1/clients \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  
  if echo "$PROTECTED_RESPONSE" | jq -e '.items' > /dev/null; then
    echo "✅ Protected endpoint accessible"
  else
    echo "❌ Protected endpoint failed"
  fi
fi

echo ""
echo "🎯 Frontend Testing Instructions:"
echo "1. Go to http://localhost:4200"
echo "2. Login with admin@minierp.com / password123"
echo "3. Navigate to /clients"
echo "4. Press F5 (refresh)"
echo "5. Should stay on /clients page (not redirect to login)"
echo ""
echo "Expected behavior:"
echo "- Login should work and store user object"
echo "- Page refresh should maintain authentication"
echo "- No more 'undefined' JSON parsing errors"
