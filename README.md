# Calculadora CBS/IBS por XML

Site estático: o cliente envia o XML (NF-e, NFC-e, NFS-e nacional, CT-e) e vê CBS, IBS, reduções e a validação de NCM/NBS.

## Publicar (uma vez)
1. Crie um repositório no GitHub e envie todo o conteúdo desta pasta (inclusive `.github` e `data`).
2. Em **Settings → Pages**, escolha a branch `main`, pasta `/ (root)`.
3. Em **Actions**, abra "Atualizar tabelas da Receita" e clique em **Run workflow** para a primeira carga.
4. O link do site fica em Settings → Pages. É esse o link que vai para os clientes.

## Atualização diária
`.github/workflows/atualizar-dados.yml` roda todo dia às 6h (Brasília), executa `scripts/atualizar-dados.mjs`
e grava as tabelas oficiais em `data/`. O arquivo `data/meta.json` registra a data, a versão da base e o que não foi possível baixar.
`data/openapi.json` guarda o contrato oficial da API.

## Fontes
LC 214/2025 (atualizada até a LC 227/2026) · calculadora e API de dados abertos da Receita Federal ·
notas técnicas da NF-e e da NFS-e. Os links estão no rodapé do site.
