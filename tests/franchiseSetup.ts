import { Page, expect } from '@playwright/test';
import { admin } from './adminSetup';
import { Franchise, Role, User } from '../src/service/pizzaService';

export const franchisee: User & { password: string } = {
  id: '2',
  name: 'Franchise User',
  email: 'f@jwt.com',
  password: 'franchisee',
  roles: [{ role: Role.Franchisee }],
};

const franchise: Franchise = {
  id: '2',
  name: 'Test Franchise',
  stores: [{ id: '1', name: 'Provo' }],
};

export async function mockFranchiseeApi(page: Page) {
  await page.route('*/**/api/auth', async (route) => {
    expect(route.request().method()).toBe('PUT');
    expect(route.request().postDataJSON()).toEqual({ email: franchisee.email, password: franchisee.password });
    await route.fulfill({ json: { user: franchisee, token: 'franchise-token' } });
  });

  await page.route('*/**/api/user/me', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: franchisee });
  });

  await page.route(`*/**/api/franchise/${franchisee.id}`, async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: [franchise] });
  });
}

export async function mockAdminFranchiseApi(page: Page) {
  let franchises: Franchise[] = [];

  await page.route('*/**/api/auth', async (route) => {
    expect(route.request().method()).toBe('PUT');
    expect(route.request().postDataJSON()).toEqual({ email: admin.email, password: admin.password });
    await route.fulfill({ json: { user: admin, token: 'admin-token' } });
  });

  await page.route('*/**/api/user/me', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: admin });
  });

  await page.route(/\/api\/franchise(?:\/.*)?(?:\?.*)?$/, async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;

    if (path === '/api/franchise' && request.method() === 'GET') {
      await route.fulfill({ json: { franchises, more: false } });
    } else if (path === '/api/franchise' && request.method() === 'POST') {
      const createdFranchise = request.postDataJSON() as Franchise;
      expect(createdFranchise).toEqual({
        id: '',
        name: 'Test Franchise',
        stores: [],
        admins: [{ email: 'franchisee@jwt.com' }],
      });
      franchises = [{ ...createdFranchise, id: '2' }];
      await route.fulfill({ json: franchises[0] });
    } else if (path === '/api/franchise/2' && request.method() === 'DELETE') {
      franchises = franchises.filter((item) => item.id !== '2');
      await route.fulfill({ json: {} });
    } else {
      throw new Error(`Unexpected franchise API request: ${request.method()} ${path}`);
    }
  });
}
