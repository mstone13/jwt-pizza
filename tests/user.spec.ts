import { test, expect } from 'playwright-test-coverage';

test('updateUser', async ({ page }) => {
  const registeredUser = {
    id: '42',
    name: 'pizza diner',
    email: 'pizza-diner@jwt.com',
    roles: [{ role: 'diner' }],
  };
  const updatedUser = {
    ...registeredUser,
    name: 'pizza dinerx',
    email: 'updated-pizza-diner@jwt.com',
  };
  const token = 'test-user-token';
  let currentUser = registeredUser;
  let currentPassword = 'diner';

  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (url.pathname === '/api/auth' && request.method() === 'POST') {
      expect(request.postDataJSON()).toEqual({
        name: registeredUser.name,
        email: registeredUser.email,
        password: currentPassword,
      });
      await route.fulfill({ json: { user: currentUser, token } });
      return;
    }

    if (url.pathname === '/api/auth' && request.method() === 'PUT') {
      expect(request.postDataJSON()).toEqual({
        email: updatedUser.email,
        password: 'dinerx',
      });
      expect(currentUser.email).toBe(updatedUser.email);
      expect(currentPassword).toBe('dinerx');
      await route.fulfill({ json: { user: currentUser, token } });
      return;
    }

    if (url.pathname === '/api/auth' && request.method() === 'DELETE') {
      await route.fulfill({ json: null });
      return;
    }

    if (url.pathname === `/api/user/${registeredUser.id}` && request.method() === 'PUT') {
      const body = request.postDataJSON();
      expect(body).toEqual({ ...updatedUser, password: 'dinerx' });
      currentUser = updatedUser;
      currentPassword = body.password;
      await route.fulfill({ json: { user: currentUser, token } });
      return;
    }

    if (url.pathname === '/api/order' && request.method() === 'GET') {
      await route.fulfill({ json: { orders: [] } });
      return;
    }

    throw new Error(`Unexpected API request: ${request.method()} ${url.pathname}`);
  });

  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill(registeredUser.name);
  await page.getByRole('textbox', { name: 'Email address' }).fill(registeredUser.email);
  await page.getByRole('textbox', { name: 'Password' }).fill(currentPassword);
  await page.getByRole('button', { name: 'Register' }).click();

  await page.getByRole('link', { name: 'pd' }).click();

  await expect(page.getByRole('main')).toContainText(registeredUser.name);
  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.locator('h3')).toContainText('Edit user');
  await page.getByRole('textbox').first().fill(updatedUser.name);
  await page.locator('input').nth(1).fill(updatedUser.email);
  await page.locator('input').nth(2).fill('dinerx');
  await page.getByRole('button', { name: 'Update' }).click();

  await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });

  await expect(page.getByRole('main')).toContainText(updatedUser.name);
  await expect(page.getByRole('main')).toContainText(updatedUser.email);

  await page.getByRole('link', { name: 'Logout' }).click();
  await page.getByRole('link', { name: 'Login' }).click();

  await page.getByRole('textbox', { name: 'Email address' }).fill(updatedUser.email);
  await page.getByRole('textbox', { name: 'Password' }).fill('dinerx');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: 'pd' }).click();

  await expect(page.getByRole('main')).toContainText(updatedUser.name);
  await expect(page.getByRole('main')).toContainText(updatedUser.email);
});