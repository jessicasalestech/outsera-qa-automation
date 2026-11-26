import { expect, type Locator, type Page } from '@playwright/test';

// Listagem de produtos e página de detalhe do produto.
export class PaginaProdutos {
  constructor(private readonly page: Page) {}

  get campoBusca(): Locator {
    return this.page.getByTestId('search-query');
  }

  get botaoBuscar(): Locator {
    return this.page.getByTestId('search-submit');
  }

  get nomesDosProdutos(): Locator {
    return this.page.getByTestId('product-name');
  }

  get quantidadeNoCarrinho(): Locator {
    return this.page.getByTestId('cart-quantity');
  }

  get tituloDoProduto(): Locator {
    return this.page.locator('h1');
  }

  get botaoAdicionarAoCarrinho(): Locator {
    return this.page.getByTestId('add-to-cart');
  }

  get avisoAdicionado(): Locator {
    return this.page.getByRole('alert').filter({ hasText: 'Product added to shopping cart' });
  }

  async abrir(): Promise<void> {
    await this.page.goto('/');
    await expect(this.nomesDosProdutos.first()).toBeVisible();
  }

  async buscar(termo: string): Promise<void> {
    await this.campoBusca.fill(termo);
    await this.botaoBuscar.click();
  }

  async abrirPrimeiroResultado(): Promise<void> {
    await this.nomesDosProdutos.first().click();
    await expect(this.page).toHaveURL(/\/product\//);
  }

  async adicionarAoCarrinho(): Promise<void> {
    await expect(this.botaoAdicionarAoCarrinho).toBeEnabled();

    // É uma SPA: se o clique acontecer antes do Angular "acordar", ele se perde.
    // Por isso repito a ação conferindo o contador do carrinho, que é permanente.
    for (let tentativa = 1; tentativa <= 3; tentativa += 1) {
      await this.botaoAdicionarAoCarrinho.click();
      const adicionou = await this.quantidadeNoCarrinho
        .first()
        .waitFor({ state: 'visible', timeout: 5_000 })
        .then(() => true)
        .catch(() => false);
      if (adicionou) {
        return;
      }
    }

    await expect(this.quantidadeNoCarrinho.first()).toBeVisible();
  }
}
