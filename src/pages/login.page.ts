import { expect, type Locator, type Page } from '@playwright/test';
import { env } from '../config/env';

// Tela de login. Os seletores ficam aqui, não nos steps.
export class PaginaLogin {
  constructor(private readonly page: Page) {}

  get campoEmail(): Locator {
    return this.page.getByTestId('email');
  }

  get campoSenha(): Locator {
    return this.page.getByTestId('password');
  }

  get botaoEntrar(): Locator {
    return this.page.getByTestId('login-submit');
  }

  // Erro de e-mail/senha inválidos (mensagem do servidor).
  get mensagemErro(): Locator {
    return this.page.getByTestId('login-error');
  }

  // Erro de campo obrigatório em branco (validação do formulário).
  erroDoCampo(campo: 'email' | 'password'): Locator {
    return this.page.getByTestId(`${campo}-error`);
  }

  async abrir(): Promise<void> {
    await this.page.goto('/auth/login');
    await expect(this.botaoEntrar).toBeVisible();
  }

  async entrar(email: string = env.cliente.email, senha: string = env.cliente.senha): Promise<void> {
    await this.campoEmail.fill(email);
    await this.campoSenha.fill(senha);
    await this.botaoEntrar.click();
  }

  async enviarFormularioVazio(): Promise<void> {
    await this.botaoEntrar.click();
  }
}
