import type { Booking } from './types';

/**
 * Test data factory.
 * Every call returns a valid, independent booking payload, so tests never
 * depend on data created by another test.
 */
export const buildBooking = (overrides: Partial<Booking> = {}): Booking => ({
  firstname: 'Jessica',
  lastname: 'Sales',
  totalprice: 250,
  depositpaid: true,
  bookingdates: {
    checkin: '2026-12-01',
    checkout: '2026-12-05',
  },
  additionalneeds: 'Breakfast',
  ...overrides,
});

/** Adds a timestamp suffix, useful to search for a booking created in a given run. */
export const uniqueSuffix = (): string => String(Date.now()).slice(-6);
