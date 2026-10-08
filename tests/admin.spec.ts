import { test, expect } from './testSetup';
import { admin, mockAdminApi } from './adminSetup';
import { Franchise, Store } from '../src/service/pizzaService';

test.beforeEach(async ({ page }) => {
  await mockAdminApi(page);
  await page.goto('/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(admin.email!);
  await page.getByRole('textbox', { name: 'Password' }).fill(admin.password);
  await page.getByRole('button', { name: 'Login' }).click();
});

test('admin views the admin dashboard', async ({ page }) => {
  await page.getByRole('link', { name: 'Admin' }).click();
  await expect(page.getByRole('heading', { name: "Mama Ricci's kitchen" })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Franchises' })).toBeVisible();
  await expect(page.getByText('Test Franchise')).toBeVisible();
});

test('admin views the franchise dashboard', async ({ page }) => {
  await page.getByRole('link', { name: 'Admin' }).click();
  await page.getByRole('link', { name: 'Franchise' }).click();
});

test('admin creates and closes a store', async ({ page }) => {
  const franchise: Franchise = { id: '1', name: 'Test Franchise', stores: [] };

  await page.route(/\/api\/franchise(?:\/.*)?(?:\?.*)?$/, async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;

    if (request.method() === 'GET' && path === '/api/franchise/1') {
      await route.fulfill({ json: [franchise] });
    } else if (request.method() === 'GET' && path === '/api/franchise') {
      await route.fulfill({ json: { franchises: [franchise], more: false } });
    } else if (request.method() === 'POST' && path === '/api/franchise/1/store') {
      const store = request.postDataJSON() as Store;
      expect(store).toEqual({ id: '', name: 'Provo' });
      franchise.stores = [{ ...store, id: '2' }];
      await route.fulfill({ json: franchise.stores[0] });
    } else if (request.method() === 'DELETE' && path === '/api/franchise/1/store/2') {
      franchise.stores = [];
      await route.fulfill({ json: null });
    } else {
      throw new Error(`Unexpected franchise API request: ${request.method()} ${path}`);
    }
  });

  await page.goto('/franchise-dashboard');
  await expect(page.getByRole('heading', { name: 'Test Franchise' })).toBeVisible();
  await page.getByRole('button', { name: 'Create store' }).click();
  await page.getByPlaceholder('store name').fill('Provo');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByRole('cell', { name: 'Provo' })).toBeVisible();

  await page.getByRole('link', { name: 'Admin' }).click();
  const storeRow = page.getByRole('row').filter({ hasText: 'Provo' });
  await storeRow.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByText(/close the Test Franchise store Provo/)).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('heading', { name: "Mama Ricci's kitchen" })).toBeVisible();
  await expect(page.getByText('Provo')).toHaveCount(0);
});
