import { expect, type APIRequestContext, type APIResponse } from '@playwright/test';
import { env } from '../config/env';
import { criarReserva } from './booking.factory';
import type { Reserva, ReservaCriada, RespostaLogin } from './types';

// Cliente HTTP da API. Os testes chamam estes métodos em vez de montar request na mão.
export class ClienteReservas {
  constructor(private readonly request: APIRequestContext) {}

  ping(): Promise<APIResponse> {
    return this.request.get('/ping');
  }

  listarReservas(params: Record<string, string | number> = {}): Promise<APIResponse> {
    return this.request.get('/booking', { params });
  }

  buscarReserva(id: number | string): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`);
  }

  criar(booking: Reserva | Record<string, unknown> | object): Promise<APIResponse> {
    return this.request.post('/booking', { data: booking });
  }

  atualizar(id: number, booking: Reserva, token?: string): Promise<APIResponse> {
    return this.request.put(`/booking/${id}`, { data: booking, headers: this.cabecalhoToken(token) });
  }

  atualizarParcial(id: number, alteracoes: Partial<Reserva>, token?: string): Promise<APIResponse> {
    return this.request.patch(`/booking/${id}`, { data: alteracoes, headers: this.cabecalhoToken(token) });
  }

  excluir(id: number, token?: string): Promise<APIResponse> {
    return this.request.delete(`/booking/${id}`, { headers: this.cabecalhoToken(token) });
  }

  login(usuario: string = env.adminApi.usuario, senha: string = env.adminApi.senha): Promise<APIResponse> {
    return this.request.post('/auth', { data: { username: usuario, password: senha } });
  }

  // Usado pela fixture que precisa de token válido em vários testes.
  async obterToken(usuario: string = env.adminApi.usuario, senha: string = env.adminApi.senha): Promise<string> {
    const resposta = await this.login(usuario, senha);
    expect(resposta.status(), 'POST /auth deveria autenticar').toBe(200);
    const corpo = (await resposta.json()) as RespostaLogin;
    expect(corpo.token, 'POST /auth deveria devolver um token').toBeTruthy();
    return corpo.token!;
  }

  async criarERetornarId(booking: Reserva = criarReserva()): Promise<number> {
    const resposta = await this.criar(booking);
    expect(resposta.status(), 'POST /booking deveria criar a reserva').toBe(200);
    const corpo = (await resposta.json()) as ReservaCriada;
    return corpo.bookingid;
  }

  private cabecalhoToken(token?: string): Record<string, string> {
    return token ? { Cookie: `token=${token}` } : {};
  }
}
