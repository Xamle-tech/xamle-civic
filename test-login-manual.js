#!/usr/bin/env node

/**
 * Manual test script for login flow
 * Tests all 4 accounts and verifies the response
 */

const API_URL = 'http://localhost:4000/api/v1';

const accounts = [
  { email: 'admin@xamle.sn', password: 'Admin@1234', expectedRole: 'SUPER_ADMIN', expectedRedirect: '/admin/policies' },
  { email: 'moderateur@xamle.sn', password: 'Admin@1234', expectedRole: 'MODERATOR', expectedRedirect: '/admin/policies' },
  { email: 'editeur@xamle.sn', password: 'Admin@1234', expectedRole: 'EDITOR', expectedRedirect: '/admin/policies' },
  { email: 'citoyen@example.sn', password: 'Admin@1234', expectedRole: 'CONTRIBUTOR', expectedRedirect: '/dashboard/overview' },
];

async function testLogin(account) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: account.email, password: account.password }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.log(`❌ ${account.email}: ${data.message || 'Login failed'}`);
      return false;
    }

    const { user, accessToken, expiresIn } = data.data;

    // Verify response structure
    if (!user || !accessToken || !expiresIn) {
      console.log(`❌ ${account.email}: Missing fields in response`);
      return false;
    }

    // Verify role
    if (user.role !== account.expectedRole) {
      console.log(`❌ ${account.email}: Wrong role (got ${user.role}, expected ${account.expectedRole})`);
      return false;
    }

    // Verify token is a valid JWT (3 parts separated by dots)
    const tokenParts = accessToken.split('.');
    if (tokenParts.length !== 3) {
      console.log(`❌ ${account.email}: Invalid JWT format`);
      return false;
    }

    console.log(`✅ ${account.email}: Login OK → ${account.expectedRedirect} (role: ${user.role})`);
    return true;
  } catch (error) {
    console.log(`❌ ${account.email}: ${error.message}`);
    return false;
  }
}

async function testInvalidCredentials() {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'wrong@example.com', password: 'wrongpassword' }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('❌ Invalid credentials: Should have failed but succeeded');
      return false;
    }

    if (data.message && data.message.includes('incorrect')) {
      console.log('✅ Invalid credentials: Correctly rejected');
      return true;
    }

    console.log('❌ Invalid credentials: Wrong error message');
    return false;
  } catch (error) {
    console.log(`❌ Invalid credentials test: ${error.message}`);
    return false;
  }
}

async function testEmailNormalization() {
  try {
    // Test with uppercase and spaces
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: '  ADMIN@XAMLE.SN  ', password: 'Admin@1234' }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.log(`❌ Email normalization: ${data.message || 'Failed'}`);
      return false;
    }

    console.log('✅ Email normalization: Uppercase and spaces handled correctly');
    return true;
  } catch (error) {
    console.log(`❌ Email normalization test: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🧪 Testing Xamle Civic Login Flow');
  console.log('=====================================\n');

  console.log('📡 Testing valid credentials:');
  console.log('------------------------------');
  
  let passed = 0;
  let failed = 0;

  for (const account of accounts) {
    const result = await testLogin(account);
    if (result) passed++;
    else failed++;
  }

  console.log('\n📡 Testing invalid credentials:');
  console.log('--------------------------------');
  const invalidResult = await testInvalidCredentials();
  if (invalidResult) passed++;
  else failed++;

  console.log('\n📡 Testing email normalization:');
  console.log('--------------------------------');
  const normResult = await testEmailNormalization();
  if (normResult) passed++;
  else failed++;

  console.log('\n=====================================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('=====================================\n');

  if (failed === 0) {
    console.log('🎉 All tests passed!');
    console.log('\n📝 Next steps:');
    console.log('1. Open http://localhost:3001/auth/login in your browser');
    console.log('2. Open DevTools (F12) → Console');
    console.log('3. Try logging in with any of the accounts above');
    console.log('4. Check for [LOGIN], [STORE], and [MIDDLEWARE] logs');
    console.log('5. Verify cookies in Application → Cookies');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed. Please check the API and database.');
    process.exit(1);
  }
}

main();
