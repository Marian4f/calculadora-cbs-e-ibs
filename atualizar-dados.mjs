// Baixa as tabelas oficiais da calculadora da Receita Federal (API de dados abertos) para a pasta data/.
// Roda todo dia pelo GitHub Actions. Não derruba a execução se um endpoint falhar: o que falhou vai para meta.json.
import { mkdir, writeFile } from "node:fs/promises";
const BASE = process.env.RTC_API || "https://piloto-cbs.tributos.gov.br/servico/calculadora-consumo/api";
const hoje = new Date().toISOString().slice(0, 10);
const get = async p => { const r = await fetch(BASE + p, { headers: { accept: "application/json" } }); if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); };
const save = (n, j) => writeFile(`data/${n}.json`, JSON.stringify(j));
const meta = { atualizadoEm: new Date().toISOString(), fonte: BASE, arquivos: [], ignorados: [] };
const salvos = {};
await mkdir("data", { recursive: true });

let spec = {};
try { spec = await get("/api-docs"); await save("openapi", spec); meta.arquivos.push("openapi"); }
catch (e) { meta.ignorados.push("api-docs: " + e.message); }

// Descobre sozinho todos os endpoints GET de dados abertos que dá para chamar só com a data.
const rotas = Object.entries(spec.paths || {}).filter(([p, o]) => o.get && p.includes("dados-abertos"));
for (const [p, o] of rotas) {
  const ps = o.get.parameters || [];
  if (p.includes("{")) { meta.ignorados.push(p + " (precisa de parâmetro no caminho)"); continue; }
  const q = new URLSearchParams();
  if (ps.some(x => x.name === "data")) q.set("data", hoje);
  if (ps.some(x => x.required && x.name !== "data")) { meta.ignorados.push(p + " (precisa de parâmetros)"); continue; }
  const nome = p.split("dados-abertos/")[1]?.replace(/\W+/g, "_") || "raiz";
  try { salvos[nome] = await get(p + (q.size ? "?" + q : "")); await save(nome, salvos[nome]); meta.arquivos.push(nome); }
  catch (e) { meta.ignorados.push(p + ": " + e.message); }
}

// Detalhe de cada classificação tributária (reduções, documentos aceitos, base legal).
const cods = [...new Set((JSON.stringify(salvos.situacoes_tributarias_cbs_ibs || {}).match(/"(\d{6})"/g) || []).map(s => s.slice(1, 7)))];
const det = {};
for (let i = 0; i < cods.length; i += 8) {
  await Promise.all(cods.slice(i, i + 8).map(async c => {
    try { det[c] = await get(`/calculadora/dados-abertos/classificacoes-tributarias/cbs-ibs/class-trib/${c}?data=${hoje}`); }
    catch (e) { meta.ignorados.push("class-trib " + c + ": " + e.message); }
  }));
}
if (cods.length) { await save("classificacoes", det); meta.arquivos.push("classificacoes"); }

meta.versao = salvos.versao ?? null;
await writeFile("data/meta.json", JSON.stringify(meta, null, 1));
console.log(`${meta.arquivos.length} arquivos salvos, ${meta.ignorados.length} ignorados`);
