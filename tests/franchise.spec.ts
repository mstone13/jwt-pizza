import { test, expect } from './testSetup';
import { franchisee, mockFranchiseeApi, mockAdminFranchiseApi } from './franchiseSetup';
import { admin } from './adminSetup';

test('franchisee logs in and views the franchise dashboard', async ({ page }) => {
  await mockFranchiseeApi(page);
  await page.goto('/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(franchisee.email!);
  await page.getByRole('textbox', { name: 'Password' }).fill(franchisee.password);
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('navigation', { name: 'Global' }).getByRole('link', { name: 'Franchise' }).click();
  await expect(page.getByRole('heading', { name: 'Test Franchise' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Provo' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create store' })).toBeVisible();
});

test('admin creates and deletes a franchise', async ({ page }) => {
  await mockAdminFranchiseApi(page);
  await page.goto('/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(admin.email!);
  await page.getByRole('textbox', { name: 'Password' }).fill(admin.password);
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: 'Admin' }).click();
  await expect(page.getByRole('heading', { name: 'Mama Ricci\'s kitchen' })).toBeVisible();
  await expect(page.getByText('Test Franchise')).toHaveCount(0);

  await page.getByRole('button', { name: 'Add Franchise' }).click();
  await page.getByPlaceholder('franchise name').fill('Test Franchise');
  await page.getByPlaceholder('franchisee admin email').fill('franchisee@jwt.com');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByText('Test Franchise')).toBeVisible();

  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('heading', { name: 'Sorry to see you go' })).toBeVisible();
  await expect(page.getByText(/close the Test Franchise franchise/)).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('heading', { name: 'Mama Ricci\'s kitchen' })).toBeVisible();
  await expect(page.getByText('Test Franchise')).toHaveCount(0);
});
