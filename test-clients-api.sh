#!/bin/bash

echo "🧪 Testing Clients API Endpoints"
echo "================================="

# Get auth token
echo "1. Getting auth token..."
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@minierp.com","password":"password123"}' | \
  jq -r '.accessToken')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Failed to get auth token"
  exit 1
fi

echo "✅ Auth token obtained"

# Test GET /clients
echo -e "\n2. Testing GET /clients..."
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/v1/clients" | jq '.'

# Test GET /clients with filters
echo -e "\n3. Testing GET /clients with filters..."
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/v1/clients?status=ACTIVE&limit=5" | jq '.'

# Test GET /clients with search
echo -e "\n4. Testing GET /clients with search..."
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/v1/clients?q=Royal" | jq '.'

# Get first client ID for detail tests
echo -e "\n5. Getting first client ID..."
CLIENT_ID=$(curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/v1/clients?limit=1" | \
  jq -r '.items[0].id')

if [ "$CLIENT_ID" = "null" ] || [ -z "$CLIENT_ID" ]; then
  echo "❌ No clients found"
  exit 1
fi

echo "✅ Client ID: $CLIENT_ID"

# Test GET /clients/:id
echo -e "\n6. Testing GET /clients/$CLIENT_ID..."
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/v1/clients/$CLIENT_ID" | jq '.'

# Test GET /clients/:id/summary
echo -e "\n7. Testing GET /clients/$CLIENT_ID/summary..."
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/v1/clients/$CLIENT_ID/summary" | jq '.'

# Test POST /clients (create new client)
echo -e "\n8. Testing POST /clients..."
NEW_CLIENT=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "http://localhost:3000/api/v1/clients" \
  -d '{
    "name": "Test Company Ltd",
    "type": "COMPANY",
    "email": "test@company.com",
    "phone": "+1234567890",
    "billingCity": "Test City",
    "billingCountry": "Test Country",
    "status": "PROSPECT",
    "paymentTerms": "D30",
    "preferredCurrency": "USD",
    "tags": ["test", "demo"],
    "creditLimit": 10000,
    "leadSource": "Website",
    "notes": "Test client created via API"
  }')

echo "$NEW_CLIENT" | jq '.'

# Extract new client ID
NEW_CLIENT_ID=$(echo "$NEW_CLIENT" | jq -r '.id')

if [ "$NEW_CLIENT_ID" != "null" ] && [ -n "$NEW_CLIENT_ID" ]; then
  echo "✅ New client created with ID: $NEW_CLIENT_ID"
  
  # Test PATCH /clients/:id
  echo -e "\n9. Testing PATCH /clients/$NEW_CLIENT_ID..."
  curl -s -X PATCH -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    "http://localhost:3000/api/v1/clients/$NEW_CLIENT_ID" \
    -d '{
      "status": "ACTIVE",
      "notes": "Updated via API test"
    }' | jq '.'
  
  # Test DELETE /clients/:id
  echo -e "\n10. Testing DELETE /clients/$NEW_CLIENT_ID..."
  curl -s -X DELETE -H "Authorization: Bearer $TOKEN" \
    "http://localhost:3000/api/v1/clients/$NEW_CLIENT_ID" | jq '.'
  
  echo "✅ Test client deleted"
else
  echo "❌ Failed to create new client"
fi

echo -e "\n🎉 All tests completed!"
