import { expect, type Locator, type Page } from '@playwright/test';

/** Page Object for /account (customer area shown after a successful login). */
export class AccountPage {
  constructor(private readonly page: Page) {}

  get pageTitle(): Locator {
    return this.page.getByTestId('page-title');
  }

  get userMenuButton(): Locator {
    return this.page.getByTestId('nav-menu');
  }

  get signOutOption(): Locator {
    return this.page.getByTestId('nav-sign-out');
  }

  async openUserMenu(): Promise<void> {
    await this.userMenuButton.click();
  }

  async expectToBeLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/account$/);
    await expect(this.pageTitle).toHaveText('My account');
  }
}
