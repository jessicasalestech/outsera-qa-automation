# Guia de apresentação — como explicar o projeto

Documento de apoio para a entrevista/entrega do teste técnico da Outsera.
Ordem sugerida: **publicar no GitHub (10 min) → ensaiar a demo (15 min) → apresentar (6 a 8 min)**.

---

## 1. Publicar no seu GitHub (passo a passo)

O projeto já está pronto dentro de `outsera-qa-automation/`. No seu Mac:

```bash
cd ~/Downloads            # onde você descompactou
cd outsera-qa-automation

# 1. garanta que as dependências e artefatos NÃO vão para o repositório
cat .gitignore            # node_modules, reports, test-results, .env

# 2. valide que tudo roda na SUA máquina antes de publicar
npm ci
npx playwright install chromium
npm run check:targets     # as aplicações demo estão no ar?
npm test                  # API + E2E

# 3. crie o repositório vazio no GitHub: github.com/new
#    nome: outsera-qa-automation   |   visibilidade: Public   |   sem README

# 4. primeiro commit
git init
git add .
git commit -m "feat: API and E2E test automation with Playwright + Cucumber"
git branch -M main
git remote add origin https://github.com/jessicasalestech/outsera-qa-automation.git
git push -u origin main
```

**Checklist pós-push**

- [ ] a aba **Actions** mostra o pipeline `QA Pipeline` rodando e ficando verde;
- [ ] o badge do topo do README está verde (link para `.../actions/workflows/ci.yml`);
- [ ] em cada execução do Actions, os artefatos `api-report` e `e2e-report` estão disponíveis;
- [ ] nenhuma credencial real no repositório (só os dados públicos de demo);
- [ ] `reports/`, `test-results/` e `node_modules/` **não** aparecem no repositório;
- [ ] o README mostra estrutura, versões, dependências, comandos e relatórios (exigência do enunciado).

> Se o pipeline falhar na primeira vez, abra o job, veja o log — provavelmente é indisponibilidade
> momentânea das aplicações demo. Rode de novo (`Re-run jobs`), ou rode `npm run check:targets`
> localmente para confirmar. Isso também é um bom assunto para comentar na entrevista.

### Estrutura de commits sugerida (opcional, mostra organização)

```bash
git commit -m "chore: project setup, TypeScript and Playwright config"
git commit -m "feat(api): Restful-booker client, fixtures and CRUD/auth specs"
git commit -m "feat(e2e): login and checkout features with page objects"
git commit -m "ci: GitHub Actions pipeline with reports and artifacts"
git commit -m "docs: README, test report and presentation guide"
```

---

## 2. Preparação da demo (antes de entrar na call)

1. `npm run check:targets` — se algum alvo estiver fora, avise e mostre o relatório da última execução.
2. `npm run test:api` — deixa o relatório de API fresquinho (~15 s).
3. `npm run test:e2e:ui` — abre o **modo UI** do Playwright: é a melhor vitrine (dá para assistir cada
   passo, ver os steps do Gherkin e reexecutar um cenário clicando).
4. Abra em abas separadas: (a) o repositório no GitHub, (b) a execução verde do Actions com os
   artefatos, (c) o relatório HTML (`npm run report`).

---

## 3. Roteiro da apresentação (6 a 8 minutos)

### 3.1 Abertura — 30 s

> "Entreguei as duas partes obrigatórias: testes de API e testes E2E com Cucumber, mais o desafio de
> CI/CD. Escolhi **um único stack — TypeScript com Playwright** — porque ele resolve as duas camadas
> com um runner, uma configuração e um relatório só. Reduz manutenção e é o que eu já uso no dia a dia."

### 3.2 Estrutura — 1 min

Mostre a árvore do README e diga o papel de cada pasta:

> "`src/pages` são Page Objects; `src/api` é o client HTTP, a fábrica de dados e os tipos do contrato;
> `src/config` centraliza ambiente; `tests/api` e `tests/e2e` são as suítes. Nenhum seletor ou URL
> fica solto dentro dos testes."

### 3.3 API — 2 min

Abra `tests/api/booking.spec.ts` e `src/api/booking.client.ts`.

> "Cobri os quatro métodos: GET, POST, PUT, PATCH e DELETE, sempre validando **status, headers e corpo**.
> Os cenários negativos são: sem token, token inválido, payload com campos faltando, JSON malformado,
> id inexistente e deleção repetida.
> Dois pontos que mostram cuidado: (1) fixtures criam e **apagam** o dado no teardown, então os testes
> são independentes e repetíveis; (2) quando a API responde errado, o teste documenta o comportamento
> real em vez de forçar o que eu gostaria que fosse — por exemplo, POST sem campos obrigatórios devolve
> **500**, e POST /auth com senha errada devolve **200 com `Bad credentials`** no corpo. Isso é achado
> de teste, não falha da automação."

Se pedirem prova: `npm run test:api` ao vivo (22 testes, ~12 s) e clique em `reports/html`.

### 3.4 E2E — 2 min

Abra `tests/e2e/features/checkout.feature` e o `checkout.steps.ts`.

> "O Gherkin descreve o comportamento em linguagem de negócio; o playwright-bdd transpila cada cenário
> para um teste nativo do Playwright — então eu tenho Gherkin **e** auto-wait, trace e relatório do
> Playwright, sem o Cucumber-JS antigo.
> O fluxo positivo é: login → busca produto → carrinho → endereço → cartão → nota fiscal. Nos negativos,
> valido endereço incompleto, número de cartão inválido e **cartão vencido** — cada um com a mensagem
> exata da tela e com o botão de pagamento bloqueado.
> Os steps não têm seletor: eles conversam com Page Objects. É o que o enunciado chamou de boas práticas."

Mostre no modo UI: rode `Complete a purchase with valid data` e comente os passos enquanto acontecem.

### 3.5 CI/CD — 1 min

Abra a aba Actions e um run verde.

> "O pipeline dispara em push e pull request. Dois jobs em paralelo: API e E2E. Cada um gera HTML, JSON
> e JUnit, publica como artefato e escreve um resumo na própria página da execução. Em caso de falha,
> o trace e o vídeo sobem junto — dá para investigar sem reproduzir localmente. O job de carga roda só
> manualmente, para não bater na API pública a cada commit."

### 3.6 Fechamento — 30 s

> "Os pontos que eu destacaria: independência dos testes (fixtures + fábrica de dados), seletores
> estáveis (`data-test`), zero `sleep`, configuração por ambiente, e honestidade nos resultados — os
> defeitos encontrados na aplicação estão documentados no relatório. O que eu faria a seguir: contrato
> com JSON Schema, testes de acessibilidade e o Appium da parte mobile opcional."

---

## 4. Perguntas prováveis (e respostas curtas)

**"Por que não Rest Assured?"**
Rest Assured exigiria JVM + Maven para a camada de API e outro stack para a UI. Com Playwright eu cubro
API e E2E no mesmo projeto, mesma linguagem, um relatório. Se o time já fosse Java, Rest Assured seria
natural — a decisão é de contexto.

**"Por que playwright-bdd e não Cucumber-JS puro?"**
O playwright-bdd mantém o Gherkin e entrega o runner do Playwright: auto-wait, trace, fixtures,
paralelismo e relatório HTML. Com Cucumber-JS eu teria que montar tudo isso à mão.

**"Como você garante que o teste não fica instável (flaky)?"**
Sem `waitForTimeout`; uso web assertions e auto-wait. Seletores por `data-test`. E2E serial (`workers: 1`)
porque a conta demo é compartilhada. Dados criados por teste e removidos no teardown. E retry só no CI,
para não mascarar problema.

**"E se a aplicação demo cair no meio da avaliação?"**
Por isso existe `npm run check:targets` e o relatório com as execuções anteriores. As asserções são
determinísticas; a dependência externa é o único ponto fora do meu controle — e está documentada como
limitação conhecida.

**"Como você escolhe o que automatizar?"**
Fluxos de maior risco e maior repetição: autenticação, CRUD de API e o funil de compra. Casos
exploratórios e de UI visual continuam manuais.

**"O que é o trace?"**
Um pacote com cada ação, snapshot do DOM antes/depois, requests e console. `npx playwright show-trace`
abre uma timeline. É o que uso para investigar falha sem reproduzir.

**"Cadê a parte mobile (Appium)?"**
Era opcional. Preferi entregar o obrigatório com qualidade e justificar o corte do que entregar Appium
mal configurado em um device farm. A camada de API desse app está coberta pela suíte de API.

---

## 5. Se pedirem para você alterar algo ao vivo

Coisas rápidas e seguras de demonstrar:

* **novo cenário negativo de API**: copie um `test(...)` de `booking.spec.ts`, troque o payload e rode
  `npm run test:api -g "nome do teste"`;
* **novo valor de dado**: altere `src/config/env.ts` ou passe `BASE_URL=... npm run test:e2e`;
* **mostrar o trace**: provoque uma falha de propósito (`expect(status).toBe(201)` no lugar de 200) e
  abra `npx playwright show-trace`;
* **mostrar o filtro por tag**: `npm run test:e2e -- --grep @login`.

---

## 6. O que dizer sobre cada arquivo (cola rápida)

| Arquivo | Frase de uma linha |
| --- | --- |
| `playwright.config.ts` | "Dois projetos: `api` e `e2e`; aqui ficam reporters, retries, trace e o `testIdAttribute`." |
| `src/config/env.ts` | "Um único ponto para URL, credenciais e dados de teste, alimentado por `.env`." |
| `src/api/booking.client.ts` | "Client HTTP: as specs falam de comportamento, não de `request.get`." |
| `src/api/booking.factory.ts` | "Payload válido por padrão + overrides; cada teste monta o dado que precisa." |
| `tests/api/fixtures.ts` | "Fixtures injetam o client, o token e o `createBooking` que limpa no teardown." |
| `src/pages/*.page.ts` | "Page Objects: seletores e ações da tela, nada de assert de negócio." |
| `tests/e2e/features/*.feature` | "A regra de negócio legível por qualquer pessoa do time." |
| `tests/e2e/steps/*.ts` | "Steps finos: traduzem o Gherkin em chamadas de Page Object." |
| `.github/workflows/ci.yml` | "Dois jobs em paralelo + um manual de carga; relatórios e evidências como artefatos." |
| `k6/load-test.js` | "Cenário de 500 VUs/5 min só com leitura + smoke com escrita." |
| `docs/RELATORIO-TESTES.md` | "Resultados da execução, achados na aplicação e evidências." |
