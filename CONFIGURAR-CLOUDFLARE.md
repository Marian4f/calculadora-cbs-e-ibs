# Publicar o servidor intermediário (necessário para GitHub Pages)

O GitHub Pages não executa código de servidor. Para contornar CORS, este projeto inclui um Cloudflare Worker que encaminha somente as quatro rotas necessárias para a API oficial da Receita Federal.

## 1. Publicar o Worker

1. Crie uma conta gratuita no Cloudflare, se ainda não tiver uma.
2. Abra **Workers & Pages** e crie um Worker chamado `calculadora-cbs-api`.
3. Copie todo o conteúdo de `cloudflare-worker/worker.js` para o editor do Worker e publique (`Deploy`).
4. Anote o endereço publicado, por exemplo `https://calculadora-cbs-api.SEUSUBDOMINIO.workers.dev`.
5. Em **Settings > Variables and Secrets**, configure a variável `ALLOWED_ORIGIN` com a origem exata do seu GitHub Pages, por exemplo `https://SEU-USUARIO.github.io`. Se usar domínio personalizado, informe a origem dele (`https://seudominio.com`), sem caminho final.

## 2. Apontar a calculadora para o Worker

No `index.html`, localize a constante `API` e substitua:

```js
const API="https://SEU-WORKER.workers.dev/api";
```

pelo endereço publicado, acrescentando `/api`, por exemplo:

```js
const API="https://calculadora-cbs-api.SEUSUBDOMINIO.workers.dev/api";
```

Faça commit e aguarde a publicação do GitHub Pages.

## 3. Testar

1. Abra o site pelo endereço HTTPS do GitHub Pages (não abra o `index.html` como arquivo local).
2. Importe um XML de NF-e.
3. A leitura e o cálculo serão iniciados automaticamente.
4. Se houver falha, confira a mensagem exibida e o status do Worker no painel do Cloudflare.

## Observações

- O Worker não armazena XML nem resultados; apenas encaminha as requisições.
- A lista de rotas permitidas é restrita aos endpoints usados pela calculadora.
- A API oficial é um ambiente piloto/externo. O Worker resolve o caminho de CORS, mas não garante disponibilidade ou estabilidade da API da Receita.
- A validação de XML também passa pelo Worker.
- Se o domínio do GitHub Pages mudar, atualize `ALLOWED_ORIGIN`.
