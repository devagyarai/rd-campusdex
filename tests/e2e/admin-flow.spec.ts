import { test, expect } from '@playwright/test';

test.describe('Admin Business Flow Lifecycle', () => {
  test('Complete login to dashboard to profile journey', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    
    // Fill credentials (assuming a seeded test admin exists)
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // 2. Dashboard Access
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await expect(page.locator('text=Dashboard')).toBeVisible();

    // 3. Navigate to Notices
    await page.click('a[href="/admin/notices"]');
    await expect(page).toHaveURL(/\/admin\/notices/);
    await expect(page.locator('text=Notices')).toBeVisible();

    // 4. Navigate to Profile
    await page.click('a[href="/admin/profile"]');
    await expect(page).toHaveURL(/\/admin\/profile/);
    
    // 5. Logout
    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL(/\/login/);
  });
});
