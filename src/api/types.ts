/** Contract types for the Restful-booker API (system under test for the API suite). */

export interface BookingDates {
  checkin: string;
  checkout: string;
}

export interface Booking {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: BookingDates;
  additionalneeds?: string;
}

export interface CreateBookingResponse {
  bookingid: number;
  booking: Booking;
}

export interface BookingIdEntry {
  bookingid: number;
}

export interface AuthResponse {
  token?: string;
  reason?: string;
}
