# Outsera — Automação de Testes (API + E2E)

[![QA Pipeline](https://github.com/jessicasalestech/outsera-qa-automation/actions/workflows/ci.yml/badge.svg)](https://github.com/jessicasalestech/outsera-qa-automation/actions/workflows/ci.yml)

[English](./README.md) · **Português (BR)**

Suíte de testes automatizados do teste técnico da Outsera: **testes de API** (CRUD completo +
autenticação, com cenários positivos e negativos) e **testes E2E escritos em Gherkin/Cucumber**,
tudo em TypeScript com Playwright. O projeto também inclui **pipeline de CI no GitHub Actions** e um
**teste de carga opcional em k6**.

| Suíte | Aplicação sob teste | Ferramenta |
| --- | --- | --- |
| API | [Restful-booker](https://restful-booker.herokuapp.com) (API demo pública) | Playwright `APIRequestContext` |
| E2E | [Practice Software Testing – Toolshop](https://practicesoftwaretesting.com) (e-commerce demo) | Playwright + playwright-bdd (Cucumber/Gherkin) |
| Carga (opcional) | [API do Toolshop](https://api.practicesoftwaretesting.com/products) (somente leitura) | k6 |

---

## 1. Estrutura do projeto

```
outsera-qa-automation/
├── .github/workflows/ci.yml      # pipeline: job de API + job de E2E + job k6 (manual)
├── docs/
│   ├── RELATORIO-TESTES.md       # relatório de execução (resultados, achados, evidências)
│   ├── GUIA-APRESENTACAO.md      # roteiro de como explicar o projeto
│   └── evidence/                 # prints das principais telas
├── k6/load-test.js               # teste de carga opcional (cenário de 500 VUs / 5 min + smoke)
├── scripts/ci-summary.mjs        # resumo Markdown do relatório JSON (GitHub Actions)
├── scripts/check-targets.mjs     # checagem rápida de disponibilidade das aplicações demo
├── src/
│   ├── api/                      # client HTTP, factory de dados, tipos do contrato
│   ├── config/env.ts             # configuração em um único lugar (via .env)
│   └── pages/                    # Page Objects da interface web
├── tests/
│   ├── api/                      # specs de API + fixtures customizadas
│   └── e2e/                      # suite Cucumber (features, steps, fixtures)
├── playwright.config.ts          # dois projetos: api e e2e
├── tsconfig.json
├── .env.example
└── package.json
```

---

## 2. Versões e dependências

| Dependência | Versão |
| --- | --- |
| Node.js | >= 20.10 (validado em 24.x) |
| TypeScript | 7.0 |
| @playwright/test | 1.65 |
| playwright-bdd | 9.2 |
| dotenv | 18.0 |
| k6 (opcional) | 0.5x – 1.x |

Tudo é instalado via npm; não há banco de dados, Docker ou servidor local para configurar.

---

## 3. Instalação

```bash
# 1. clone
git clone https://github.com/jessicasalestech/outsera-qa-automation.git
cd outsera-qa-automation

# 2. dependências
npm ci

# 3. navegador usado no E2E
npx playwright install chromium

# 4. (opcional) configuração local
cp .env.example .env
```

> A suíte roda **sem arquivo `.env`**: os valores padrão são os dados públicos de demonstração das
> aplicações testadas. O `.env` serve para apontar para outro ambiente ou sobrescrever credenciais.

---

## 4. Como executar

| Comando | O que faz |
| --- | --- |
| `npm test` | executa API + E2E |
| `npm run test:api` | suíte de API (22 testes) |
| `npm run test:e2e` | gera os specs BDD (`bddgen`) e executa a suíte Gherkin (8 cenários) |
| `npm run test:e2e:headed` | igual, com o navegador visível |
| `npm run test:e2e:ui` | modo UI do Playwright (ótimo para demonstrar) |
| `npm run report` | abre o relatório HTML da última execução |
| `npm run check:targets` | verifica se as aplicações demo estão no ar antes de rodar |
| `npm run typecheck` | análise estática de TypeScript |
| `npm run k6:smoke` / `npm run k6:load` | teste de carga: smoke (5 VUs/30s) ou completo (500 VUs/5min) |

---

## 5. Cobertura

### 5.1 API — Restful-booker

| Método | Cenário | Esperado |
| --- | --- | --- |
| GET | `/ping` health check | 201 |
| GET | `/booking` listagem | 200, array JSON com ids numéricos |
| GET | `/booking/{id}` contrato completo | 200, tipos validados (number/boolean/datas aninhadas) |
| GET | `/booking?firstname=&lastname=` filtro | 200, retorna o id criado |
| GET | id inexistente | 404 `Not Found` |
| POST | `/booking` payload válido | 200, `bookingid` + payload devolvido |
| POST | escrita seguida de leitura | 200, dado persistido |
| POST | campos obrigatórios ausentes | 500 (defeito documentado) |
| POST | JSON malformado | 400 |
| PUT | `/booking/{id}` com token | 200, corpo atualizado e persistido |
| PUT | sem token / token inválido | 403 `Forbidden` |
| PUT | id inexistente | 405 |
| PATCH | atualização parcial com token | 200, campos não enviados preservados |
| PATCH | sem token | 403 |
| DELETE | `/booking/{id}` com token | 201 e depois 404 no GET |
| DELETE | sem token | 403 |
| DELETE | duas vezes | 201 e depois 405 |
| POST | `/auth` credenciais válidas | 200, token retornado |
| POST | `/auth` senha errada / usuário inexistente / payload vazio | 200 + `Bad credentials` (peculiaridade documentada) |

### 5.2 E2E — cenários Gherkin

`tests/e2e/features/login.feature`

| Cenário | Tipo |
| --- | --- |
| Login com credenciais válidas | positivo |
| Login com senha incorreta | negativo |
| Login com usuário não cadastrado | negativo |
| Login com campos obrigatórios em branco | negativo |

`tests/e2e/features/checkout.feature`

| Cenário | Tipo |
| --- | --- |
| Compra completa com dados válidos (carrinho → endereço → cartão → nota fiscal) | positivo |
| Checkout bloqueado com endereço de entrega incompleto | negativo |
| Pagamento recusado com número de cartão inválido | negativo |
| Pagamento recusado com cartão vencido | negativo |

---

## 6. Relatórios

Cada execução gera três formatos:

| Arquivo | Uso |
| --- | --- |
| `reports/html/index.html` | relatório HTML interativo (abrir com `npm run report`) |
| `reports/results.json` | resultados legíveis por máquina (usado no resumo do CI) |
| `reports/junit.xml` | JUnit, consumido pela maioria dos dashboards de CI |

Em caso de falha o Playwright guarda **screenshot, vídeo e trace** em `test-results/` — o trace abre com
`npx playwright show-trace <arquivo>.zip` e mostra cada passo, snapshot do DOM e chamadas de rede.
O resumo da última execução está em [`docs/RELATORIO-TESTES.md`](./docs/RELATORIO-TESTES.md).

---

## 7. CI/CD

`.github/workflows/ci.yml` roda a cada `push`/`pull_request` na `main` (e manualmente via
`workflow_dispatch`):

```
push / pull request
        │
        ├── job api-tests ──────── npm ci → npm run test:api → resumo + artefatos
        │
        ├── job e2e-tests ──────── npm ci → playwright install chromium → npm run test:e2e
        │
        └── job load-test (manual) ─ k6 smoke → artefato com o resumo
```

* jobs em paralelo; o de API leva ~1 min e o de E2E ~3 min;
* cada job escreve um resumo Markdown na página da execução (`$GITHUB_STEP_SUMMARY`);
* relatórios HTML/JSON/JUnit e evidências de falha são publicados como artefatos (7 dias);
* `concurrency` cancela execuções antigas quando chega um commit novo no mesmo branch.

---

## 8. Decisões de projeto (e por quê)

| Decisão | Motivo |
| --- | --- |
| **Playwright para API e UI** | um runner, uma linguagem e um relatório para as duas camadas — menos setup e menos manutenção |
| **playwright-bdd (Cucumber)** | sintaxe Gherkin exigida no desafio, mas executada pelo runner do Playwright (auto-wait, trace, paralelismo, fixtures) |
| **Page Object Pattern** | seletores da interface em um único lugar; os steps leem como a regra de negócio |
| **Fixtures customizadas** | page objects injetados nos steps; client de API e token injetados nos testes (sem setup duplicado) |
| **Factory de dados** | cada teste cria os próprios dados e apaga no teardown → testes independentes e repetíveis |
| **Seletores `data-test` / roles semânticas** | resistentes a mudanças de layout; sem CSS frágil ou XPath |
| **Sem `waitForTimeout`** | auto-waiting e web assertions do Playwright mantêm a suíte estável e rápida |
| **Configuração por ambiente** | `.env`/secrets definem URLs e credenciais — nada fixo no código, nada secreto versionado |
| **E2E com `workers: 1`** | o site demo compartilha uma conta de cliente e um carrinho no servidor; execução serial evita colisão de estado |
| **Testes negativos assumem o comportamento real** | quando a API devolve `500` por campo ausente, o teste documenta o defeito em vez de escondê-lo |
| **Retry só no CI** | ambientes demo públicos oscilam; o retry fica limitado ao CI e falhas reais continuam aparecendo |

### Escopo

* **Mobile (Appium)** — não implementado. Era opcional e exigiria device farm e build do app, sem ganho
  de sinal neste desafio. A camada de API do app já está coberta pela suíte de API.
* **k6** — o script suporta tanto o cenário pedido (500 VUs / 5 min) quanto um cenário smoke, e é
  **somente leitura** de propósito: `/products` e `/products/{id}` são idempotentes, então o teste pode
  gerar volume sem criar lixo em uma API pública gratuita. Os resultados das validações executadas
  localmente estão em [`docs/RELATORIO-TESTES.md`](./docs/RELATORIO-TESTES.md) (5 VUs e 50 VUs). O cenário
  completo de 500 VUs / 5 min está disponível em `npm run k6:load`, mas não foi executado contra um
  serviço público compartilhado.

### Limitações conhecidas

* A suíte depende de duas **aplicações demo públicas**. Normalmente estão saudáveis, mas não estão sob
  nosso controle (podem ficar lentas ou fora do ar). Se uma execução falhar em navegação/timeout,
  verifique antes a disponibilidade dos alvos (`npm run check:targets`) — as asserções são determinísticas.
* O e-commerce demo grava o endereço de cobrança no perfil do cliente; os testes sempre preenchem o
  endereço explicitamente, então são imunes a essa persistência.

---

## 9. Autoria

**Jessica Sales** — Analista de QA
[github.com/jessicasalestech](https://github.com/jessicasalestech)

Projeto entregue como parte prática do teste técnico da Outsera.
