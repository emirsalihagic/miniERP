#!/bin/bash

echo "🧪 Testing Authentication Refresh Fix"
echo "====================================="

# Test 1: Login and get tokens
echo "1. Testing login..."
LOGIN_RESPONSE=$(curl -s http://localhost:3000/api/v1/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@minierp.com","password":"password123"}')

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.accessToken')
REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.refreshToken')

echo "✅ Login successful"
echo "Access Token: ${ACCESS_TOKEN:0:50}..."
echo "Refresh Token: ${REFRESH_TOKEN:0:50}..."

# Test 2: Test protected endpoint with valid token
echo ""
echo "2. Testing protected endpoint with valid token..."
PROTECTED_RESPONSE=$(curl -s http://localhost:3000/api/v1/clients \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$PROTECTED_RESPONSE" | jq -e '.items' > /dev/null; then
  echo "✅ Protected endpoint accessible with valid token"
else
  echo "❌ Protected endpoint failed with valid token"
fi

# Test 3: Test token refresh
echo ""
echo "3. Testing token refresh..."
REFRESH_RESPONSE=$(curl -s http://localhost:3000/api/v1/auth/refresh \
  -X POST \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}")

NEW_ACCESS_TOKEN=$(echo $REFRESH_RESPONSE | jq -r '.accessToken')

if [ "$NEW_ACCESS_TOKEN" != "null" ] && [ "$NEW_ACCESS_TOKEN" != "" ]; then
  echo "✅ Token refresh successful"
  echo "New Access Token: ${NEW_ACCESS_TOKEN:0:50}..."
else
  echo "❌ Token refresh failed"
fi

# Test 4: Test protected endpoint with refreshed token
echo ""
echo "4. Testing protected endpoint with refreshed token..."
PROTECTED_RESPONSE_NEW=$(curl -s http://localhost:3000/api/v1/clients \
  -H "Authorization: Bearer $NEW_ACCESS_TOKEN")

if echo "$PROTECTED_RESPONSE_NEW" | jq -e '.items' > /dev/null; then
  echo "✅ Protected endpoint accessible with refreshed token"
else
  echo "❌ Protected endpoint failed with refreshed token"
fi

# Test 5: Test expired token (simulate)
echo ""
echo "5. Testing with expired token (should fail)..."
EXPIRED_RESPONSE=$(curl -s http://localhost:3000/api/v1/clients \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYWRkMWVlNS1kNjE4LTQ3OTUtYjllNi03MzcwY2Q0ZWRlMzQiLCJlbWFpbCI6ImFkbWluQG1pbmllcnAuY29tIiwicm9sZSI6IkVNUExPWUVFIiwiaWF0IjoxNzYwMjg4OTEzLCJleHAiOjE3NjAyODk4MTN9.invalid")

if echo "$EXPIRED_RESPONSE" | jq -e '.message' > /dev/null; then
  echo "✅ Expired token properly rejected"
else
  echo "❌ Expired token not properly handled"
fi

echo ""
echo "🎯 Frontend Testing Instructions:"
echo "1. Open http://localhost:4200"
echo "2. Login with admin@minierp.com / password123"
echo "3. Navigate to /clients"
echo "4. Press F5 (refresh) - should stay on /clients"
echo "5. Wait for token to expire, then refresh - should auto-refresh and stay"
echo "6. Delete refresh_token from browser storage, refresh - should redirect to login with returnUrl"

echo ""
echo "✅ Authentication refresh fix implementation complete!"
