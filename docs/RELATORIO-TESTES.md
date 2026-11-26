# Relatório de execução

**Projeto:** automação de testes — API e E2E
**Analista:** Jessica Sales
**Data:** 26/11/2026
**Ambiente:** local (Node 24 / Windows 11) e GitHub Actions (ubuntu-latest, Node 22)

## Resultado

| Suíte | Testes | Passaram | Falharam | Tempo |
| --- | --- | --- | --- | --- |
| API (Restful-booker) | 22 | 22 | 0 | ~10 s |
| E2E (Gherkin) | 8 cenários | 8 | 0 | ~2 min |

Total: 30 testes, todos passando.

Relatórios gerados em `reports/html`, `reports/results.json` e `reports/junit.xml`. Em caso de falha,
as evidências (screenshot, vídeo e trace) ficam em `test-results/`.

## Pontos encontrados nos sites testados

| # | Onde | O que acontece | Gravidade |
| --- | --- | --- | --- |
| 1 | API `/booking` | POST sem campos obrigatórios devolve 500 em vez de 400 | média |
| 2 | API `/auth` | Senha errada devolve 200 com `Bad credentials` no corpo (quem olha só o status acha que logou) | alta |
| 3 | API `/booking` | DELETE de reserva já excluída devolve 405 em vez de 404 | baixa |
| 4 | Loja — endereço | A consulta de CEP reescreve rua/cidade/estado e às vezes limpa país e CEP, travando o botão de avançar do checkout | alta |
| 5 | Loja — pagamento | Com todos os campos de cartão vazios o botão "Check payment" fica habilitado e o clique não mostra erro | média |

Todos os pontos acima estão cobertos por teste, então servem de alarme caso os sites sejam corrigidos.

## Evidências

Em `docs/evidence/`:

- `01-login-invalido.png` — mensagem após senha incorreta
- `02-checkout-sucesso.png` — pedido confirmado com número de nota fiscal
- `03-cartao-invalido.png` — bloqueio com número de cartão inválido
- `04-cartao-vencido.png` — bloqueio com cartão vencido
- `k6-smoke-5vus.json` e `k6-load-50vus.json` — resumos do teste de carga

## Teste de carga (opcional)

Alvo: API da loja demo, somente leitura (`GET /products` e `GET /products/{id}`).

| Cenário | VUs | Duração | Requisições | Erros | p95 |
| --- | --- | --- | --- | --- | --- |
| smoke | 5 | 20 s | 126 | 0 % | 446 ms |
| carga parcial | 50 | 30 s | 1.512 | 0 % | 1,22 s |

A latência p95 sobe de 446 ms para 1,22 s quando o volume cresce de 5 para 50 usuários, sem erros.
O endpoint de listagem é o mais pesado porque devolve todos os produtos com descrição completa —
reduzir o `per_page` ou colocar cache deve resolver. O cenário de 500 VUs por 5 minutos está pronto
(`npm run k6:load`), mas não rodei contra o serviço público para não sobrecarregar uma demo gratuita.

## Observações

- A suíte E2E roda com um worker só, porque a conta da demo é compartilhada e o carrinho fica no servidor.
- Durante a preparação a API da loja ficou fora do ar por alguns minutos (erros 401/500). Nenhuma falha
  da suíte foi causada por erro de teste; o script `npm run check:targets` serve para diagnosticar isso.
- Nenhuma credencial privada é usada. Os dados são os públicos de demonstração e podem ser trocados por `.env`.
