import { test, expect } from 'playwright-test-coverage';

test('Re-Register with same user', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('Billy');
  await page.getByRole('textbox', { name: 'Email address' }).fill('billy@boo.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('monkeypie');
  await page.getByRole('button', { name: 'Register' }).click();
  await expect(page.getByRole('link', { name: 'B', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'B', exact: true }).click();
  await expect(page.getByText('billy@boo.com')).toBeVisible();
});

test('Register', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // random email
  const email = 'bob' + Math.random().toString(36).substring(2, 8) + '@boo.com';

  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('Billy');
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('monkeypie');
  await page.getByRole('button', { name: 'Register' }).click();
  await expect(page.getByRole('link', { name: 'B', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'B', exact: true }).click();
  await expect(page.getByText(email)).toBeVisible();
});

test('Login', async ({ page }) => {

  await page.route('*/**/api/auth', async (route) => {
    const loginReq = { email: 'bob@gmail.com', password: 'monkeypie' };
    const loginRes = {
      user: {
        id: 3,
        name: 'bob',
        email: 'bob@gmail.com',
        roles: [{ role: 'diner' }],
      },
      token: 'abcdef',
    };
    expect(route.request().method()).toBe('PUT');
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });

  await page.goto('http://localhost:5173/');

  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('bob@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('monkeypie');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByRole('link', { name: 'b', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'b', exact: true }).click();
  await expect(page.getByText('bob@gmail.com')).toBeVisible();

});
