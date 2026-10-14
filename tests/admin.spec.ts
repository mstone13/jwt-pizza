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

test('admin can see users list', async ({ page }) => {
  await page.getByRole('link', { name: 'Admin' }).click();
  await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
  await expect(page.getByRole('table').filter({ hasText: 'NameEmailRole' })).toBeVisible();
});

test('admin can page through users ten at a time', async ({ page }) => {
  const users = Array.from({ length: 20 }, (_, index) => ({
    id: `${index + 1}`,
    name: `User ${index + 1}`,
    email: `user${index + 1}@jwt.com`,
    roles: [],
  }));

  await page.route('*/**/api/user?*', async (route) => {
    const url = new URL(route.request().url());
    const pageNumber = Number(url.searchParams.get('page'));
    const limit = Number(url.searchParams.get('limit'));
    const start = (pageNumber - 1) * limit;

    await route.fulfill({
      json: {
        users: users.slice(start, start + limit),
        more: start + limit < users.length,
      },
    });
  });

  await page.getByRole('link', { name: 'Admin' }).click();
  await expect(page.getByRole('cell', { name: 'User 1', exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'User 10', exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'User 11', exact: true })).toHaveCount(0);

  const previous = page.getByRole('button', { name: 'Previous' });
  const next = page.getByRole('button', { name: 'Next' });
  await expect(previous).toBeDisabled();
  await expect(next).toBeEnabled();
  await next.click();

  await expect(page.getByRole('cell', { name: 'User 11', exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'User 20', exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'User 10', exact: true })).toHaveCount(0);
  await expect(previous).toBeEnabled();
  await expect(next).toBeDisabled();
  await previous.click();

  await expect(page.getByRole('cell', { name: 'User 1', exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'User 11', exact: true })).toHaveCount(0);
});

test ('admin can filter users list by name', async ({ page }) => {
  const users = [
    { id: '1', name: 'Alice', email: 'alice@jwt.com', roles: [] },
    { id: '2', name: 'Bob', email: 'bob@jwt.com', roles: [] },
    { id: '3', name: 'Charlie', email: 'charlie@jwt.com', roles: [] },
  ];

  await page.route('*/**/api/user?*', async (route) => {
    const url = new URL(route.request().url());
    const nameFilter = url.searchParams.get('name');

    let filteredUsers = users;
    if (nameFilter && nameFilter !== '*') {
      filteredUsers = users.filter((user) => user.name.includes(nameFilter));
    }

    await route.fulfill({
      json: {
        users: filteredUsers,
        more: false,
      },
    });
  });

  await page.getByRole('link', { name: 'Admin' }).click();
  await expect(page.getByRole('cell', { name: 'Alice', exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Bob', exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Charlie', exact: true })).toBeVisible();

  await page.getByPlaceholder('Filter users').fill('Alice');
  await page.getByRole('table').filter({ hasText: 'NameEmailRole' }).getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByRole('cell', { name: 'Charlie', exact: true })).toHaveCount(0);
  await expect(page.getByRole('cell', { name: 'Bob', exact: true })).toHaveCount(0);
  await expect(page.getByRole('cell', { name: 'Alice', exact: true })).toBeVisible();
});
