import { ECLIPSE_AI_KEY, ECLIPSE_MODELS_ENDPOINT } from "@/lib/eclipse-ai";

/**
 * dev 专用同源代理：浏览器 -> 本站 -> api.b4qaq.cn，规避跨域。
 *
 * 站点为 output: "export" 的纯静态站，动态路由无法在导出时生成，
 * 故标记 force-static：构建（NODE_ENV=production）时只预渲染一个静态 404，
 * 不实际转发、不阻塞导出；仅在 next dev 时逐请求真实代理。
 */
export const dynamic = "force-static";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return new Response(null, { status: 404 });
  }

  try {
    const res = await fetch(ECLIPSE_MODELS_ENDPOINT, {
      headers: { Authorization: `Bearer ${ECLIPSE_AI_KEY}` },
      cache: "no-store",
    });
    const body = await res.text();
    return new Response(body, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: "upstream fetch failed" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}
