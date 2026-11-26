import 'dotenv/config';

/**
 * Single source of truth for environment data.
 * Everything can be overridden through environment variables (local `.env`
 * or GitHub Actions secrets), so no credential is hardcoded in the tests.
 *
 * The default values are public demo data published by the applications
 * used as system under test (they are safe to commit).
 */
export const env = {
  baseUrl: process.env.BASE_URL ?? 'https://practicesoftwaretesting.com',
  apiUrl: process.env.API_URL ?? 'https://restful-booker.herokuapp.com',

  customer: {
    email: process.env.CUSTOMER_EMAIL ?? 'customer@practicesoftwaretesting.com',
    password: process.env.CUSTOMER_PASSWORD ?? 'welcome01',
    wrongPassword: 'wrong-password',
    unknownEmail: 'ghost.user@example.com',
  },

  bookerAdmin: {
    username: process.env.BOOKER_USERNAME ?? 'admin',
    password: process.env.BOOKER_PASSWORD ?? 'password123',
    wrongPassword: 'not-the-password',
  },

  billingAddress: {
    postalCode: process.env.BILLING_POSTAL_CODE ?? '01310-100',
    houseNumber: '100',
    street: 'Av. Paulista',
    city: 'Sao Paulo',
    state: 'SP',
    country: 'Brazil',
  },

  payment: {
    validCardNumber: '4111-1111-1111-1111',
    validExpiry: '12/2030',
    validCvv: '123',
    validHolder: 'Jessica Sales',
    invalidCardNumber: '1234',
  },
} as const;
