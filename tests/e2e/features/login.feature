@login
Feature: Customer login

  As a customer of the practice e-commerce
  I want to authenticate with my credentials
  So that I can access my account and place orders

  Background:
    Given I am on the login page

  Scenario: Successful login with valid credentials
    When I sign in with my valid credentials
    Then I should be on the account page
    And I should see the page title "My account"
    And I should see the sign out option

  Scenario: Login with a wrong password
    When I sign in with my valid email and the password "wrong-password"
    Then I should stay on the login page
    And I should see the login error "Invalid email or password"

  Scenario: Login with an unregistered user
    When I sign in with the email "ghost.user@example.com" and the password "welcome01"
    Then I should stay on the login page
    And I should see the login error "Invalid email or password"

  Scenario: Login with empty required fields
    When I submit the login form without filling the fields
    Then I should stay on the login page
    And I should see the email error "Email is required"
    And I should see the password error "Password is required"
