import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { env } from '../../../src/config/env';
import { test } from '../fixtures';

const { Given, When, Then } = createBdd(test);

// --- Given ----------------------------------------------------------------

Given('I am logged in as a customer', async ({ loginPage, page }) => {
  await loginPage.open();
  await loginPage.signIn(env.customer.email, env.customer.password);
  await expect(page).toHaveURL(/\/account$/);
});

Given('the product {string} is in my cart', async ({ homePage, productPage }, product: string) => {
  await homePage.open();
  await homePage.searchFor(product);
  await expect(homePage.productNames.first()).toBeVisible();

  await homePage.openFirstProduct();
  await expect(productPage.title).toContainText(product);

  await productPage.addToCart();
  await expect(homePage.cartQuantity).toHaveText('1');
});

// --- When -----------------------------------------------------------------

When('I start the checkout', async ({ checkoutPage }) => {
  await checkoutPage.open();
  await checkoutPage.goToBillingStep();
});

When('I start the checkout with a valid billing address', async ({ checkoutPage }) => {
  await checkoutPage.open();
  await checkoutPage.goToBillingStep();
  await checkoutPage.fillBillingAddress(env.billingAddress);
  await checkoutPage.goToPaymentStep();
});

When('I clear the required address fields', async ({ checkoutPage }) => {
  await checkoutPage.clearRequiredAddressFields();
});

When('I select the credit card payment method', async ({ checkoutPage }) => {
  await checkoutPage.selectCreditCard();
});

When('I pay with a valid credit card', async ({ checkoutPage }) => {
  await checkoutPage.selectCreditCard();
  await checkoutPage.fillCreditCard({
    number: env.payment.validCardNumber,
    expiry: env.payment.validExpiry,
    cvv: env.payment.validCvv,
    holder: env.payment.validHolder,
  });
  await expect(checkoutPage.confirmPaymentButton).toBeEnabled();
  await checkoutPage.pay();
});

When('I pay with the card number {string}', async ({ checkoutPage }, cardNumber: string) => {
  await checkoutPage.selectCreditCard();
  await checkoutPage.fillCreditCard({
    number: cardNumber,
    expiry: env.payment.validExpiry,
    cvv: env.payment.validCvv,
    holder: env.payment.validHolder,
  });
});

When(
  'I fill the credit card with the number {string} and the expiration date {string}',
  async ({ checkoutPage }, cardNumber: string, expiry: string) => {
    await checkoutPage.selectCreditCard();
    await checkoutPage.fillCreditCard({
      number: cardNumber,
      expiry,
      cvv: env.payment.validCvv,
      holder: env.payment.validHolder,
    });
  },
);

When('I confirm the order', async ({ checkoutPage }) => {
  await checkoutPage.confirmOrder();
});

// --- Then -----------------------------------------------------------------

Then('I should see the payment success message', async ({ checkoutPage }) => {
  await expect(checkoutPage.paymentSuccessMessage).toHaveText('Payment was successful');
});

Then('I should see the order confirmation with an invoice number', async ({ checkoutPage }) => {
  await expect(checkoutPage.orderConfirmation).toContainText(/INV-\d+/);
});

Then('the checkout button of the billing step should be disabled', async ({ checkoutPage }) => {
  await expect(checkoutPage.proceedFromBilling).toBeDisabled();
});

Then('the payment button should be disabled', async ({ checkoutPage }) => {
  await expect(checkoutPage.confirmPaymentButton).toBeDisabled();
});

Then('I should see the checkout error {string}', async ({ checkoutPage }, message: string) => {
  await expect(checkoutPage.validationMessages.filter({ hasText: message })).toBeVisible();
});
