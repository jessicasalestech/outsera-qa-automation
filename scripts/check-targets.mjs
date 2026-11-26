/**
 * Verifica se os sites usados nos testes estão respondendo.
 *
 *   node scripts/check-targets.mjs
 *
 * Códigos de saída:
 *   0 tudo ok   1 algum site fora do ar   2 site bloqueando acesso automatizado (anti-bot)
 */
const baseUrl = process.env.BASE_URL || 'https://practicesoftwaretesting.com';
const apiUrl = process.env.API_URL || 'https://restful-booker.herokuapp.com';

const alvos = [
  { nome: 'Loja (E2E)', url: baseUrl },
  { nome: 'API da loja (E2E)', url: 'https://api.practicesoftwaretesting.com/products' },
  { nome: 'API Restful-booker', url: `${apiUrl}/ping` },
];

let foraDoAr = 0;
let bloqueado = 0;

for (const alvo of alvos) {
  const inicio = Date.now();
  try {
    const resposta = await fetch(alvo.url, {
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; outsera-qa-automation)' },
      signal: AbortSignal.timeout(20_000),
    });
    const segundos = ((Date.now() - inicio) / 1000).toFixed(1);
    const corpo = await resposta.text();

    // Cloudflare e afins devolvem 403 com uma página de verificação de navegador.
    const temDesafio = /just a moment|verifying you are human|cf-browser-verification/i.test(corpo);
    const bloqueou = resposta.status === 403 || temDesafio;

    if (bloqueou) {
      bloqueado += 1;
      console.log(`${'BLOQUEADO'.padEnd(10)} ${alvo.nome.padEnd(22)} ${resposta.status} (${segundos}s)`);
    } else if (resposta.status >= 400) {
      foraDoAr += 1;
      console.log(`${'FORA'.padEnd(10)} ${alvo.nome.padEnd(22)} ${resposta.status} (${segundos}s)`);
    } else {
      console.log(`${'OK'.padEnd(10)} ${alvo.nome.padEnd(22)} ${resposta.status} (${segundos}s)`);
    }
  } catch (erro) {
    foraDoAr += 1;
    console.log(`${'FORA'.padEnd(10)} ${alvo.nome.padEnd(22)} ${erro.message}`);
  }
}

console.log('');
if (bloqueado > 0) {
  console.log('Um dos sites está bloqueando acesso automatizado (proteção anti-bot).');
  console.log('Costuma acontecer em runner de CI: nesse caso rode o E2E na sua máquina.');
  process.exit(2);
}
if (foraDoAr > 0) {
  console.log('Algum site não respondeu. Espere falhas na execução.');
  process.exit(1);
}

console.log('Tudo respondendo: pode rodar os testes.');
