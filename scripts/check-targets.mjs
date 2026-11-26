/**
 * Verifica se os sites usados nos testes estão respondendo.
 * Rode antes de uma apresentação: as asserções são determinísticas,
 * mas os sites são demos públicas e podem ficar fora do ar.
 *
 *   node scripts/check-targets.mjs
 */
const baseUrl = process.env.BASE_URL || 'https://practicesoftwaretesting.com';
const apiUrl = process.env.API_URL || 'https://restful-booker.herokuapp.com';

const alvos = [
  { nome: 'E2E - loja', url: baseUrl },
  { nome: 'E2E - API da loja', url: 'https://api.practicesoftwaretesting.com/products' },
  { nome: 'API - Restful-booker', url: `${apiUrl}/ping` },
];

let comProblema = 0;

for (const alvo of alvos) {
  const inicio = Date.now();
  try {
    const resposta = await fetch(alvo.url, { signal: AbortSignal.timeout(20_000) });
    const segundos = ((Date.now() - inicio) / 1000).toFixed(1);
    const ok = resposta.status < 500;
    if (!ok) comProblema += 1;
    console.log(`${ok ? 'OK  ' : 'FALHA'} ${alvo.nome.padEnd(22)} ${resposta.status} (${segundos}s) ${alvo.url}`);
  } catch (erro) {
    comProblema += 1;
    console.log(`FALHA ${alvo.nome.padEnd(22)} --  ${erro.message} ${alvo.url}`);
  }
}

console.log('');
console.log(comProblema === 0 ? 'Tudo respondendo: pode rodar os testes.' : `${comProblema} alvo(s) com problema: espere falhas na execução.`);
process.exit(comProblema === 0 ? 0 : 1);
