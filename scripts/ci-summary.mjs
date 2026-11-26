/**
 * Monta um resumo em Markdown do relatório JSON do Playwright.
 * Usado no pipeline do GitHub Actions e também na máquina local:
 *
 *   node scripts/ci-summary.mjs "Testes de API" reports/results.json
 */
import { readFileSync } from 'node:fs';

const [rotulo = 'Testes', arquivoRelatorio = 'reports/results.json'] = process.argv.slice(2);

const coletarTestes = (suite, acumulado = []) => {
  for (const spec of suite.specs ?? []) {
    for (const teste of spec.tests ?? []) {
      const resultados = teste.results ?? [];
      const ultimo = resultados[resultados.length - 1] ?? {};
      acumulado.push({ titulo: spec.title, status: ultimo.status ?? 'skipped', duracao: ultimo.duration ?? 0 });
    }
  }
  for (const filha of suite.suites ?? []) {
    coletarTestes(filha, acumulado);
  }
  return acumulado;
};

let relatorio;
try {
  relatorio = JSON.parse(readFileSync(arquivoRelatorio, 'utf8'));
} catch (erro) {
  console.log(`## ${rotulo}\n\n> Relatório não encontrado (${arquivoRelatorio}): ${erro.message}`);
  process.exit(0);
}

const testes = relatorio.suites.flatMap((suite) => coletarTestes(suite));
const contar = (status) => testes.filter((teste) => teste.status === status).length;
const passaram = contar('passed');
const falharam = contar('failed');
const abortados = contar('timedOut') + contar('interrupted');
const pulados = contar('skipped');
const segundos = (testes.reduce((total, teste) => total + teste.duracao, 0) / 1000).toFixed(1);

console.log(`## ${rotulo}`);
console.log('');
console.log('| Métrica | Valor |');
console.log('| --- | --- |');
console.log(`| Total | ${testes.length} |`);
console.log(`| Passaram | ✅ ${passaram} |`);
console.log(`| Falharam | ${falharam > 0 ? '❌' : '✅'} ${falharam} |`);
console.log(`| Abortados / timeout | ${abortados} |`);
console.log(`| Pulados | ${pulados} |`);
console.log(`| Tempo total | ${segundos}s |`);
console.log('');

if (falharam + abortados > 0) {
  console.log('### Testes com falha');
  console.log('');
  for (const teste of testes.filter((t) => ['failed', 'timedOut', 'interrupted'].includes(t.status))) {
    console.log(`- \`${teste.titulo}\` (${teste.status})`);
  }
  console.log('');
}
