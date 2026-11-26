import { test, expect } from './fixtures';
import { env } from '../../src/config/env';
import type { RespostaLogin } from '../../src/api/types';

test.describe('API - POST /auth (autenticação)', () => {
  test('devolve token com credenciais válidas', async ({ reservas }) => {
    const resposta = await reservas.login(env.adminApi.usuario, env.adminApi.senha);

    expect(resposta.status()).toBe(200);
    expect(resposta.headers()['content-type']).toContain('application/json');

    const corpo = (await resposta.json()) as RespostaLogin;
    expect(corpo.token).toEqual(expect.any(String));
    expect(corpo.token!.length).toBeGreaterThan(5);
    expect(corpo.reason).toBeUndefined();
  });

  test('recusa senha errada (devolve 200 com motivo no corpo)', async ({ reservas }) => {
    const resposta = await reservas.login(env.adminApi.usuario, env.adminApi.senhaErrada);

    // A API responde 200 mesmo com credencial inválida; a falha vem no corpo.
    // O teste registra o comportamento real em vez de inventar um 401.
    expect(resposta.status()).toBe(200);
    const corpo = (await resposta.json()) as RespostaLogin;
    expect(corpo.reason).toBe('Bad credentials');
    expect(corpo.token).toBeUndefined();
  });

  test('recusa usuário inexistente', async ({ reservas }) => {
    const resposta = await reservas.login('usuario-inexistente', env.adminApi.senhaErrada);

    expect(resposta.status()).toBe(200);
    const corpo = (await resposta.json()) as RespostaLogin;
    expect(corpo.reason).toBe('Bad credentials');
    expect(corpo.token).toBeUndefined();
  });

  test('recusa payload vazio', async ({ reservas }) => {
    const resposta = await reservas.login('', '');

    expect(resposta.status()).toBe(200);
    const corpo = (await resposta.json()) as RespostaLogin;
    expect(corpo.reason).toBe('Bad credentials');
    expect(corpo.token).toBeUndefined();
  });
});
