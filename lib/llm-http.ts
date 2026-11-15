// lib/llm-http.ts
// LLM 请求的统一 fetch 出口。
//  - 普通 provider：浏览器直连；
//  - serverProxy 标记（OpenCode 网关）：改发本站 /api/llm-proxy；
//  - 灵眸（api.lmuai.ai）：浏览器无法跨域直连，同样走 /api/llm-proxy 转发。

import type { LlmRequestPayload } from "./llm-provider-adapter";

export type FetchLlmPayloadOptions = {
    signal?: AbortSignal;
};

const PROXY_PREFIXES = ["https://api.lmuai.ai/"];

export function llmFetch(url: string, init: RequestInit = {}): Promise<Response> {
    if (!PROXY_PREFIXES.some((p) => url.startsWith(p))) return fetch(url, init);
    return fetch("/api/llm-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            url,
            method: init.method || "GET",
            headers: init.headers,
            body: typeof init.body === "string" ? init.body : undefined,
        }),
        signal: init.signal,
    });
}

export function fetchLlmPayload(
    payload: LlmRequestPayload,
    options: FetchLlmPayloadOptions = {},
): Promise<Response> {
    const bodyText = JSON.stringify(payload.body);
    if (payload.serverProxy) {
        return fetch("/api/llm-proxy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                url: payload.url,
                headers: payload.headers,
                body: bodyText,
            }),
            signal: options.signal,
        });
    }
    return llmFetch(payload.url, {
        method: "POST",
        headers: payload.headers,
        body: bodyText,
        signal: options.signal,
    });
}
