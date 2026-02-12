import { test, expect } from 'playwright-test-coverage';
import { basicInit, registerEndpoint } from './mocks';

test('Register', async ({ page }) => {
  await registerEndpoint(page);
  await page.goto('http://localhost:5173/');

  const email = 'billy@gmail.com';

  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('Billy');
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('pass');
  await page.getByRole('button', { name: 'Register' }).click();
  await expect(page.getByRole('link', { name: 'B', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'B', exact: true }).click();
  await expect(page.getByText(email)).toBeVisible();
});

test('Login', async ({ page }) => {

  await basicInit(page);

  await page.goto('http://localhost:5173/');

  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('pizzalover@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByRole('link', { name: 'PL', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'PL', exact: true }).click();
  await expect(page.getByText('pizzalover@jwt.com')).toBeVisible();
});
