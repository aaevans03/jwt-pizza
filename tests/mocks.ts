import { Page } from '@playwright/test';
import { expect } from 'playwright-test-coverage';
import { Role, User } from '../src/service/pizzaService';

export async function basicInit(page: Page) {
  let loggedInUser: User | undefined;
  const validUsers: Record<string, User> = {
    'pizzalover@jwt.com': {
      id: '3',
      name: 'Pizza Lover',
      email: 'pizzalover@jwt.com',
      password: 'password',
      roles: [{ role: Role.Diner }]
    },
    'admin@jwt.com': {
      id: '4',
      name: 'Pizza Admin',
      email: 'admin@jwt.com',
      password: 'adminpassword',
      roles: [{ role: Role.Admin }]
    },
    'franchisee@jwt.com': {
      id: '5',
      name: 'Pizza Franchisee',
      email: 'franchisee@jwt.com',
      password: 'franchiseepassword',
      roles: [{ role: Role.Franchisee }]
    }
  };

  let franchises = [
    {
      id: 2,
      name: 'LotaPizza',
      stores: [
        { id: 4, name: 'Lehi' },
        { id: 5, name: 'Springville' },
        { id: 6, name: 'American Fork' },
      ],
    },
    { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
    { id: 4, name: 'topSpot', stores: [] }
  ];

  // Authorize login for the given user
  await page.route('*/**/api/auth', async (route) => {
    const method = route.request().method();

    if (method === 'PUT') {
      const loginReq = route.request().postDataJSON();
      const user = validUsers[loginReq.email];
      if (!user || user.password !== loginReq.password) {
        await route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
        return;
      }
      loggedInUser = validUsers[loginReq.email];
      const loginRes = {
        user: loggedInUser,
        token: 'abcdef',
      };
      expect(route.request().method()).toBe('PUT');
      await route.fulfill({ json: loginRes });
    }

    else if (method === 'POST') {
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
    }

    else if (method === 'DELETE') {
      expect(route.request().method()).toBe('DELETE');

      const success = {
        message: 'logout successful'
      }
      await route.fulfill({ json: success })
    }
  });

  // Return the currently logged in user
  await page.route('*/**/api/user/me', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: loggedInUser });
  });

  // A standard menu
  await page.route('*/**/api/order/menu', async (route) => {
    const menuRes = [
      {
        id: 1,
        title: 'Veggie',
        image: 'pizza1.png',
        price: 0.0038,
        description: 'A garden of delight',
      },
      {
        id: 2,
        title: 'Pepperoni',
        image: 'pizza2.png',
        price: 0.0042,
        description: 'Spicy treat',
      },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: menuRes });
  });

  // Standard franchises and stores
  await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
    const franchiseRes = {
      franchises
    };
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: franchiseRes });
  });

  // Create a franchise
  await page.route('*/**/api/franchise', async (route) => {
    const newFranchise = {
      id: 5,
      name: 'Pie it Up',
      stores: [],
    };

    franchises.push(newFranchise);

    expect(route.request().method()).toBe('POST');
    await route.fulfill({ json: newFranchise });
  });

  // Order a pizza.
  await page.route('*/**/api/order', async (route) => {
    const method = route.request().method();

    if (method === 'POST') {
      const orderReq = route.request().postDataJSON();
      const orderRes = {
        order: { ...orderReq, id: 23 },
        jwt: 'eyJpYXQ',
      };
      expect(route.request().method()).toBe('POST');
      await route.fulfill({ json: orderRes });
    }

    else if (method === 'GET') {
      expect(route.request().method()).toBe('GET');
      await route.fulfill({ json: { dinerId: 4, orders: [], page: 1 } });
    }

    // Send back "response" from pizza factory for valid JWT token
    await page.route('https://pizza-factory.cs329.click/api/order/verify', async (route) => {

      const response = {
        message: "valid",
        payload: {
          "vendor": {
            "id": "pizzavendor",
            "name": "Pizza Vendor"
          },
          "diner": {
            "id": 3,
            "name": "Pizza Lover",
            "email": "pizzalover@jwt.com"
          },
          "order": {
            "items": [
              {
                "menuId": 1,
                "description": "Veggie",
                "price": 0.0038
              }
            ],
            "storeId": "4",
            "franchiseId": 2,
            "id": 9999
          }
        }
      }

      await route.fulfill({ json: response })
    });

  });

  await page.goto('/');
}

