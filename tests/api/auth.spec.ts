import { test, expect } from './fixtures';
import { env } from '../../src/config/env';
import type { AuthResponse } from '../../src/api/types';

test.describe('API - POST /auth (authentication)', () => {
  test('returns a token for valid credentials', async ({ bookings }) => {
    const response = await bookings.authenticate(env.bookerAdmin.username, env.bookerAdmin.password);

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const body = (await response.json()) as AuthResponse;
    expect(body.token).toEqual(expect.any(String));
    expect(body.token!.length).toBeGreaterThan(5);
    expect(body.reason).toBeUndefined();
  });

  test('rejects a wrong password (documented quirk: HTTP 200 + reason)', async ({ bookings }) => {
    const response = await bookings.authenticate(env.bookerAdmin.username, env.bookerAdmin.wrongPassword);

    // Restful-booker answers 200 for bad credentials; the failure is in the body.
    // The test documents the real contract instead of inventing a 401.
    expect(response.status()).toBe(200);
    const body = (await response.json()) as AuthResponse;
    expect(body.reason).toBe('Bad credentials');
    expect(body.token).toBeUndefined();
  });

  test('rejects an unknown user', async ({ bookings }) => {
    const response = await bookings.authenticate('unknown-user', env.bookerAdmin.wrongPassword);

    expect(response.status()).toBe(200);
    const body = (await response.json()) as AuthResponse;
    expect(body.reason).toBe('Bad credentials');
    expect(body.token).toBeUndefined();
  });

  test('rejects an empty payload (required fields missing)', async ({ bookings }) => {
    const response = await bookings.authenticate('', '');

    expect(response.status()).toBe(200);
    const body = (await response.json()) as AuthResponse;
    expect(body.reason).toBe('Bad credentials');
    expect(body.token).toBeUndefined();
  });
});
