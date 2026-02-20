import { Page } from '@playwright/test';
import { expect } from 'playwright-test-coverage';
import { Role, User } from '../src/service/pizzaService';

export async function basicInit(page: Page) {
  let loggedInUser: User | undefined;
  let validUsers: Record<string, User> = {
    'a@jwt.com': {
      id: '2',
      name: '常用名字',
      email: 'a@jwt.com',
      password: 'admin',
      roles: [{ role: Role.Admin }]
    },
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
      const registerReq: { name: string, email: string, password: string } = route.request().postDataJSON();
      const registerRes = {
          user: {
            id: 1,
            name: registerReq.name,
            email: registerReq.email,
            roles: [{ role: 'diner' }],
          },
          token: 'abcdef',
        }

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

  await page.route('*/**/api/user/1', async (route) => {
    expect(route.request().method()).toBe('PUT');
    const updateReq = route.request().postDataJSON();
    loggedInUser = { ...loggedInUser, ...updateReq };
    
    await route.fulfill({ json: loggedInUser });

    if (loggedInUser) {
      if (loggedInUser?.email) {
        validUsers[loggedInUser.email] = loggedInUser as User;
      }
      loggedInUser.password = 'diner'
    }
  });

  await page.route('*/**/api/user?page=0&limit=10&name=*', async (route) => {
    expect(route.request().method()).toBe('GET');
    const initalUserList = Object.values(userList).map(u => ({ id: u.id, name: u.name, email: u.email, roles: u.roles }));
    const users = initalUserList.slice(0, 10);
    const more = true;
    await route.fulfill({ json: { users, more } });
  });
  
  await page.route('*/**/api/user?page=1&limit=10&name=*', async (route) => {
    expect(route.request().method()).toBe('GET');
    const initalUserList = Object.values(userList).map(u => ({ id: u.id, name: u.name, email: u.email, roles: u.roles }));
    const users = initalUserList.slice(10, 20);
    const more = true;
    await route.fulfill({ json: { users, more } });
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

const userList: Record<string, User> = {
  // 25 additional users
  'a@jwt.com': {
    id: '1',
    name: '常用名字',
    email: 'a@jwt.com',
    roles: [{ role: Role.Admin }]
  },
  'pizzadiner@jwt.com': {
    id: '2',
    name: 'pizza diner',
    email: 'pizzadiner@jwt.com',
    roles: [{ role: Role.Diner }]
  },
  'testuser@jwt.com': {
    id: '3',
    name: 'Test User',
    email: 'testuser@jwt.com',
    roles: [{ role: Role.Franchisee }, { role: Role.Diner }]
  },
  'alice@jwt.com': {
    id: '4',
    name: 'Alice Smith',
    email: 'alice@jwt.com',
    roles: [{ role: Role.Diner }]
  },
  'bob@jwt.com': {
    id: '5',
    name: 'Bob Johnson',
    email: 'bob@jwt.com',
    roles: [{ role: Role.Diner }]
  },
  'carol@jwt.com': {
    id: '6',
    name: 'Carol Lee',
    email: 'carol@jwt.com',
    roles: [{ role: Role.Diner }]
  },
  'dave@jwt.com': {
    id: '7',
    name: 'Dave Kim',
    email: 'dave@jwt.com',
    roles: [{ role: Role.Diner }]
  },
  'eve@jwt.com': {
    id: '8',
    name: 'Eve Martinez',
    email: 'eve@jwt.com',
    roles: [{ role: Role.Diner }]
  },
  'frank@jwt.com': {
    id: '9',
    name: 'Frank Brown',
    email: 'frank@jwt.com',
    roles: [{ role: Role.Diner }]
  },
  'grace@jwt.com': {
    id: '10',
    name: 'Grace Wilson',
    email: 'grace@jwt.com',
    roles: [{ role: Role.Diner }]
  },
  'henry@jwt.com': {
    id: '11',
    name: 'Henry Clark',
    email: 'henry@jwt.com',
    roles: [{ role: Role.Diner }]
  },
  'irene@jwt.com': {
    id: '12',
    name: 'Irene Lewis',
    email: 'irene@jwt.com',
    roles: [{ role: Role.Diner }]
  },
  'jack@jwt.com': {
    id: '13',
    name: 'Jack Walker',
    email: 'jack@jwt.com',
    roles: [{ role: Role.Diner }]
  },
  'karen@jwt.com': {
    id: '14',
    name: 'Karen Hall',
    email: 'karen@jwt.com',
    roles: [{ role: Role.Diner }]
  },
  'leo@jwt.com': {
    id: '15',
    name: 'Leo Allen',
    email: 'leo@jwt.com',
    roles: [{ role: Role.Diner }]
  },
  'mia@jwt.com': {
    id: '16',
    name: 'Mia Young',
    email: 'mia@jwt.com',
    roles: [{ role: Role.Diner }]
  },
  'nick@jwt.com': {
    id: '17',
    name: 'Nick King',
    email: 'nick@jwt.com',
    roles: [{ role: Role.Diner }]
  },
  'olivia@jwt.com': {
    id: '18',
    name: 'Olivia Wright',
    email: 'olivia@jwt.com',
    roles: [{ role: Role.Diner }]
  },
  'paul@jwt.com': {
    id: '19',
    name: 'Paul Scott',
    email: 'paul@jwt.com',
    roles: [{ role: Role.Diner }]
  },
  'quinn@jwt.com': {
    id: '20',
    name: 'Quinn Green',
    email: 'quinn@jwt.com',
    roles: [{ role: Role.Diner }]
  },
  'rachel@jwt.com': {
    id: '21',
    name: 'Rachel Adams',
    email: 'rachel@jwt.com',
    roles: [{ role: Role.Diner }]
  },
  'sam@jwt.com': {
    id: '22',
    name: 'Sam Nelson',
    email: 'sam@jwt.com',
    roles: [{ role: Role.Diner }]
  },
  'tina@jwt.com': {
    id: '23',
    name: 'Tina Carter',
    email: 'tina@jwt.com',
    roles: [{ role: Role.Diner }]
  },
  'uma@jwt.com': {
    id: '24',
    name: 'Uma Baker',
    email: 'uma@jwt.com',
    roles: [{ role: Role.Diner }]
  },
  'victor@jwt.com': {
    id: '25',
    name: 'Victor Perez',
    email: 'victor@jwt.com',
    roles: [{ role: Role.Diner }]
  },
  'wendy@jwt.com': {
    id: '26',
    name: 'Wendy Rivera',
    email: 'wendy@jwt.com',
    roles: [{ role: Role.Diner }]
  },
  'xander@jwt.com': {
    id: '27',
    name: 'Xander Cox',
    email: 'xander@jwt.com',
    roles: [{ role: Role.Diner }]
  },
  'yara@jwt.com': {
    id: '28',
    name: 'Yara Morgan',
    email: 'yara@jwt.com',
    roles: [{ role: Role.Diner }]
  },
  'pizzalover@jwt.com': {
    id: '29',
    name: 'Pizza Lover',
    email: 'pizzalover@jwt.com',
    roles: [{ role: Role.Diner }]
  }
};
