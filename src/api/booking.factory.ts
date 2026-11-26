import type { Reserva } from './types';

// Monta uma reserva válida. Cada teste pode sobrescrever só o que interessa.
export const criarReserva = (alteracoes: Partial<Reserva> = {}): Reserva => ({
  firstname: 'Jessica',
  lastname: 'Sales',
  totalprice: 250,
  depositpaid: true,
  bookingdates: {
    checkin: '2026-12-01',
    checkout: '2026-12-05',
  },
  additionalneeds: 'Café da manhã',
  ...alteracoes,
});

// Sufixo para achar a reserva criada em uma execução específica (filtro por nome).
export const sufixoUnico = (): string => String(Date.now()).slice(-6);
