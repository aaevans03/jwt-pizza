import { test, expect } from 'playwright-test-coverage';

test('Basic Navigation', async ({ page }) => {
    await page.goto('http://localhost:5173/');

    // Homepage
    await expect(page.getByText('The web\'s best pizza', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Order now' })).toBeVisible();

    // About
    await page.getByRole('link', { name: 'About' }).click();
    await expect(page.getByText('The secret sauce')).toBeVisible();
    await page.getByText('At JWT Pizza, our amazing').click();
    await expect(page.getByRole('img').nth(3)).toBeVisible();
    await expect(page.getByRole('link', { name: 'about', exact: true })).toBeVisible();

    // History 
    await page.getByRole('link', { name: 'History' }).click();
    await expect(page.getByText('Mama Rucci, my my')).toBeVisible();
    await expect(page.getByRole('main').getByRole('img')).toBeVisible();
    await expect(page.getByRole('link', { name: 'history', exact: true })).toBeVisible();

    // Franchise Dashboard (not logged in)
    await page.getByRole('contentinfo').getByRole('link', { name: 'Franchise' }).click();
    await expect(page.getByText('So you want a piece of the')).toBeVisible();
    await expect(page.getByText('Now is the time to get in on')).toBeVisible();
    await expect(page.getByRole('main').locator('img')).toBeVisible();
    await expect(page.getByRole('cell', { name: '2020' })).toBeVisible();
    await expect(page.getByRole('cell', { name: '₿' }).first()).toBeVisible();
    await expect(page.getByRole('cell', { name: '400 ₿' })).toBeVisible();
    await expect(page.getByRole('cell', { name: '₿' }).nth(2)).toBeVisible();
    
    // Random Page
    await page.goto('http://localhost:5173/lol');
    await expect(page.getByText('Oops')).toBeVisible();
    await expect(page.getByText('It looks like we have dropped')).toBeVisible();
});
