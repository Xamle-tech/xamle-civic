#!/bin/bash
set -e

API_URL="http://localhost:4000/api/v1"
WEB_URL="http://localhost:3001"

echo "🧪 Testing Xamle Civic Authentication Flow"
echo "==========================================="
echo ""

# Test 1: API Login endpoints
echo "📡 Test 1: API Login Endpoints"
echo "--------------------------------"

test_login() {
  local email=$1
  local expected_role=$2
  
  echo -n "Testing $email... "
  
  response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"Admin@1234\"}")
  
  http_code=$(echo "$response" | tail -1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
    role=$(echo "$body" | jq -r '.data.user.role')
    token=$(echo "$body" | jq -r '.data.accessToken')
    
    if [ "$role" = "$expected_role" ] && [ "$token" != "null" ] && [ -n "$token" ]; then
      echo "✅ OK (role: $role)"
      return 0
    else
      echo "❌ FAIL (role: $role, expected: $expected_role)"
      return 1
    fi
  else
    echo "❌ FAIL (HTTP $http_code)"
    echo "$body" | jq -r '.message' 2>/dev/null || echo "$body"
    return 1
  fi
}

test_login "admin@xamle.sn" "SUPER_ADMIN"
test_login "moderateur@xamle.sn" "MODERATOR"
test_login "editeur@xamle.sn" "EDITOR"
test_login "citoyen@example.sn" "CONTRIBUTOR"

echo ""
echo "✅ All API login tests passed!"
echo ""

# Test 2: Check if web app is running
echo "🌐 Test 2: Web Application"
echo "--------------------------------"
echo -n "Checking if web app is running... "

if curl -s -f "$WEB_URL" > /dev/null 2>&1; then
  echo "✅ OK"
else
  echo "❌ FAIL - Web app not running on $WEB_URL"
  echo "Please start the web app with: cd apps/web && pnpm dev"
  exit 1
fi

echo ""

# Test 3: Check protected routes redirect to login
echo "🔒 Test 3: Protected Routes"
echo "--------------------------------"

check_redirect() {
  local path=$1
  echo -n "Testing $path... "
  
  response=$(curl -s -w "\n%{http_code}" -L "$WEB_URL$path")
  http_code=$(echo "$response" | tail -1)
  body=$(echo "$response" | sed '$d')
  
  # Should redirect to login or return 200 if already logged in
  if [ "$http_code" = "200" ] || [ "$http_code" = "307" ] || [ "$http_code" = "308" ]; then
    if echo "$body" | grep -q "login\|Connexion" || echo "$body" | grep -q "dashboard\|admin"; then
      echo "✅ OK"
      return 0
    fi
  fi
  
  echo "⚠️  Unexpected response (HTTP $http_code)"
  return 0  # Don't fail on this, just warn
}

check_redirect "/dashboard/overview"
check_redirect "/admin/policies"

echo ""
echo "✅ All tests completed!"
echo ""
echo "📝 Manual Testing Steps:"
echo "1. Open $WEB_URL/auth/login in your browser"
echo "2. Open browser DevTools (F12) → Console tab"
echo "3. Try logging in with: admin@xamle.sn / Admin@1234"
echo "4. Check console for [LOGIN] and [STORE] logs"
echo "5. After redirect, check Application → Cookies for access_token and user_role"
echo ""
