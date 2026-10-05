import { test, expect } from './testSetup';
import { Role, User } from '../src/service/pizzaService';

test('register', async ({ page }) => {
  const registeredUser: User = {
    id: '1',
    name: 'Test User',
    email: 'example@gmail.com',
    password: 't',
    roles: [{ role: Role.Diner }],
  };
  const token = 'test-registration-token';

  await page.route('**/api/auth', async (route) => {
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toEqual({
      name: 'Test User',
      email: 'example@gmail.com',
      password: 't',
    });
    await route.fulfill({ json: { user: registeredUser, token } });
  });

  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByPlaceholder('Full name').fill('Test User');
  await page.getByPlaceholder('Email address').fill('example@gmail.com');
  await page.getByPlaceholder('Password').fill('t');
  await page.getByRole('button', { name: 'Register' }).click();

  await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'TU' })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('token'))).toBe(token);
});