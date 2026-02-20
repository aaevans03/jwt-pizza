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
    
    // Create a new franchise
    await page.getByRole('textbox', { name: 'franchise name' }).click();
    await page.getByRole('textbox', { name: 'franchise name' }).fill('Pie it Up');
    await page.getByRole('textbox', { name: 'franchise name' }).press('Tab');
    await page.getByRole('textbox', { name: 'franchisee admin email' }).fill('franchisee@jwt.com');
    await page.getByRole('button', { name: 'Create' }).click();
    
    // Expect that new franchise to display
    await expect(page.getByRole('cell', { name: 'Pie it Up' })).toBeVisible();
});

test('Admin Dashboard User List', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    // await basicInit(page);

    // Login as admin
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('admin');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByRole('link', { name: '常', exact: true })).toBeVisible();

    // Admin Dashboard, see all franchises
    await page.getByRole('link', { name: 'Admin' }).click();
    await expect(page.getByText('Mama Ricci\'s kitchen')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Franchises' })).toBeVisible();

    // User table
    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'ID' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Roles' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Action' }).nth(1)).toBeVisible();
    
    await expect(page.getByRole('main')).toContainText('diner');
    
    // Get the first user ID
    const firstUserId = Number(await page.locator('td#userId').nth(0).textContent());
    expect(Number.isInteger(firstUserId)).toBe(true);
    
    // Go up a page, get the second user ID, make sure it's greater than the first one
    await page.getByRole('button', { name: '»' }).nth(1).click();
    await expect(page.locator('td#userId').nth(0)).not.toHaveText(firstUserId.toString());
    const secondUserId = Number(await page.locator('td#userId').nth(0).textContent());
    expect(Number.isInteger(secondUserId)).toBe(true);
    expect(firstUserId < secondUserId).toBe(true);
    
    // Go back to first page, make sure you get the same first ID as before
    await page.getByRole('button', { name: '«' }).nth(1).click();
    await expect(page.locator('td#userId').nth(0)).not.toHaveText(secondUserId.toString());
    const firstUserIdAgain = Number(await page.locator('td#userId').nth(0).textContent());
    expect(firstUserIdAgain).toBe(firstUserId);
});

test('Admin Dashboard User List, Delete User', async ({ page }) => {
        await page.goto('http://localhost:5173/');
    // await basicInit(page);

    // Login as admin
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('admin');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByRole('link', { name: '常', exact: true })).toBeVisible();

    // Admin Dashboard, see all franchises
    await page.getByRole('link', { name: 'Admin' }).click();
    await expect(page.getByText('Mama Ricci\'s kitchen')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Franchises' })).toBeVisible();
    
    // User table
    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'ID' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Roles' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Action' }).nth(1)).toBeVisible();
    
    await expect(page.getByRole('main')).toContainText('diner');

    // Grab ID of user to delete
    const userIdLocator = page.locator('td#userId').nth(1);
    const userId = await userIdLocator.textContent() ?? '';
    const userEmail = await page.locator('td#userEmail').nth(1).textContent() ?? '';
    
    expect(userId).not.toBe('');
    expect(userEmail).not.toBe('');

    // Delete that user
    await page.getByRole('button', { name: 'Remove' }).nth(1).click();
    await expect(page.getByRole('heading', { name: 'Confirmation' })).toBeVisible();
    await expect(page.locator('span').filter({ hasText: 'pizza diner' })).toBeVisible();
    await page.getByRole('button', { name: 'Delete' }).click();
    
    // Expect the dialog and the user info to not be visible
    await expect(page.getByRole('heading', { name: 'Confirmation' })).not.toBeVisible();
    await expect(page.locator('td#userId').nth(1)).not.toHaveText(userId.toString());
    await expect(page.locator('td#userEmail').nth(1)).not.toHaveText(userEmail.toString());
    await expect(page.getByRole('cell', { name: userId })).not.toBeVisible();
    await expect(page.getByRole('cell', { name: userEmail })).not.toBeVisible();
});
