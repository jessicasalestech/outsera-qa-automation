import { test, expect } from './fixtures';
import { criarReserva, sufixoUnico } from '../../src/api/booking.factory';
import type { IdReserva, Reserva, ReservaCriada } from '../../src/api/types';

// API Restful-booker: status, headers e corpo de cada método,
// com cenários positivos e negativos.

test.describe('API - GET /ping (saúde da API)', () => {
  test('informa que a API está no ar', async ({ reservas }) => {
    const resposta = await reservas.ping();

    expect(resposta.status()).toBe(201);
    expect(await resposta.text()).toBe('Created');
  });
});

test.describe('API - GET /booking', () => {
  test('lista as reservas com id numérico', async ({ reservas }) => {
    const resposta = await reservas.listarReservas();

    expect(resposta.status()).toBe(200);
    expect(resposta.headers()['content-type']).toContain('application/json');

    const corpo = (await resposta.json()) as IdReserva[];
    expect(Array.isArray(corpo)).toBe(true);
    expect(corpo.length).toBeGreaterThan(0);
    expect(corpo[0]).toEqual({ bookingid: expect.any(Number) });
  });

  test('busca uma reserva com o contrato completo', async ({ criarReservaComLimpeza, reservas }) => {
    const dados = criarReserva();
    const id = await criarReservaComLimpeza(dados);

    const resposta = await reservas.buscarReserva(id);

    expect(resposta.status()).toBe(200);
    const corpo = (await resposta.json()) as Reserva;
    expect(corpo).toMatchObject(dados as unknown as Record<string, unknown>);
    expect(typeof corpo.totalprice).toBe('number');
    expect(typeof corpo.depositpaid).toBe('boolean');
    expect(corpo.bookingdates).toEqual(dados.bookingdates);
  });

  test('filtra reservas por nome e sobrenome', async ({ criarReservaComLimpeza, reservas }) => {
    const sufixo = sufixoUnico();
    const id = await criarReservaComLimpeza({ firstname: `Jessica${sufixo}`, lastname: 'Sales' });

    const resposta = await reservas.listarReservas({ firstname: `Jessica${sufixo}`, lastname: 'Sales' });

    expect(resposta.status()).toBe(200);
    const corpo = (await resposta.json()) as IdReserva[];
    expect(corpo.map((item) => item.bookingid)).toContain(id);
  });

  test('devolve 404 para reserva inexistente', async ({ reservas }) => {
    const resposta = await reservas.buscarReserva(999999);

    expect(resposta.status()).toBe(404);
    expect(await resposta.text()).toBe('Not Found');
  });
});

test.describe('API - POST /booking', () => {
  test('cria a reserva e devolve o que foi enviado', async ({ reservas }) => {
    const dados = criarReserva();

    const resposta = await reservas.criar(dados);

    expect(resposta.status()).toBe(200);
    expect(resposta.headers()['content-type']).toContain('application/json');

    const corpo = (await resposta.json()) as ReservaCriada;
    expect(corpo.bookingid).toEqual(expect.any(Number));
    expect(corpo.booking).toEqual(dados);
  });

  test('a reserva criada pode ser lida depois', async ({ criarReservaComLimpeza, reservas }) => {
    const id = await criarReservaComLimpeza({ firstname: 'Ana', additionalneeds: 'Almoço' });

    const resposta = await reservas.buscarReserva(id);

    expect(resposta.status()).toBe(200);
    expect(await resposta.json()).toMatchObject({ firstname: 'Ana', additionalneeds: 'Almoço' });
  });

  test('devolve 500 quando faltam campos obrigatórios (defeito da API)', async ({ reservas }) => {
    // A API não valida o payload e quebra em vez de responder 400.
    // O teste documenta o comportamento atual e serve de alarme se corrigirem.
    const resposta = await reservas.criar({ firstname: 'SóNome' });

    expect(resposta.status()).toBe(500);
  });

  test('devolve 400 para JSON malformado', async ({ reservas, request }) => {
    const resposta = await request.post('/booking', {
      headers: { 'Content-Type': 'application/json' },
      data: '{"firstname":',
    });

    expect(resposta.status()).toBe(400);
  });
});

test.describe('API - PUT /booking/:id', () => {
  test('atualiza a reserva com token válido', async ({ criarReservaComLimpeza, reservas, token }) => {
    const id = await criarReservaComLimpeza({ firstname: 'Antes', totalprice: 100 });
    const atualizada = criarReserva({ firstname: 'Depois', totalprice: 999 });

    const resposta = await reservas.atualizar(id, atualizada, token);

    expect(resposta.status()).toBe(200);
    expect(await resposta.json()).toEqual(atualizada);

    const consulta = await reservas.buscarReserva(id);
    expect(await consulta.json()).toMatchObject({ firstname: 'Depois', totalprice: 999 });
  });

  test('devolve 403 sem token', async ({ criarReservaComLimpeza, reservas }) => {
    const id = await criarReservaComLimpeza();

    const resposta = await reservas.atualizar(id, criarReserva({ firstname: 'Invasor' }));

    expect(resposta.status()).toBe(403);
    expect(await resposta.text()).toBe('Forbidden');
  });

  test('devolve 403 com token inválido', async ({ criarReservaComLimpeza, reservas }) => {
    const id = await criarReservaComLimpeza();

    const resposta = await reservas.atualizar(id, criarReserva({ firstname: 'Invasor' }), 'token-invalido');

    expect(resposta.status()).toBe(403);
  });

  test('devolve 405 para reserva inexistente', async ({ reservas, token }) => {
    const resposta = await reservas.atualizar(999999, criarReserva(), token);

    expect(resposta.status()).toBe(405);
  });
});

test.describe('API - PATCH /booking/:id', () => {
  test('altera somente os campos enviados', async ({ criarReservaComLimpeza, reservas, token }) => {
    const id = await criarReservaComLimpeza({ firstname: 'Original', lastname: 'Sobrenome', totalprice: 150 });

    const resposta = await reservas.atualizarParcial(id, { firstname: 'Alterado' }, token);

    expect(resposta.status()).toBe(200);
    const corpo = (await resposta.json()) as Reserva;
    expect(corpo.firstname).toBe('Alterado');
    expect(corpo.lastname).toBe('Sobrenome');
    expect(corpo.totalprice).toBe(150);
  });

  test('devolve 403 sem token', async ({ criarReservaComLimpeza, reservas }) => {
    const id = await criarReservaComLimpeza();

    const resposta = await reservas.atualizarParcial(id, { firstname: 'Invasor' });

    expect(resposta.status()).toBe(403);
  });
});

test.describe('API - DELETE /booking/:id', () => {
  test('exclui a reserva com token válido', async ({ criarReservaComLimpeza, reservas, token }) => {
    const id = await criarReservaComLimpeza();

    const resposta = await reservas.excluir(id, token);

    expect(resposta.status()).toBe(201);
    expect(await resposta.text()).toBe('Created');

    const consulta = await reservas.buscarReserva(id);
    expect(consulta.status()).toBe(404);
  });

  test('devolve 403 sem token', async ({ criarReservaComLimpeza, reservas }) => {
    const id = await criarReservaComLimpeza();

    const resposta = await reservas.excluir(id);

    expect(resposta.status()).toBe(403);
  });

  test('devolve 405 quando a reserva já foi excluída', async ({ reservas, token }) => {
    const id = await reservas.criarERetornarId(criarReserva());

    expect((await reservas.excluir(id, token)).status()).toBe(201);

    const segundaTentativa = await reservas.excluir(id, token);
    expect(segundaTentativa.status()).toBe(405);
  });
});
