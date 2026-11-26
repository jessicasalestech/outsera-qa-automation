import { test as base, expect } from '@playwright/test';
import { BookingClient } from '../../src/api/booking.client';
import { buildBooking } from '../../src/api/booking.factory';
import type { Booking } from '../../src/api/types';

/**
 * Custom fixtures keep the tests declarative and make them independent:
 * each test asks for `bookings` (HTTP client), `authToken` (valid admin token)
 * or `createBooking` (creates data and deletes it on teardown).
 */
type ApiFixtures = {
  bookings: BookingClient;
  authToken: string;
  createBooking: (overrides?: Partial<Booking>) => Promise<number>;
};

export const test = base.extend<ApiFixtures>({
  bookings: async ({ request }, use) => {
    await use(new BookingClient(request));
  },

  authToken: async ({ bookings }, use) => {
    const token = await bookings.authenticateAndGetToken();
    await use(token);
  },

  createBooking: async ({ bookings }, use) => {
    const createdIds: number[] = [];

    await use(async (overrides: Partial<Booking> = {}) => {
      const id = await bookings.createBookingAndGetId(buildBooking(overrides));
      createdIds.push(id);
      return id;
    });

    // Test data cleanup: keeps the demo API tidy and the suite repeatable.
    if (createdIds.length > 0) {
      const token = await bookings.authenticateAndGetToken();
      for (const id of createdIds) {
        await bookings.deleteBooking(id, token);
      }
    }
  },
});

export { expect };
