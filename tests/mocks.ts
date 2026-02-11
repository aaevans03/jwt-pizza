import { Page } from '@playwright/test';
import { expect } from 'playwright-test-coverage';

export async function loginEndpoint(page: Page) {
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
}

export async function registerEndpoint(page: Page) {
  await page.route('*/**/api/auth', async (route) => {
    const registerReq = { name: 'Billy', email: 'billy@gmail.com', password: 'pass' };
    const registerRes = {
      user: {
        id: 1,
        name: 'Billy',
        email: 'billy@gmail.com',
        roles: [{ role: 'diner' }],
      },
      token: 'abcdef',
    };
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toMatchObject(registerReq);
    await route.fulfill({ json: registerRes });
  });
}

