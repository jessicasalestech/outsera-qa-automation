import { expect, type Locator, type Page } from '@playwright/test';
import { env } from '../config/env';

/**
 * Page Object for /auth/login.
 * Locators live here only: if the UI changes, the change is fixed in one place.
 */
export class LoginPage {
  constructor(private readonly page: Page) {}

  get emailInput(): Locator {
    return this.page.getByTestId('email');
  }

  get passwordInput(): Locator {
    return this.page.getByTestId('password');
  }

  get submitButton(): Locator {
    return this.page.getByTestId('login-submit');
  }

  get errorMessage(): Locator {
    return this.page.getByTestId('login-error');
  }

  /** Inline validation message of a required field (empty form submit). */
  fieldError(field: 'email' | 'password'): Locator {
    return this.page.getByTestId(`${field}-error`);
  }

  async open(): Promise<void> {
    await this.page.goto('/auth/login');
    await expect(this.submitButton).toBeVisible();
  }

  async signIn(email: string = env.customer.email, password: string = env.customer.password): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async submitWithoutFilling(): Promise<void> {
    await this.submitButton.click();
  }
}
