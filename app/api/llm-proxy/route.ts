export const runtime = "nodejs";

const ALLOWED = ["https://api.lmuai.ai/"];

export async function POST(req: Request) {
  const { url, method, headers, body } = await req.json();
  if (typeof url !== "string" || !ALLOWED.some((p) => url.startsWith(p))) {
    return new Response("forbidden", { status: 403 });
  }
  const m = method === "GET" ? "GET" : "POST";
  const upstream = await fetch(url, {
    method: m,
    headers,
    body: m === "GET" ? undefined : body,
  });
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") || "application/json",
      "Cache-Control": "no-store",
    },
  });
}
