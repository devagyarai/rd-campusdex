import { test, expect } from '@playwright/test';

test.describe('Student Business Flow Lifecycle', () => {
  test('Complete login to dashboard to profile journey', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await expect(page).toHaveTitle(/Login/);
    
    // Fill credentials (assuming a seeded test user exists)
    await page.fill('input[type="email"]', 'student@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // 2. Dashboard Access
    await expect(page).toHaveURL(/\/student\/dashboard/);
    await expect(page.locator('text=Welcome')).toBeVisible();

    // 3. Navigate to Assignments
    await page.click('a[href="/student/assignments"]');
    await expect(page).toHaveURL(/\/student\/assignments/);
    await expect(page.locator('text=Assignments')).toBeVisible();

    // Visual Regression (example)
    // await expect(page).toHaveScreenshot('student-assignments.png');

    // 4. Navigate to Profile
    await page.click('a[href="/student/profile"]');
    await expect(page).toHaveURL(/\/student\/profile/);
    
    // 5. Logout
    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL(/\/login/);
  });
});
