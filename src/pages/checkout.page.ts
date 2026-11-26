import { expect, type Locator, type Page } from '@playwright/test';

export interface Endereco {
  cep: string;
  numero: string;
  rua: string;
  cidade: string;
  estado: string;
  pais: string;
}

export interface Cartao {
  numero: string;
  validade: string;
  cvv: string;
  titular: string;
}

// Checkout em 4 etapas: carrinho -> login -> endereço -> pagamento.
export class PaginaCheckout {
  constructor(private readonly page: Page) {}

  get avancarDoCarrinho(): Locator {
    return this.page.getByTestId('proceed-1');
  }

  get avancarDoLogin(): Locator {
    return this.page.getByTestId('proceed-2');
  }

  get avancarDoEndereco(): Locator {
    return this.page.getByTestId('proceed-3');
  }

  get campoCep(): Locator {
    return this.page.getByTestId('postal_code');
  }

  get campoNumero(): Locator {
    return this.page.getByTestId('house_number');
  }

  get campoRua(): Locator {
    return this.page.getByTestId('street');
  }

  get campoCidade(): Locator {
    return this.page.getByTestId('city');
  }

  get campoEstado(): Locator {
    return this.page.getByTestId('state');
  }

  get selectPais(): Locator {
    return this.page.getByTestId('country');
  }

  get selectFormaPagamento(): Locator {
    return this.page.getByTestId('payment-method');
  }

  get campoNumeroCartao(): Locator {
    return this.page.getByTestId('credit_card_number');
  }

  get campoValidade(): Locator {
    return this.page.getByTestId('expiration_date');
  }

  get campoCvv(): Locator {
    return this.page.getByTestId('cvv');
  }

  get campoTitular(): Locator {
    return this.page.getByTestId('card_holder_name');
  }

  get botaoPagamento(): Locator {
    return this.page.getByTestId('finish');
  }

  get mensagemPagamentoOk(): Locator {
    return this.page.getByTestId('payment-success-message');
  }

  get confirmacaoDoPedido(): Locator {
    return this.page.getByText(/Thanks for your order/i);
  }

  // Mensagens de validação do checkout (endereço e cartão).
  get mensagensDeErro(): Locator {
    return this.page.locator('.alert-danger');
  }

  get produtosNoCarrinho(): Locator {
    return this.page.getByTestId('product-title');
  }

  async abrir(): Promise<void> {
    await this.page.goto('/checkout');
    await expect(this.avancarDoCarrinho).toBeVisible();
    // Se o produto não entrou no carrinho, o fluxo não começa: falha aqui com mensagem clara.
    await expect(this.produtosNoCarrinho.first()).toBeVisible();
  }

  async irParaEndereco(): Promise<void> {
    await this.avancarDoCarrinho.click();
    await expect(this.avancarDoLogin).toBeEnabled();
    await this.avancarDoLogin.click();
    await expect(this.campoCep).toBeVisible();
  }

  async preencherEndereco(endereco: Endereco): Promise<void> {
    // A lista de países vem da API: espero ela carregar antes de selecionar.
    await expect
      .poll(async () => this.selectPais.locator('option').count(), { timeout: 20_000 })
      .toBeGreaterThan(1);

    // Ao preencher CEP + número, o site consulta o CEP e reescreve rua/cidade/estado.
    // Em algumas respostas ele também limpa país e CEP, o que trava o botão de avançar.
    // Então preencho, espero a consulta terminar e, se ela atrapalhou, preencho de novo.
    for (let tentativa = 1; tentativa <= 3; tentativa += 1) {
      const consultaCep = this.page
        .waitForResponse((resposta) => resposta.url().includes('postcode-lookup'), { timeout: 10_000 })
        .catch(() => null);

      await this.aplicarEndereco(endereco);
      await consultaCep;

      const liberou = await expect(this.avancarDoEndereco)
        .toBeEnabled({ timeout: 5_000 })
        .then(() => true)
        .catch(() => false);
      if (liberou) {
        return;
      }
    }

    await expect(this.avancarDoEndereco, 'o endereço deveria ser aceito').toBeEnabled();
  }

  async limparCamposObrigatoriosDoEndereco(): Promise<void> {
    await this.campoCep.fill('');
    await this.campoNumero.fill('');
  }

  async irParaPagamento(): Promise<void> {
    await this.avancarDoEndereco.click();
    await expect(this.selectFormaPagamento).toBeVisible();
  }

  async selecionarCartaoDeCredito(): Promise<void> {
    await this.selectFormaPagamento.selectOption({ label: 'Credit Card' });
    await expect(this.campoNumeroCartao).toBeVisible();
  }

  async preencherCartao(cartao: Cartao): Promise<void> {
    await this.campoNumeroCartao.fill(cartao.numero);
    await this.campoValidade.fill(cartao.validade);
    await this.campoCvv.fill(cartao.cvv);
    await this.campoTitular.fill(cartao.titular);
  }

  async pagar(): Promise<void> {
    await this.botaoPagamento.click();
  }

  async confirmarPedido(): Promise<void> {
    // Depois do pagamento o mesmo botão muda o texto para "Confirm". Espero o texto
    // novo para não clicar de novo na ação antiga ("Check payment").
    await expect(this.botaoPagamento).toHaveText(/confirm/i);
    await this.botaoPagamento.click();
    await expect(this.confirmacaoDoPedido).toContainText(/INV-\d+/);
  }

  private async aplicarEndereco(endereco: Endereco): Promise<void> {
    await this.selectPais.selectOption({ label: endereco.pais });
    await this.campoCep.fill(endereco.cep);
    await this.campoNumero.fill(endereco.numero);
    await this.campoRua.fill(endereco.rua);
    await this.campoCidade.fill(endereco.cidade);
    await this.campoEstado.fill(endereco.estado);
  }
}
