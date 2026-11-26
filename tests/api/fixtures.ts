import { test as base, expect } from '@playwright/test';
import { ClienteReservas } from '../../src/api/booking.client';
import { criarReserva } from '../../src/api/booking.factory';
import type { Reserva } from '../../src/api/types';

// Fixtures da suíte de API: cliente HTTP, token e criação de reserva com limpeza.
type FixturesApi = {
  reservas: ClienteReservas;
  token: string;
  criarReservaComLimpeza: (alteracoes?: Partial<Reserva>) => Promise<number>;
};

export const test = base.extend<FixturesApi>({
  reservas: async ({ request }, use) => {
    await use(new ClienteReservas(request));
  },

  token: async ({ reservas }, use) => {
    await use(await reservas.obterToken());
  },

  criarReservaComLimpeza: async ({ reservas }, use) => {
    const criadas: number[] = [];

    await use(async (alteracoes: Partial<Reserva> = {}) => {
      const id = await reservas.criarERetornarId(criarReserva(alteracoes));
      criadas.push(id);
      return id;
    });

    // Apaga o que o teste criou, para a API demo não acumular lixo.
    if (criadas.length > 0) {
      const token = await reservas.obterToken();
      for (const id of criadas) {
        await reservas.excluir(id, token);
      }
    }
  },
});

export { expect };
