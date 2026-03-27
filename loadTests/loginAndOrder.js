import { sleep, check, fail } from 'k6'
import http from 'k6/http'
import jsonpath from 'https://jslib.k6.io/jsonpath/1.0.2/index.js'

export const options = {
  cloud: {
    distribution: { 'amazon:sg:singapore': { loadZone: 'amazon:sg:singapore', percent: 100 } },
    apm: [],
  },
  thresholds: {},
  scenarios: {
    Login_and_Purchase: {
      executor: 'ramping-vus',
      gracefulStop: '30s',
      stages: [
        { target: 20, duration: '10s' },
        { target: 50, duration: '30s' },
        { target: 30, duration: '10s' },
        { target: 0, duration: '10s' },
      ],
      gracefulRampDown: '30s',
      exec: 'login_and_Purchase',
    },
  },
}

export function login_and_Purchase() {
  let response

  const vars = {}

  // Login
  response = http.put(
    'https://pizza-service.alexevans.click/api/auth',
    '{"email":"d@jwt.com","password":"diner"}',
    {
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.5',
        'content-type': 'application/json',
        origin: 'https://pizza.alexevans.click',
        priority: 'u=1, i',
        'sec-ch-ua': '"Chromium";v="146", "Not-A.Brand";v="24", "Brave";v="146"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'sec-gpc': '1',
      },
    }
  )
  if (!check(response, { '200': response => response.status.toString() === '200' })) {
	  console.log(response.body);
    fail('Login was *not* 200');
  } else {
    console.log('User login succeeded')
  }

  console.log(response.json())
  vars['token'] = jsonpath.query(response.json(), '$.token')[0]

  sleep(3)

  // Get Menu
  response = http.get('https://pizza-service.alexevans.click/api/order/menu', {
    headers: {
      accept: '*/*',
      'accept-encoding': 'gzip, deflate, br, zstd',
      'accept-language': 'en-US,en;q=0.5',
      authorization: `Bearer ${vars['token']}`,
      'content-type': 'application/json',
      origin: 'https://pizza.alexevans.click',
      priority: 'u=1, i',
      'sec-ch-ua': '"Chromium";v="146", "Not-A.Brand";v="24", "Brave";v="146"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
      'sec-gpc': '1',
    },
  })

  vars['title1'] = jsonpath.query(response.json(), '$[4].title')[0]

  // Get Franchise
  response = http.get(
    'https://pizza-service.alexevans.click/api/franchise?page=0&limit=20&name=*',
    {
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.5',
        authorization: `Bearer ${vars['token']}`,
        'content-type': 'application/json',
        origin: 'https://pizza.alexevans.click',
        priority: 'u=1, i',
        'sec-ch-ua': '"Chromium";v="146", "Not-A.Brand";v="24", "Brave";v="146"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'sec-gpc': '1',
      },
    }
  )
  sleep(5)

  // Get User
  response = http.get('https://pizza-service.alexevans.click/api/user/me', {
    headers: {
      accept: '*/*',
      'accept-encoding': 'gzip, deflate, br, zstd',
      'accept-language': 'en-US,en;q=0.5',
      authorization: `Bearer ${vars['token']}`,
      'content-type': 'application/json',
      origin: 'https://pizza.alexevans.click',
      priority: 'u=1, i',
      'sec-ch-ua': '"Chromium";v="146", "Not-A.Brand";v="24", "Brave";v="146"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
      'sec-gpc': '1',
    },
  })
  sleep(2.4)

  // Buy Pizzas
  response = http.post(
    'https://pizza-service.alexevans.click/api/order',
    `{
      "items": [
        {
          "menuId": 1,
          "description": "Veggie",
          "price": 0.0038
        },
        {
          "menuId": 2,
          "description": "Pepperoni",
          "price": 0.0042
        },
        {
          "menuId": 4,
          "description": "Crusty",
          "price": 0.0028
        },
        {
          "menuId": 4,
          "description": "Crusty",
          "price": 0.0028
        },
        {
          "menuId": 5,
          "description": "${vars['title1']}",
          "price": 0.0099
        }
      ],
      "storeId": 1,
      "franchiseId": 1
    }`,
    {
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.5',
        authorization: `Bearer ${vars['token']}`,
        'content-type': 'application/json',
        origin: 'https://pizza.alexevans.click',
        priority: 'u=1, i',
        'sec-ch-ua': '"Chromium";v="146", "Not-A.Brand";v="24", "Brave";v="146"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'sec-gpc': '1',
      },
    }
  )

  console.log(response.json())
  vars['jwt'] = jsonpath.query(response.json(), '$.jwt')[0]
  console.log(vars['jwt'])


  if (!check(response, { '200': response => response.status.toString() === '200' })) {
	  console.log(response.body);
    fail('Login was *not* 200');
  } else {
    console.log('Pizza purchase succeeded')
  }



  sleep(7.1)

  // Verify Pizzas
  response = http.post(
    'https://pizza-factory.cs329.click/api/order/verify',
    `{"jwt":"${vars['jwt']}"}`,
    {
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.5',
        authorization: `Bearer ${vars['token']}`,
        'content-type': 'application/json',
        origin: 'https://pizza.alexevans.click',
        priority: 'u=1, i',
        'sec-ch-ua': '"Chromium";v="146", "Not-A.Brand";v="24", "Brave";v="146"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
        'sec-fetch-storage-access': 'none',
        'sec-gpc': '1',
      },
    }
  )
}
