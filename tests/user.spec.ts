import { test, expect } from 'playwright-test-coverage';
import { basicInit } from './mocks';

test('updateUser', async ({ page }) => {
    await basicInit(page);
    await page.goto('http://localhost:5173/');
    // Register new user
    const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
    await page.goto('/');
    await page.getByRole('link', { name: 'Register' }).click();
    await page.getByRole('textbox', { name: 'Full name' }).fill('pizza diner');
    await page.getByRole('textbox', { name: 'Email address' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).fill('diner');
    await page.getByRole('button', { name: 'Register' }).click();

    // Navigate to diner-dashboard and change user info
    await page.getByRole('link', { name: 'pd' }).click();
    
    await expect(page.getByRole('main')).toContainText('pizza diner');
    
    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(page.locator('h3')).toContainText('Edit user');
    await page.getByRole('textbox').first().fill('Cool Name');
    await page.getByRole('textbox').nth(1).fill('new@email.com');
    
    await page.getByRole('button', { name: 'Update' }).click();
    
    // wait for hidden state on dialog
    await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });
    await expect(page.getByRole('main')).toContainText('Cool Name');
    
    // Logout, login, and changes should persist
    await page.getByRole('link', { name: 'Logout' }).click();
    await page.getByRole('link', { name: 'Login' }).click();
    
    await page.getByRole('textbox', { name: 'Email address' }).fill('new@email.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('diner');
    await page.getByRole('button', { name: 'Login' }).click();
    
    await page.getByRole('link', { name: 'CN' }).click();
    await expect(page.getByRole('main')).toContainText('Cool Name');
    await expect(page.getByRole('main')).toContainText('new@email.com');
});
