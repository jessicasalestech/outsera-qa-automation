import { expect, type APIRequestContext, type APIResponse } from '@playwright/test';
import { env } from '../config/env';
import { buildBooking } from './booking.factory';
import type { AuthResponse, Booking, CreateBookingResponse } from './types';

/**
 * Thin client around the Restful-booker API.
 * Keeping HTTP calls in one place means a change in the API contract is fixed
 * once, and the tests stay readable (they only talk about behaviour).
 */
export class BookingClient {
  constructor(private readonly request: APIRequestContext) {}

  // --- health -------------------------------------------------------------
  ping(): Promise<APIResponse> {
    return this.request.get('/ping');
  }

  // --- read ---------------------------------------------------------------
  listBookings(params: Record<string, string | number> = {}): Promise<APIResponse> {
    return this.request.get('/booking', { params });
  }

  getBooking(id: number | string): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`);
  }

  // --- write --------------------------------------------------------------
  createBooking(booking: Booking | Record<string, unknown> | object): Promise<APIResponse> {
    return this.request.post('/booking', { data: booking });
  }

  updateBooking(id: number, booking: Booking, token?: string): Promise<APIResponse> {
    return this.request.put(`/booking/${id}`, { data: booking, headers: this.authHeaders(token) });
  }

  patchBooking(id: number, patch: Partial<Booking>, token?: string): Promise<APIResponse> {
    return this.request.patch(`/booking/${id}`, { data: patch, headers: this.authHeaders(token) });
  }

  deleteBooking(id: number, token?: string): Promise<APIResponse> {
    return this.request.delete(`/booking/${id}`, { headers: this.authHeaders(token) });
  }

  // --- auth ---------------------------------------------------------------
  authenticate(
    username: string = env.bookerAdmin.username,
    password: string = env.bookerAdmin.password,
  ): Promise<APIResponse> {
    return this.request.post('/auth', { data: { username, password } });
  }

  async authenticateAndGetToken(
    username: string = env.bookerAdmin.username,
    password: string = env.bookerAdmin.password,
  ): Promise<string> {
    const response = await this.authenticate(username, password);
    expect(response.status(), 'POST /auth should authenticate the admin user').toBe(200);
    const body = (await response.json()) as AuthResponse;
    expect(body.token, 'POST /auth should return a token').toBeTruthy();
    return body.token!;
  }

  /** Creates a booking and returns its id, failing the test if the API misbehaves. */
  async createBookingAndGetId(booking: Booking = buildBooking()): Promise<number> {
    const response = await this.createBooking(booking);
    expect(response.status(), 'POST /booking should create a booking').toBe(200);
    const body = (await response.json()) as CreateBookingResponse;
    return body.bookingid;
  }

  private authHeaders(token?: string): Record<string, string> {
    return token ? { Cookie: `token=${token}` } : {};
  }
}
