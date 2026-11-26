import { expect, type Locator, type Page } from '@playwright/test';

// Área do cliente, exibida depois do login.
export class PaginaConta {
  constructor(private readonly page: Page) {}

  get titulo(): Locator {
    return this.page.getByTestId('page-title');
  }

  get botaoMenuUsuario(): Locator {
    return this.page.getByTestId('nav-menu');
  }

  get opcaoSair(): Locator {
    return this.page.getByTestId('nav-sign-out');
  }

  // O menu só abre no clique: a opção "Sign out" fica escondida até então.
  async abrirMenuUsuario(): Promise<void> {
    await this.botaoMenuUsuario.click();
  }

  async validarQueEstaNaConta(): Promise<void> {
    await expect(this.page).toHaveURL(/\/account$/);
    await expect(this.titulo).toHaveText('My account');
  }
}
