import { expect, type Locator, type Page } from '@playwright/test';

/** Page Object for the product detail page (reached from the listing). */
export class ProductPage {
  constructor(private readonly page: Page) {}

  get title(): Locator {
    return this.page.locator('h1');
  }

  get addToCartButton(): Locator {
    return this.page.getByTestId('add-to-cart');
  }

  get addedToCartToast(): Locator {
    return this.page.getByRole('alert').filter({ hasText: 'Product added to shopping cart' });
  }

  get cartQuantity(): Locator {
    return this.page.getByTestId('cart-quantity');
  }

  async addToCart(): Promise<void> {
    await expect(this.addToCartButton).toBeEnabled();

    // The listing is a single-page app: a click sent before Angular hydrates is lost.
    // The reliable success signal is the cart counter in the header (the toast is transient).
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      await this.addToCartButton.click();
      const added = await this.cartQuantity
        .first()
        .waitFor({ state: 'visible', timeout: 5_000 })
        .then(() => true)
        .catch(() => false);
      if (added) {
        return;
      }
    }

    await expect(this.cartQuantity.first()).toBeVisible();
  }
}
