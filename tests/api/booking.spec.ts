import { test, expect } from './fixtures';
import { buildBooking, uniqueSuffix } from '../../src/api/booking.factory';
import type { Booking, BookingIdEntry, CreateBookingResponse } from '../../src/api/types';

/**
 * API suite - Restful-booker (https://restful-booker.herokuapp.com)
 *
 * Coverage per HTTP method: status code, headers and body,
 * with positive and negative scenarios (no auth, invalid auth,
 * missing payload, unknown id, malformed JSON).
 */

test.describe('API - GET /ping (health check)', () => {
  test('reports the API as available', async ({ bookings }) => {
    const response = await bookings.ping();

    expect(response.status()).toBe(201);
    expect(await response.text()).toBe('Created');
  });
});

test.describe('API - GET /booking', () => {
  test('lists bookings with numeric ids', async ({ bookings }) => {
    const response = await bookings.listBookings();

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const body = (await response.json()) as BookingIdEntry[];
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    expect(body[0]).toEqual({ bookingid: expect.any(Number) });
  });

  test('returns a booking with the full contract', async ({ createBooking, bookings }) => {
    const payload = buildBooking();
    const id = await createBooking(payload);

    const response = await bookings.getBooking(id);

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const body = (await response.json()) as Booking;
    expect(body).toMatchObject(payload as unknown as Record<string, unknown>);
    expect(body.totalprice).toBe(payload.totalprice); // number, not string
    expect(body.depositpaid).toBe(true); // boolean, not "true"
    expect(body.bookingdates).toEqual(payload.bookingdates);
  });

  test('filters bookings by firstname and lastname', async ({ createBooking, bookings }) => {
    const suffix = uniqueSuffix();
    const id = await createBooking({ firstname: `Jessica${suffix}`, lastname: 'Sales' });

    const response = await bookings.listBookings({ firstname: `Jessica${suffix}`, lastname: 'Sales' });

    expect(response.status()).toBe(200);
    const body = (await response.json()) as BookingIdEntry[];
    expect(body.map((item) => item.bookingid)).toContain(id);
  });

  test('returns 404 for an unknown booking id', async ({ bookings }) => {
    const response = await bookings.getBooking(999999);

    expect(response.status()).toBe(404);
    expect(await response.text()).toBe('Not Found');
  });
});

test.describe('API - POST /booking', () => {
  test('creates a booking and echoes the payload', async ({ bookings }) => {
    const payload = buildBooking();

    const response = await bookings.createBooking(payload);

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const body = (await response.json()) as CreateBookingResponse;
    expect(body.bookingid).toEqual(expect.any(Number));
    expect(body.booking).toEqual(payload);
  });

  test('persists the created booking (read after write)', async ({ createBooking, bookings }) => {
    const payload = buildBooking({ firstname: 'Ana', additionalneeds: 'Lunch' });
    const id = await createBooking(payload);

    const response = await bookings.getBooking(id);

    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({ firstname: 'Ana', additionalneeds: 'Lunch' });
  });

  test('returns 500 when required fields are missing (documented defect)', async ({ bookings }) => {
    // The API does not validate the payload: it breaks instead of answering 400.
    // The test documents the real behaviour and works as a regression alarm.
    const response = await bookings.createBooking({ firstname: 'OnlyName' });

    expect(response.status()).toBe(500);
  });

  test('returns 400 for a malformed JSON body', async ({ bookings, request }) => {
    const response = await request.post('/booking', {
      headers: { 'Content-Type': 'application/json' },
      data: '{"firstname":',
    });

    expect(response.status()).toBe(400);
  });
});

test.describe('API - PUT /booking/:id', () => {
  test('updates a booking with a valid token', async ({ createBooking, bookings, authToken }) => {
    const id = await createBooking({ firstname: 'Before', totalprice: 100 });
    const updated = buildBooking({ firstname: 'After', totalprice: 999 });

    const response = await bookings.updateBooking(id, updated, authToken);

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(updated);

    const persisted = await bookings.getBooking(id);
    expect(await persisted.json()).toMatchObject({ firstname: 'After', totalprice: 999 });
  });

  test('returns 403 without a token', async ({ createBooking, bookings }) => {
    const id = await createBooking();

    const response = await bookings.updateBooking(id, buildBooking({ firstname: 'Hacker' }));

    expect(response.status()).toBe(403);
    expect(await response.text()).toBe('Forbidden');
  });

  test('returns 403 with an invalid token', async ({ createBooking, bookings }) => {
    const id = await createBooking();

    const response = await bookings.updateBooking(id, buildBooking({ firstname: 'Hacker' }), 'invalid-token');

    expect(response.status()).toBe(403);
  });

  test('returns 405 for an unknown booking id', async ({ bookings, authToken }) => {
    const response = await bookings.updateBooking(999999, buildBooking(), authToken);

    expect(response.status()).toBe(405);
  });
});

test.describe('API - PATCH /booking/:id', () => {
  test('updates only the sent fields', async ({ createBooking, bookings, authToken }) => {
    const id = await createBooking({ firstname: 'Original', lastname: 'Surname', totalprice: 150 });

    const response = await bookings.patchBooking(id, { firstname: 'Patched' }, authToken);

    expect(response.status()).toBe(200);
    const body = (await response.json()) as Booking;
    expect(body.firstname).toBe('Patched');
    expect(body.lastname).toBe('Surname'); // untouched
    expect(body.totalprice).toBe(150); // untouched
  });

  test('returns 403 without a token', async ({ createBooking, bookings }) => {
    const id = await createBooking();

    const response = await bookings.patchBooking(id, { firstname: 'Hacker' });

    expect(response.status()).toBe(403);
  });
});

test.describe('API - DELETE /booking/:id', () => {
  test('deletes a booking with a valid token', async ({ createBooking, bookings, authToken }) => {
    const id = await createBooking();

    const response = await bookings.deleteBooking(id, authToken);

    expect(response.status()).toBe(201);
    expect(await response.text()).toBe('Created');

    const afterDelete = await bookings.getBooking(id);
    expect(afterDelete.status()).toBe(404);
  });

  test('returns 403 without a token', async ({ createBooking, bookings }) => {
    const id = await createBooking();

    const response = await bookings.deleteBooking(id);

    expect(response.status()).toBe(403);
  });

  test('returns 405 when the booking was already deleted', async ({ bookings, authToken }) => {
    const payload = buildBooking();
    const id = await bookings.createBookingAndGetId(payload);

    expect((await bookings.deleteBooking(id, authToken)).status()).toBe(201);

    const secondAttempt = await bookings.deleteBooking(id, authToken);
    expect(secondAttempt.status()).toBe(405);
  });
});
