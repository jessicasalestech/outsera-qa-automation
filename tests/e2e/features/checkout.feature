@checkout
Feature: Checkout and payment

  As a logged-in customer
  I want to buy a product and pay with a credit card
  So that I can complete an order from cart to confirmation

  Background:
    Given I am logged in as a customer
    And the product "Pliers" is in my cart

  Scenario: Complete a purchase with valid data
    When I start the checkout with a valid billing address
    And I pay with a valid credit card
    Then I should see the payment success message
    When I confirm the order
    Then I should see the order confirmation with an invoice number

  Scenario: Checkout is blocked when the delivery address is incomplete
    When I start the checkout
    And I clear the required address fields
    Then the checkout button of the billing step should be disabled

  Scenario: Payment is refused when the card number is invalid
    When I start the checkout with a valid billing address
    And I pay with the card number "1234"
    Then I should see the checkout error "Invalid card number format"
    And the payment button should be disabled

  Scenario: Payment is refused when the card is expired
    When I start the checkout with a valid billing address
    And I fill the credit card with the number "4111-1111-1111-1111" and the expiration date "01/2020"
    Then I should see the checkout error "Expiration date must be in the future"
    And the payment button should be disabled
