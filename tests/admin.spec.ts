import { test, expect } from 'playwright-test-coverage';
import { basicInit } from './mocks';

test('Admin Dashboard', async ({ page }) => {
    await basicInit(page);
    await page.goto('http://localhost:5173/');

    // Login as admin
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('admin@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('adminpassword');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByRole('link', { name: 'PA', exact: true })).toBeVisible();

    // Admin Dashboard, see all franchises
    await page.getByRole('link', { name: 'Admin' }).click();
    await expect(page.getByText('Mama Ricci\'s kitchen')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Franchises' })).toBeVisible();
    
    // See franchise, delete
    await expect(page.getByRole('cell', { name: 'LotaPizza' })).toBeVisible();
    await page.getByRole('row', { name: 'LotaPizza Close' }).getByRole('button').click();
    await expect(page.getByText('Sorry to see you go')).toBeVisible();
    await expect(page.getByRole('main')).toContainText('Are you sure you want to close the LotaPizza franchise? This will close all associated stores and cannot be restored. All outstanding revenue will not be refunded.');
    await page.getByRole('button', { name: 'Cancel' }).click();
    
    // See store, delete
    await expect(page.getByRole('cell', { name: 'Lehi' })).toBeVisible();
    await page.getByRole('row', { name: 'Lehi ₿ Close' }).getByRole('button').click();
    await expect(page.getByText('Sorry to see you go')).toBeVisible();
    await expect(page.getByRole('main')).toContainText('Are you sure you want to close the LotaPizza store Lehi ? This cannot be restored. All outstanding revenue will not be refunded.');
    await page.getByRole('button', { name: 'Cancel' }).click();
    
    // Add franchise screen
    await expect(page.getByRole('button', { name: 'Add Franchise' })).toBeVisible();
    await page.getByRole('button', { name: 'Add Franchise' }).click();
    await expect(page.getByText('Create franchise', { exact: true })).toBeVisible();
    await expect(page.getByText('Want to create franchise?')).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();
});
