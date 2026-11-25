# Calculadora CBS/IBS por XML

o cliente envia o XML (NF-e, NFC-e, NFS-e nacional, CT-e) e vê CBS, IBS, reduções e a validação de NCM/NBS.

## Atualização diária
`.github/workflows/atualizar-dados.yml` roda todo dia às 6h (Brasília), executa `scripts/atualizar-dados.mjs`
e grava as tabelas oficiais em `data/`. O arquivo `data/meta.json` registra a data, a versão da base e o que não foi possível baixar.
`data/openapi.json` guarda o contrato oficial da API.

## Fontes
LC 214/2025 (atualizada até a LC 227/2026) · calculadora e API de dados abertos da Receita Federal ·
notas técnicas da NF-e e da NFS-e. Os links estão no rodapé do site.
