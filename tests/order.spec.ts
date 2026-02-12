import { test, expect } from 'playwright-test-coverage';
import { basicInit } from './mocks';

test ('Order Pizza', async ({ page }) => {
  await basicInit(page);

  await page.goto('http://localhost:5173/');

  // Login
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('pizzalover@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByRole('link', { name: 'PL', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Order' }).click();

  // Look at menu options
  await expect(page.getByText('Awesome is a click away')).toBeVisible();
  await expect(page.getByRole('combobox')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Image Description Veggie A' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Image Description Pepperoni' })).toBeVisible();

  // Select a store and pizza
  await page.getByRole('combobox').selectOption('4');
  await page.getByRole('link', { name: 'Image Description Veggie A' }).click();

  await page.getByRole('button', { name: 'Checkout' }).click();

  // Checkout screen
  await expect(page.getByText('So worth it')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pay now' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Veggie' })).toBeVisible();
  await expect(page.locator('tbody').getByRole('cell', { name: '₿' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'pie' })).toBeVisible();
  await expect(page.locator('tfoot').getByRole('cell', { name: '₿' })).toBeVisible();

  await page.getByRole('button', { name: 'Pay now' }).click();

  // Delivery screen
  await expect(page.getByText('Here is your JWT Pizza!')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Verify' })).toBeVisible();
  await expect(page.getByText('order ID: 23pie count: 1total')).toBeVisible();
  await expect(page.getByText('eyJpYXQ')).toBeVisible();

  // Verify token
  await page.getByRole('button', { name: 'Verify' }).click();

  // Verified token status
  await expect(page.getByRole('heading', { name: 'JWT Pizza - valid' })).toBeVisible();
  await expect(page.locator('pre')).toContainText('{ "vendor": { "id": "pizzavendor", "name": "Pizza Vendor" }, "diner": { "id": 3, "name": "Pizza Lover", "email": "pizzalover@jwt.com" }, "order": { "items": [ { "menuId": 1, "description": "Veggie", "price": 0.0038 } ], "storeId": "4", "franchiseId": 2, "id": 9999 } }');
  await page.getByRole('button', { name: 'Close' }).click();

  // Access menu page again
  await page.getByRole('button', { name: 'Order more' }).click();
  await expect(page.getByRole('combobox')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Image Description Veggie A' })).toBeVisible();
});
