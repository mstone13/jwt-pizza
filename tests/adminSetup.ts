import { Page } from '@playwright/test';
import { expect } from './testSetup';
import { Role, User } from '../src/service/pizzaService';

export const admin: User & { password: string } = {
  id: '1',
  name: 'Admin User',
  email: 'a@jwt.com',
  password: 'a',
  roles: [{ role: Role.Admin }],
};

export async function mockAdminApi(page: Page) {
  await page.route('*/**/api/auth', async (route) => {
    expect(route.request().method()).toBe('PUT');
    expect(route.request().postDataJSON()).toEqual({ email: admin.email, password: admin.password });
    await route.fulfill({ json: { user: admin, token: 'abcdef' } });
  });

  await page.route('*/**/api/user/me', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: admin });
  });

  await page.route('*/**/api/franchise*', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({
      json: {
        franchises: [{ id: '1', name: 'Test Franchise', stores: [] }],
        more: false,
      },
    });
  });

  await page.route(`*/**/api/franchise/${admin.id}`, async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: [] });
  });
}
