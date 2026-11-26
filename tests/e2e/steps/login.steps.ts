import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { env } from '../../../src/config/env';
import { test } from '../fixtures';

const { Given, When, Then } = createBdd(test);

Given('que estou na página de login', async ({ login }) => {
  await login.abrir();
});

When('faço login com credenciais válidas', async ({ login }) => {
  await login.entrar(env.cliente.email, env.cliente.senha);
});

When('faço login com meu e-mail e a senha {string}', async ({ login }, senha: string) => {
  await login.entrar(env.cliente.email, senha);
});

When(
  'faço login com o e-mail {string} e a senha {string}',
  async ({ login }, email: string, senha: string) => {
    await login.entrar(email, senha);
  },
);

When('envio o formulário de login sem preencher nada', async ({ login }) => {
  await login.enviarFormularioVazio();
});

Then('devo estar na página da minha conta', async ({ page }) => {
  await expect(page).toHaveURL(/\/account$/);
});

Then('devo ver o título da página {string}', async ({ conta }, titulo: string) => {
  await expect(conta.titulo).toHaveText(titulo);
});

Then('devo ver a opção de sair', async ({ conta }) => {
  await conta.abrirMenuUsuario();
  await expect(conta.opcaoSair).toBeVisible();
});

Then('devo continuar na página de login', async ({ page }) => {
  await expect(page).toHaveURL(/\/auth\/login$/);
});

Then('devo ver o erro de login {string}', async ({ login }, mensagem: string) => {
  await expect(login.mensagemErro).toContainText(mensagem);
});

Then('devo ver o erro do e-mail {string}', async ({ login }, mensagem: string) => {
  await expect(login.erroDoCampo('email')).toHaveText(mensagem);
});

Then('devo ver o erro da senha {string}', async ({ login }, mensagem: string) => {
  await expect(login.erroDoCampo('password')).toHaveText(mensagem);
});
