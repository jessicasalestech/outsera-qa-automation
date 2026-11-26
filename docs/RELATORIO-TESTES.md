# Relatório de testes — Outsera QA Automation

**Projeto:** outsera-qa-automation
**Analista:** Jessica Sales
**Data da execução:** 26/11/2026
**Ambiente:** local (Node 24 / Windows 11) + GitHub Actions (ubuntu-latest, Node 22)

---

## 1. Resumo

| Suíte | Testes | Passou | Falhou | Duração |
| --- | --- | --- | --- | --- |
| API — Restful-booker | 22 | 22 | 0 | ~12 s |
| E2E — Cucumber + Playwright | 8 cenários | 8 | 0 | ~1 min 40 s |
| **Total** | **30** | **30** | **0** | — |

Relatórios gerados em cada execução:

* `reports/html/index.html` — relatório HTML interativo;
* `reports/results.json` — resultados para consumo automatizado;
* `reports/junit.xml` — formato JUnit para dashboards de CI;
* `test-results/` — evidências de falha (screenshot, vídeo e trace), quando existirem.

---

## 2. Execução da suíte de API

```
> outsera-qa-automation@1.0.0 test:api
> playwright test --project=api

Running 22 tests using 4 workers

  ok  1 [api] › auth.spec.ts › API - POST /auth (authentication) › rejects a wrong password (documented quirk: HTTP 200 + reason)
  ok  2 [api] › auth.spec.ts › API - POST /auth (authentication) › returns a token for valid credentials
  ok  3 [api] › auth.spec.ts › API - POST /auth (authentication) › rejects an unknown user
  ok  4 [api] › auth.spec.ts › API - POST /auth (authentication) › rejects an empty payload (required fields missing)
  ok  5 [api] › booking.spec.ts › API - GET /ping (health check) › reports the API as available
  ok  6 [api] › booking.spec.ts › API - GET /booking › lists bookings with numeric ids
  ok  7 [api] › booking.spec.ts › API - GET /booking › returns a booking with the full contract
  ok  8 [api] › booking.spec.ts › API - GET /booking › filters bookings by firstname and lastname
  ok  9 [api] › booking.spec.ts › API - GET /booking › returns 404 for an unknown booking id
  ok 10 [api] › booking.spec.ts › API - POST /booking › creates a booking and echoes the payload
  ok 11 [api] › booking.spec.ts › API - POST /booking › persists the created booking (read after write)
  ok 12 [api] › booking.spec.ts › API - POST /booking › returns 500 when required fields are missing (documented defect)
  ok 13 [api] › booking.spec.ts › API - POST /booking › returns 400 for a malformed JSON body
  ok 14 [api] › booking.spec.ts › API - PUT /booking/:id › updates a booking with a valid token
  ok 15 [api] › booking.spec.ts › API - PUT /booking/:id › returns 403 without a token
  ok 16 [api] › booking.spec.ts › API - PUT /booking/:id › returns 403 with an invalid token
  ok 17 [api] › booking.spec.ts › API - PUT /booking/:id › returns 405 for an unknown booking id
  ok 18 [api] › booking.spec.ts › API - PATCH /booking/:id › updates only the sent fields
  ok 19 [api] › booking.spec.ts › API - PATCH /booking/:id › returns 403 without a token
  ok 20 [api] › booking.spec.ts › API - DELETE /booking/:id › deletes a booking with a valid token
  ok 21 [api] › booking.spec.ts › API - DELETE /booking/:id › returns 403 without a token
  ok 22 [api] › booking.spec.ts › API - DELETE /booking/:id › returns 405 when the booking was already deleted

  22 passed (11.6s)
```

## 3. Execução da suíte E2E (Gherkin)

```
> outsera-qa-automation@1.0.0 test:e2e
> bddgen && playwright test --project=e2e

Running 8 tests using 1 worker

  ok 1 [e2e] › checkout.feature › Checkout and payment › Complete a purchase with valid data @checkout (20.4s)
  ok 2 [e2e] › checkout.feature › Checkout and payment › Checkout is blocked when the delivery address is incomplete @checkout (9.5s)
  ok 3 [e2e] › checkout.feature › Checkout and payment › Payment is refused when the card number is invalid @checkout (27.9s)
  ok 4 [e2e] › checkout.feature › Checkout and payment › Payment is refused when the card is expired @checkout (27.3s)
  ok 5 [e2e] › login.feature › Customer login › Successful login with valid credentials @login (4.2s)
  ok 6 [e2e] › login.feature › Customer login › Login with a wrong password @login (4.0s)
  ok 7 [e2e] › login.feature › Customer login › Login with an unregistered user @login (3.0s)
  ok 8 [e2e] › login.feature › Customer login › Login with empty required fields @login (2.6s)

  8 passed (1.7m)
```

---

## 4. Achados (bugs / comportamentos documentados)

Todo comportamento abaixo foi encontrado durante a automação e está **coberto por teste** — ou seja,
se o fornecedor corrigir, o teste avisa.

| # | Aplicação | Achado | Severidade | Evidência |
| --- | --- | --- | --- | --- |
| 1 | API Restful-booker | `POST /booking` sem campos obrigatórios devolve **500 Internal Server Error** em vez de 400 (falta de validação de entrada) | Média | `booking.spec.ts` → "returns 500 when required fields are missing" |
| 2 | API Restful-booker | `POST /auth` com credenciais inválidas devolve **HTTP 200** com `{"reason":"Bad credentials"}` no corpo — clientes que checam só o status consideram login válido | Alta | `auth.spec.ts` → "rejects a wrong password" |
| 3 | API Restful-booker | `DELETE` de um booking já removido devolve **405 Method Not Allowed** (o esperado seria 404) | Baixa | `booking.spec.ts` → "returns 405 when the booking was already deleted" |
| 4 | API Restful-booker | `POST /booking` com `Content-Type: text/plain` devolve **500** (tratamento incorreto de mídia não suportada; o esperado seria 415) | Média | análise exploratória (documentada no README) |
| 5 | E-commerce Toolshop | O **postcode lookup** do passo de endereço reescreve rua/cidade/estado e, em algumas respostas, **limpa país e CEP**, deixando o botão "Proceed to checkout" permanentemente desabilitado → bloqueia o checkout | Alta | `checkout.page.ts::fillBillingAddress` contém o contorno e o comentário do defeito |
| 6 | E-commerce Toolshop | Validação de cartão acontece apenas no *blur*/submit: com todos os campos vazios o botão "Check payment" fica **habilitado** e o clique não gera mensagem de erro (falha silenciosa) | Média | análise exploratória; cenários negativos usam cartão inválido/vencido |

---

## 5. Evidências

Imagens em `docs/evidence/`:

| Arquivo | Conteúdo |
| --- | --- |
| `01-login-invalido.png` | mensagem "Invalid email or password" após senha incorreta |
| `02-checkout-sucesso.png` | confirmação do pedido com número de nota fiscal |
| `03-cartao-invalido.png` | bloqueio do pagamento com "Invalid card number format." |
| `04-cartao-vencido.png` | bloqueio do pagamento com "Expiration date must be in the future." |

Para regerar evidências de qualquer falha: rode a suíte e abra `test-results/` (screenshot, vídeo e
trace de cada teste que falhou).

---

## 6. Teste de carga (opcional) — k6

Alvo: API do e-commerce demo (`https://api.practicesoftwaretesting.com`), **somente leitura**
(`GET /products` e `GET /products/{id}`), para não criar dados em um serviço público.

| Cenário | VUs | Duração | Requisições | Falhas HTTP | p95 | Throughput |
| --- | --- | --- | --- | --- | --- | --- |
| smoke | 5 | 20 s | 126 | 0 % | 446 ms | 5,9 req/s |
| carga parcial | 50 | 30 s | 1.512 | 0 % | 1,22 s | 46,3 req/s |

Análise:

* **Sem erros** nos dois patamares: a API sustenta 50 VUs com 0 % de falha e `checks` em 100 %.
* A latência **p95 cresce ~2,7×** (446 ms → 1,22 s) enquanto o throughput cresce ~8×. O crescimento não
  é linear: já há contenção a partir de 50 VUs.
* O endpoint de listagem é o mais caro (`products_list_duration` p95 = 1,24 s contra 1,20 s do detalhe)
  porque devolve a **lista completa paginada com payload grande** (~8 KB por produto). Gargalo provável:
  serialização/tamanho de resposta, não o banco.
* Recomendação: reduzir `per_page` padrão, aplicar cache de curta duração no `GET /products` e considerar
  compressão (gzip/br). O cenário de 500 VUs / 5 min está pronto (`npm run k6:load`) e não foi executado
  contra o serviço público compartilhado por decisão consciente de não sobrecarregar um demo gratuito.

---

## 7. Observações de execução

* A conta demo do e-commerce é compartilhada e o carrinho é mantido no servidor; por isso a suíte E2E
  roda com **1 worker** (determinismo > velocidade).
* As duas aplicações são **demo públicas**: durante a preparação deste projeto houve uma indisponibilidade
  momentânea da API do e-commerce (HTTP 500/401). O script `npm run check:targets` foi criado para
  diagnosticar isso antes da execução; nenhuma falha da suíte foi causada por erro de teste.
* Nenhum dado pessoal ou credencial privada é usado: apenas os dados públicos de demonstração,
  configuráveis por `.env`/GitHub Secrets.
