const UPSTREAM = "https://piloto-cbs.tributos.gov.br/servico/calculadora-consumo/api/calculadora";
const ALLOWED = new Set([
  "GET /dados-abertos/situacoes-tributarias/cbs-ibs",
  "POST /observabilidade/regime-geral",
  "POST /regime-geral",
  "POST /xml/validate"
]);

function cors(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowedOrigin = env.ALLOWED_ORIGIN || "*";
    if (allowedOrigin !== "*" && origin !== allowedOrigin) {
      return new Response("Origem não autorizada", { status: 403 });
    }
    const headers = cors(allowedOrigin === "*" ? "*" : allowedOrigin);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });

    const incoming = new URL(request.url);
    if (!incoming.pathname.startsWith("/api/")) {
      return new Response("Caminho não permitido", { status: 404, headers });
    }
    const path = incoming.pathname.slice("/api".length);
    if (!ALLOWED.has(`${request.method} ${path}`)) {
      return new Response("Endpoint não permitido", { status: 405, headers });
    }

    const target = new URL(UPSTREAM + path);
    target.search = incoming.search;
    const upstreamHeaders = new Headers();
    const contentType = request.headers.get("Content-Type");
    if (contentType) upstreamHeaders.set("Content-Type", contentType);
    upstreamHeaders.set("Accept", "application/json, text/plain, */*");

    try {
      const init = { method: request.method, headers: upstreamHeaders, redirect: "follow" };
      if (request.method !== "GET" && request.method !== "HEAD") init.body = await request.arrayBuffer();
      const upstream = await fetch(target.toString(), init);
      const responseHeaders = new Headers(headers);
      responseHeaders.set("Content-Type", upstream.headers.get("Content-Type") || "text/plain; charset=utf-8");
      responseHeaders.set("Cache-Control", "no-store");
      return new Response(await upstream.arrayBuffer(), { status: upstream.status, headers: responseHeaders });
    } catch (error) {
      return new Response(JSON.stringify({ detail: "Falha ao conectar à API oficial", error: String(error) }), {
        status: 502,
        headers: { ...headers, "Content-Type": "application/json; charset=utf-8" }
      });
    }
  }
};
