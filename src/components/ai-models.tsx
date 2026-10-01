"use client";

import { useEffect, useState } from "react";
import {
  ECLIPSE_AI_KEY,
  ECLIPSE_MODELS_ENDPOINT,
} from "@/lib/eclipse-ai";

/**
 * Eclipse 官方中转的模型价格表（浏览器端实时拉取）。
 *
 * dev 下走 src/app/api/eclipse-ai/models/route.ts 的 dev-only 同源代理
 * （trailingSlash: true，路径需带尾斜杠）；生产为纯静态导出、直连真实
 * 接口，因此要求 api.b4qaq.cn 对文档站返回 Access-Control-Allow-Origin。
 */
const DEV_PROXY_ENDPOINT = "/api/eclipse-ai/models/";
const MODELS_ENDPOINT =
  process.env.NODE_ENV === "development"
    ? DEV_PROXY_ENDPOINT
    : ECLIPSE_MODELS_ENDPOINT;

type AiModel = {
  id: string;
  provider?: string;
  priceInput: number;
  priceOutput: number;
  unit?: string;
};

function formatPrice(value: number): string {
  return value === 0 ? "免费" : `¥${value}`;
}

export function AiModels() {
  const [models, setModels] = useState<AiModel[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(MODELS_ENDPOINT, {
          headers: { Authorization: `Bearer ${ECLIPSE_AI_KEY}` },
        });
        if (!res.ok) {
          throw new Error(`接口返回 ${res.status}`);
        }
        const json = (await res.json()) as { data: AiModel[] };
        if (!cancelled) setModels(json.data);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="my-6 rounded-lg border border-fc-border bg-fc-muted px-4 py-3 text-sm text-fc-muted-foreground">
        模型价格暂时拉取失败（{error}），请稍后刷新页面重试。
      </div>
    );
  }

  if (!models) {
    return (
      <div className="my-6 animate-pulse text-sm text-fc-muted-foreground">
        模型列表加载中…
      </div>
    );
  }

  return (
    <div className="my-6">
      <table>
        <thead>
          <tr>
            <th>模型名称</th>
            <th>输入价格/MTok</th>
            <th>输出价格/MTok</th>
          </tr>
        </thead>
        <tbody>
          {models.map((model) => (
            <tr key={model.id}>
              <td>{model.id}</td>
              <td>{formatPrice(model.priceInput)}</td>
              <td>{formatPrice(model.priceOutput)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
