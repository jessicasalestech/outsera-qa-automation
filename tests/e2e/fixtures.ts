import { test as base } from 'playwright-bdd';
import { PaginaConta } from '../../src/pages/account.page';
import { PaginaCheckout } from '../../src/pages/checkout.page';
import { PaginaProdutos } from '../../src/pages/home.page';
import { PaginaLogin } from '../../src/pages/login.page';

// Fixtures usadas pelos steps: cada uma entrega a página já pronta.
type FixturesE2E = {
  login: PaginaLogin;
  conta: PaginaConta;
  produtos: PaginaProdutos;
  checkout: PaginaCheckout;
};

export const test = base.extend<FixturesE2E>({
  login: async ({ page }, use) => {
    await use(new PaginaLogin(page));
  },
  conta: async ({ page }, use) => {
    await use(new PaginaConta(page));
  },
  produtos: async ({ page }, use) => {
    await use(new PaginaProdutos(page));
  },
  checkout: async ({ page }, use) => {
    await use(new PaginaCheckout(page));
  },
});
