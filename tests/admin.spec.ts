import { test, expect } from 'playwright-test-coverage';
import { basicInit } from './mocks';

test('Admin Dashboard', async ({ page }) => {
    await basicInit(page);
    await page.goto('http://localhost:5173/');

    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('admin@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('adminpassword');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByRole('link', { name: 'PA', exact: true })).toBeVisible();


    await page.getByRole('link', { name: 'Admin' }).click();
    await expect(page.getByText('Mama Ricci\'s kitchen')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Franchises' })).toBeVisible();
    
    await expect(page.getByRole('cell', { name: 'LotaPizza' })).toBeVisible();
    await expect(page.getByRole('row', { name: 'LotaPizza Close' }).getByRole('button')).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Lehi' })).toBeVisible();
    await expect(page.getByRole('row', { name: 'Lehi ₿ Close' }).getByRole('button')).toBeVisible();

    await expect(page.getByRole('button', { name: 'Add Franchise' })).toBeVisible();
});
