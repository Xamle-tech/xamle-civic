import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies and storage
    await page.context().clearCookies();
    await page.goto(BASE_URL);
  });

  test('Admin login redirects to /admin/policies', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);
    
    // Fill login form
    await page.fill('input[type="email"]', 'admin@xamle.sn');
    await page.fill('input[type="password"]', 'Admin@1234');
    
    // Submit and wait for navigation
    await Promise.all([
      page.waitForURL(/\/(admin|dashboard)/),
      page.click('button[type="submit"]'),
    ]);
    
    // Should redirect to admin
    await expect(page).toHaveURL(/\/admin\/policies/);
    
    // Check cookies are set
    const cookies = await page.context().cookies();
    const accessToken = cookies.find(c => c.name === 'access_token');
    const userRole = cookies.find(c => c.name === 'user_role');
    
    expect(accessToken).toBeDefined();
    expect(accessToken?.value).toBeTruthy();
    expect(userRole?.value).toBe('SUPER_ADMIN');
  });

  test('Moderator login redirects to /admin/policies', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);
    
    await page.fill('input[type="email"]', 'moderateur@xamle.sn');
    await page.fill('input[type="password"]', 'Admin@1234');
    
    await Promise.all([
      page.waitForURL(/\/(admin|dashboard)/),
      page.click('button[type="submit"]'),
    ]);
    
    await expect(page).toHaveURL(/\/admin\/policies/);
    
    const cookies = await page.context().cookies();
    const userRole = cookies.find(c => c.name === 'user_role');
    expect(userRole?.value).toBe('MODERATOR');
  });

  test('Editor login redirects to /admin/policies', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);
    
    await page.fill('input[type="email"]', 'editeur@xamle.sn');
    await page.fill('input[type="password"]', 'Admin@1234');
    
    await Promise.all([
      page.waitForURL(/\/(admin|dashboard)/),
      page.click('button[type="submit"]'),
    ]);
    
    await expect(page).toHaveURL(/\/admin\/policies/);
    
    const cookies = await page.context().cookies();
    const userRole = cookies.find(c => c.name === 'user_role');
    expect(userRole?.value).toBe('EDITOR');
  });

  test('Citizen login redirects to /dashboard/overview', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);
    
    await page.fill('input[type="email"]', 'citoyen@example.sn');
    await page.fill('input[type="password"]', 'Admin@1234');
    
    await Promise.all([
      page.waitForURL(/\/dashboard/),
      page.click('button[type="submit"]'),
    ]);
    
    await expect(page).toHaveURL(/\/dashboard\/overview/);
    
    const cookies = await page.context().cookies();
    const userRole = cookies.find(c => c.name === 'user_role');
    expect(userRole?.value).toBe('CONTRIBUTOR');
  });

  test('Invalid credentials show error message', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);
    
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('text=/Email ou mot de passe incorrect/i')).toBeVisible();
    
    // Should stay on login page
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('Protected routes redirect to login when not authenticated', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/overview`);
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/auth\/login/);
    
    // Should have redirect parameter
    const url = new URL(page.url());
    expect(url.searchParams.get('redirect')).toBe('/dashboard/overview');
  });

  test('Citizen cannot access admin routes', async ({ page }) => {
    // Login as citizen
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[type="email"]', 'citoyen@example.sn');
    await page.fill('input[type="password"]', 'Admin@1234');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
    
    // Try to access admin route
    await page.goto(`${BASE_URL}/admin/policies`);
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard\/overview/);
  });

  test('Login with redirect parameter works', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login?redirect=/dashboard/analytics`);
    
    await page.fill('input[type="email"]', 'citoyen@example.sn');
    await page.fill('input[type="password"]', 'Admin@1234');
    
    await Promise.all([
      page.waitForURL(/\/dashboard\/analytics/),
      page.click('button[type="submit"]'),
    ]);
    
    await expect(page).toHaveURL(/\/dashboard\/analytics/);
  });

  test('Email normalization works (uppercase, spaces)', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);
    
    // Try with uppercase and spaces
    await page.fill('input[type="email"]', '  ADMIN@XAMLE.SN  ');
    await page.fill('input[type="password"]', 'Admin@1234');
    
    await Promise.all([
      page.waitForURL(/\/admin/),
      page.click('button[type="submit"]'),
    ]);
    
    await expect(page).toHaveURL(/\/admin\/policies/);
  });
});
