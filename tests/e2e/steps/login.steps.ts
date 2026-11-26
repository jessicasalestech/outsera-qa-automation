import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { env } from '../../../src/config/env';
import { test } from '../fixtures';

const { Given, When, Then } = createBdd(test);

Given('I am on the login page', async ({ loginPage }) => {
  await loginPage.open();
});

When('I sign in with my valid credentials', async ({ loginPage }) => {
  await loginPage.signIn(env.customer.email, env.customer.password);
});

When(
  'I sign in with my valid email and the password {string}',
  async ({ loginPage }, password: string) => {
    await loginPage.signIn(env.customer.email, password);
  },
);

When(
  'I sign in with the email {string} and the password {string}',
  async ({ loginPage }, email: string, password: string) => {
    await loginPage.signIn(email, password);
  },
);

When('I submit the login form without filling the fields', async ({ loginPage }) => {
  await loginPage.submitWithoutFilling();
});

Then('I should be on the account page', async ({ page }) => {
  await expect(page).toHaveURL(/\/account$/);
});

Then('I should see the page title {string}', async ({ accountPage }, title: string) => {
  await expect(accountPage.pageTitle).toHaveText(title);
});

Then('I should see the sign out option', async ({ accountPage }) => {
  await accountPage.openUserMenu();
  await expect(accountPage.signOutOption).toBeVisible();
});

Then('I should stay on the login page', async ({ page }) => {
  await expect(page).toHaveURL(/\/auth\/login$/);
});

Then('I should see the login error {string}', async ({ loginPage }, message: string) => {
  await expect(loginPage.errorMessage).toContainText(message);
});

Then('I should see the email error {string}', async ({ loginPage }, message: string) => {
  await expect(loginPage.fieldError('email')).toHaveText(message);
});

Then('I should see the password error {string}', async ({ loginPage }, message: string) => {
  await expect(loginPage.fieldError('password')).toHaveText(message);
});
