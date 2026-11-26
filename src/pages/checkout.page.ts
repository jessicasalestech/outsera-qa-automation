import { expect, type Locator, type Page } from '@playwright/test';

export interface BillingAddress {
  postalCode: string;
  houseNumber: string;
  street: string;
  city: string;
  state: string;
  country: string;
}

export interface CreditCard {
  number: string;
  expiry: string;
  cvv: string;
  holder: string;
}

/**
 * Page Object for /checkout.
 * The checkout is a 4-step wizard: cart -> sign in -> billing address -> payment.
 * Each step has its own "proceed" button (data-test proceed-1/2/3).
 */
export class CheckoutPage {
  constructor(private readonly page: Page) {}

  get proceedFromCart(): Locator {
    return this.page.getByTestId('proceed-1');
  }

  get proceedFromSignIn(): Locator {
    return this.page.getByTestId('proceed-2');
  }

  get proceedFromBilling(): Locator {
    return this.page.getByTestId('proceed-3');
  }

  get postalCodeInput(): Locator {
    return this.page.getByTestId('postal_code');
  }

  get houseNumberInput(): Locator {
    return this.page.getByTestId('house_number');
  }

  get streetInput(): Locator {
    return this.page.getByTestId('street');
  }

  get cityInput(): Locator {
    return this.page.getByTestId('city');
  }

  get stateInput(): Locator {
    return this.page.getByTestId('state');
  }

  get countrySelect(): Locator {
    return this.page.getByTestId('country');
  }

  get paymentMethodSelect(): Locator {
    return this.page.getByTestId('payment-method');
  }

  get cardNumberInput(): Locator {
    return this.page.getByTestId('credit_card_number');
  }

  get cardExpiryInput(): Locator {
    return this.page.getByTestId('expiration_date');
  }

  get cardCvvInput(): Locator {
    return this.page.getByTestId('cvv');
  }

  get cardHolderInput(): Locator {
    return this.page.getByTestId('card_holder_name');
  }

  get confirmPaymentButton(): Locator {
    return this.page.getByTestId('finish');
  }

  get paymentSuccessMessage(): Locator {
    return this.page.getByTestId('payment-success-message');
  }

  get orderConfirmation(): Locator {
    return this.page.getByText(/Thanks for your order/i);
  }

  /** Validation messages rendered by the checkout (address and card errors). */
  get validationMessages(): Locator {
    return this.page.locator('.alert-danger');
  }

  get cartProductTitles(): Locator {
    return this.page.getByTestId('product-title');
  }

  async open(): Promise<void> {
    await this.page.goto('/checkout');
    await expect(this.proceedFromCart).toBeVisible();
    // Guard against a lost "add to cart" click: without a product the wizard cannot start.
    await expect(this.cartProductTitles.first()).toBeVisible();
  }

  async goToBillingStep(): Promise<void> {
    await this.proceedFromCart.click();
    await expect(this.proceedFromSignIn).toBeEnabled();
    await this.proceedFromSignIn.click();
    await expect(this.postalCodeInput).toBeVisible();
  }

  async fillBillingAddress(address: BillingAddress): Promise<void> {
    // The country list is loaded from the API: wait until it is populated.
    await expect
      .poll(async () => this.countrySelect.locator('option').count(), { timeout: 20_000 })
      .toBeGreaterThan(1);

    // Filling postal code + house number triggers an asynchronous postcode lookup
    // that rewrites street/city/state. On some responses the demo also clears the
    // country and the postal code (known defect), which keeps the button disabled.
    // Strategy: apply the values, wait for the lookup, and re-apply if it broke them.
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const lookupFinished = this.page
        .waitForResponse((response) => response.url().includes('postcode-lookup'), { timeout: 10_000 })
        .catch(() => null);

      await this.applyAddressValues(address);
      await lookupFinished;

      const enabled = await expect(this.proceedFromBilling)
        .toBeEnabled({ timeout: 5_000 })
        .then(() => true)
        .catch(() => false);
      if (enabled) {
        return;
      }
    }

    await expect(this.proceedFromBilling, 'billing address should be accepted').toBeEnabled();
  }

  private async applyAddressValues(address: BillingAddress): Promise<void> {
    await this.countrySelect.selectOption({ label: address.country });
    await this.postalCodeInput.fill(address.postalCode);
    await this.houseNumberInput.fill(address.houseNumber);
    await this.streetInput.fill(address.street);
    await this.cityInput.fill(address.city);
    await this.stateInput.fill(address.state);
  }

  async clearRequiredAddressFields(): Promise<void> {
    await this.postalCodeInput.fill('');
    await this.houseNumberInput.fill('');
  }

  async goToPaymentStep(): Promise<void> {
    await this.proceedFromBilling.click();
    await expect(this.paymentMethodSelect).toBeVisible();
  }

  async selectCreditCard(): Promise<void> {
    await this.paymentMethodSelect.selectOption({ label: 'Credit Card' });
    await expect(this.cardNumberInput).toBeVisible();
  }

  async fillCreditCard(card: CreditCard): Promise<void> {
    await this.cardNumberInput.fill(card.number);
    await this.cardExpiryInput.fill(card.expiry);
    await this.cardCvvInput.fill(card.cvv);
    await this.cardHolderInput.fill(card.holder);
  }

  async pay(): Promise<void> {
    await this.confirmPaymentButton.click();
  }

  async confirmOrder(): Promise<void> {
    // After the payment the same button changes its label to "Confirm";
    // waiting for the new label avoids clicking the old "Check payment" handler again.
    await expect(this.confirmPaymentButton).toHaveText(/confirm/i);
    await this.confirmPaymentButton.click();
    await expect(this.orderConfirmation).toContainText(/INV-\d+/);
  }
}
