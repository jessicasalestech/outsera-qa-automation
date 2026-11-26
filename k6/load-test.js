/**
 * Teste de carga (desafio opcional) com k6.
 *
 * Alvo: API da loja demo (https://api.practicesoftwaretesting.com).
 * Só leitura de propósito: /products e /products/{id} não alteram nada,
 * então dá para gerar volume sem criar lixo em um serviço público gratuito.
 *
 * Cenários (escolha com SCENARIO):
 *   smoke (padrão): 5 VUs por 30s   - valida o script e serve de baseline
 *   load          : 500 VUs por 5min - cenário pedido no desafio
 *
 * Como rodar:
 *   k6 run -e SCENARIO=smoke k6/load-test.js
 *   k6 run -e SCENARIO=load --summary-export=reports/k6-summary.json k6/load-test.js
 *
 * Variáveis opcionais: LOAD_API_URL, VUS, DURATION.
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.LOAD_API_URL || 'https://api.practicesoftwaretesting.com';
const cenario = __ENV.SCENARIO === 'load' ? 'load' : 'smoke';

const errosDeNegocio = new Rate('erros_de_negocio');
const tempoDaLista = new Trend('tempo_lista_produtos', true);
const tempoDoDetalhe = new Trend('tempo_detalhe_produto', true);

export const options = {
  scenarios: {
    [cenario]: {
      executor: 'constant-vus',
      vus: Number(__ENV.VUS) || (cenario === 'load' ? 500 : 5),
      duration: __ENV.DURATION || (cenario === 'load' ? '5m' : '30s'),
      gracefulStop: '10s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'], // menos de 1% de erro HTTP
    http_req_duration: ['p(95)<1500'], // 95% das requisições abaixo de 1,5s
    erros_de_negocio: ['rate<0.01'],
    checks: ['rate>0.99'],
  },
};

export default function () {
  const lista = http.get(`${BASE_URL}/products`, { tags: { endpoint: 'lista_produtos' } });
  tempoDaLista.add(lista.timings.duration);

  const listaOk = check(lista, {
    'GET /products - status 200': (resposta) => resposta.status === 200,
    'GET /products - devolve lista paginada': (resposta) => Array.isArray(resposta.json('data')),
  });
  errosDeNegocio.add(!listaOk);

  const produtos = lista.status === 200 ? lista.json('data') || [] : [];
  const produto = produtos.length > 0 ? produtos[Math.floor(Math.random() * produtos.length)] : null;

  if (produto) {
    const detalhe = http.get(`${BASE_URL}/products/${produto.id}`, { tags: { endpoint: 'detalhe_produto' } });
    tempoDoDetalhe.add(detalhe.timings.duration);
    errosDeNegocio.add(
      !check(detalhe, {
        'GET /products/{id} - status 200': (resposta) => resposta.status === 200,
        'GET /products/{id} - mesmo produto': (resposta) => resposta.json('id') === produto.id,
      }),
    );
  }

  sleep(1);
}
