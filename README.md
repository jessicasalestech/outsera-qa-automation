# Automação de testes — API e E2E

Projeto do teste técnico da Outsera. São duas suítes em TypeScript com Playwright: uma de **API**
(CRUD e autenticação, com cenários positivos e negativos) e uma **E2E em Gherkin**, além do pipeline
de CI no GitHub Actions.

Sites usados (demos públicas, sem dado sensível):

- API: https://restful-booker.herokuapp.com
- Loja: https://practicesoftwaretesting.com

## Tecnologias

| Ferramenta | Versão | Papel |
| --- | --- | --- |
| Node.js | 20.10 ou superior | runtime |
| TypeScript | 7.0 | linguagem |
| Playwright | 1.65 | testes de API e de interface |
| playwright-bdd | 9.2 | Gherkin/Cucumber rodando no Playwright |
| dotenv | 18.0 | leitura do `.env` |
| k6 | 1.x | teste de carga (opcional) |

## Estrutura

```
src/
  config/env.ts          configuração (URLs, dados de teste)
  api/                   cliente HTTP, fábrica de dados e tipos da API
  pages/                 page objects das telas
tests/
  api/                   testes de API + fixtures
  e2e/features/          cenários em Gherkin
  e2e/steps/             implementação dos passos
scripts/                 checagem dos sites e resumo para o CI
k6/load-test.js          teste de carga opcional
docs/                    relatório de execução e evidências
```

## Como rodar

```bash
npm ci
npx playwright install chromium

npm run test:api       # só API
npm run test:e2e       # gera os testes do Gherkin e roda o E2E
npm test               # as duas suítes
npm run report         # abre o relatório HTML
```

Outros comandos úteis:

```bash
npm run test:e2e:ui    # modo UI do Playwright (bom para demonstrar)
npm run check:targets  # confere se os sites estão no ar
npm run typecheck      # checagem de tipos
npm run k6:smoke       # carga leve (5 VUs / 30s)
```

Não precisa de `.env` para rodar: os dados usados são os públicos das demos. Se quiser apontar para
outro ambiente, copie `.env.example` para `.env` e ajuste.

## O que está coberto

API:
- GET `/ping`, listagem, busca por id, filtro por nome e id inexistente (404)
- POST válido, leitura depois da escrita, campos faltando e JSON malformado
- PUT, PATCH e DELETE com token válido, sem token e com token inválido
- `/auth` com credencial válida, senha errada, usuário inexistente e payload vazio

E2E:
- login válido, senha errada, usuário não cadastrado e campos em branco
- compra completa (carrinho, endereço, cartão, nota fiscal)
- endereço incompleto, cartão inválido e cartão vencido

## Relatórios

Cada execução grava `reports/html` (interativo), `reports/results.json` e `reports/junit.xml`.
Quando um teste falha, o Playwright guarda screenshot, vídeo e trace em `test-results/`; o trace abre
com `npx playwright show-trace <arquivo>.zip`.

O resumo da última execução e os pontos encontrados nos sites estão em
[docs/RELATORIO-TESTES.md](docs/RELATORIO-TESTES.md).

## Pipeline

O workflow `.github/workflows/ci.yml` roda em push e pull request para a `main`, com dois jobs em
paralelo (API e E2E). Cada job publica o relatório como artefato e escreve um resumo na página da
execução. O teste de carga só roda quando disparado manualmente, para não sobrecarregar a API pública.

Antes do E2E o próprio pipeline checa se os sites estão acessíveis. A loja demo usa proteção anti-bot e
costuma bloquear IP de servidor; quando isso acontece, o job de E2E é marcado como não executado, com
aviso e explicação no resumo — em vez de aparecer como falha de teste. Na prática: API roda no CI e o
E2E roda na máquina local, que é onde o acesso é liberado.

## Observações

- O checkout da loja tem um problema no passo de endereço: ao consultar o CEP, ele às vezes limpa país
  e CEP e o botão de avançar fica travado. Deixei o tratamento no page object (`checkout.page.ts`), com
  comentário no ponto.
- A API Restful-booker devolve 500 quando falta campo obrigatório e 200 com `Bad credentials` quando a
  senha está errada. Os testes registram esse comportamento real; se corrigirem, eles acusam.
- A parte de mobile com Appium era opcional e não foi feita. Preferi entregar o obrigatório redondo.
- As duas demos são públicas e podem ficar lentas ou fora do ar; por isso existe o `check:targets` e o
  retry só no CI.

## Autora

Jessica Sales — analista de QA
