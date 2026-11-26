import { expect, type Locator, type Page } from '@playwright/test';

/** Page Object for the product listing (home) page. */
export class HomePage {
  constructor(private readonly page: Page) {}

  get searchInput(): Locator {
    return this.page.getByTestId('search-query');
  }

  get searchButton(): Locator {
    return this.page.getByTestId('search-submit');
  }

  get productNames(): Locator {
    return this.page.getByTestId('product-name');
  }

  get cartQuantity(): Locator {
    return this.page.getByTestId('cart-quantity');
  }

  async open(): Promise<void> {
    await this.page.goto('/');
    await expect(this.productNames.first()).toBeVisible();
  }

  async searchFor(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchButton.click();
  }

  /** Opens the first result of the current listing. */
  async openFirstProduct(): Promise<void> {
    await this.productNames.first().click();
    await expect(this.page).toHaveURL(/\/product\//);
  }

  async openCart(): Promise<void> {
    await this.page.getByTestId('nav-cart').click();
  }
}
