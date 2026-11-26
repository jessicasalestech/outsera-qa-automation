// Tipos do contrato da API Restful-booker.

export interface DatasReserva {
  checkin: string;
  checkout: string;
}

export interface Reserva {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: DatasReserva;
  additionalneeds?: string;
}

export interface ReservaCriada {
  bookingid: number;
  booking: Reserva;
}

export interface IdReserva {
  bookingid: number;
}

export interface RespostaLogin {
  token?: string;
  reason?: string;
}
