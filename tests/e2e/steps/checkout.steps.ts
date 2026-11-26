import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { env } from '../../../src/config/env';
import { test } from '../fixtures';

const { Given, When, Then } = createBdd(test);

// --- Dado -----------------------------------------------------------------

Given('que estou logado como cliente', async ({ login, page }) => {
  await login.abrir();
  await login.entrar(env.cliente.email, env.cliente.senha);
  await expect(page).toHaveURL(/\/account$/);
});

Given('o produto {string} está no carrinho', async ({ produtos }, nomeProduto: string) => {
  await produtos.abrir();
  await produtos.buscar(nomeProduto);
  await expect(produtos.nomesDosProdutos.first()).toBeVisible();

  await produtos.abrirPrimeiroResultado();
  await expect(produtos.tituloDoProduto).toContainText(nomeProduto);

  await produtos.adicionarAoCarrinho();
  await expect(produtos.quantidadeNoCarrinho).toHaveText('1');
});

// --- Quando ---------------------------------------------------------------

When('inicio o checkout', async ({ checkout }) => {
  await checkout.abrir();
  await checkout.irParaEndereco();
});

When('inicio o checkout com um endereço válido', async ({ checkout }) => {
  await checkout.abrir();
  await checkout.irParaEndereco();
  await checkout.preencherEndereco(env.endereco);
  await checkout.irParaPagamento();
});

When('limpo os campos obrigatórios do endereço', async ({ checkout }) => {
  await checkout.limparCamposObrigatoriosDoEndereco();
});

When('pago com um cartão válido', async ({ checkout }) => {
  await checkout.selecionarCartaoDeCredito();
  await checkout.preencherCartao({
    numero: env.cartao.numeroValido,
    validade: env.cartao.validade,
    cvv: env.cartao.cvv,
    titular: env.cartao.titular,
  });
  await expect(checkout.botaoPagamento).toBeEnabled();
  await checkout.pagar();
});

When('pago com o cartão número {string}', async ({ checkout }, numero: string) => {
  await checkout.selecionarCartaoDeCredito();
  await checkout.preencherCartao({
    numero,
    validade: env.cartao.validade,
    cvv: env.cartao.cvv,
    titular: env.cartao.titular,
  });
});

When(
  'preencho o cartão número {string} com validade {string}',
  async ({ checkout }, numero: string, validade: string) => {
    await checkout.selecionarCartaoDeCredito();
    await checkout.preencherCartao({
      numero,
      validade,
      cvv: env.cartao.cvv,
      titular: env.cartao.titular,
    });
  },
);

When('confirmo o pedido', async ({ checkout }) => {
  await checkout.confirmarPedido();
});

// --- Então ----------------------------------------------------------------

Then('devo ver a mensagem de pagamento aprovado', async ({ checkout }) => {
  await expect(checkout.mensagemPagamentoOk).toHaveText('Payment was successful');
});

Then('devo ver o pedido confirmado com número de nota fiscal', async ({ checkout }) => {
  await expect(checkout.confirmacaoDoPedido).toContainText(/INV-\d+/);
});

Then('o botão de avançar do endereço deve ficar desabilitado', async ({ checkout }) => {
  await expect(checkout.avancarDoEndereco).toBeDisabled();
});

Then('o botão de pagamento deve ficar desabilitado', async ({ checkout }) => {
  await expect(checkout.botaoPagamento).toBeDisabled();
});

Then('devo ver a mensagem de erro {string}', async ({ checkout }, mensagem: string) => {
  await expect(checkout.mensagensDeErro.filter({ hasText: mensagem })).toBeVisible();
});
