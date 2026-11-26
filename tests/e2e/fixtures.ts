import { test as base } from 'playwright-bdd';
import { AccountPage } from '../../src/pages/account.page';
import { CheckoutPage } from '../../src/pages/checkout.page';
import { HomePage } from '../../src/pages/home.page';
import { LoginPage } from '../../src/pages/login.page';
import { ProductPage } from '../../src/pages/product.page';

/**
 * Fixtures shared by the Gherkin steps.
 * playwright-bdd uses this file (declared in the `steps` pattern of
 * playwright.config.ts) as the test instance for the generated specs,
 * so every step gets the page objects ready to use.
 */
type E2EFixtures = {
  loginPage: LoginPage;
  accountPage: AccountPage;
  homePage: HomePage;
  productPage: ProductPage;
  checkoutPage: CheckoutPage;
};

export const test = base.extend<E2EFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  accountPage: async ({ page }, use) => {
    await use(new AccountPage(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
});
