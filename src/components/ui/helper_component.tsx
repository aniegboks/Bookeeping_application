"use client";

import { useEffect, useState } from "react";
import { Cpu } from "lucide-react";
import { AcademicSessionTerms } from "@/utils/nav";

interface ApiStat {
  success: boolean;
  count?: number;
  sample?: any;
  hasIdField?: boolean;
  hasCategoryIdField?: boolean;
  error?: string;
  latency?: number;
  source?: "direct" | "proxy";
}

export default function ApiDebugVertical() {
  const [stats, setStats] = useState<Record<string, ApiStat>>({});
  const [networkSpeed, setNetworkSpeed] = useState<number | null>(null);

  useEffect(() => {
    async function fetchApi(item: typeof AcademicSessionTerms[0]): Promise<ApiStat> {
      const start = performance.now();

      const skipProxy = ["Categories", "Sub Categories"].includes(item.label);

      // Attempt direct fetch first
      try {
        const res = await fetch(item.link, { cache: "no-store" });
        const latency = Math.round(performance.now() - start);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        return {
          success: true,
          count: Array.isArray(data) ? data.length : undefined,
          sample: Array.isArray(data) ? data[0] : data,
          hasIdField: Array.isArray(data) && data[0] ? "id" in data[0] : false,
          hasCategoryIdField: Array.isArray(data) && data[0] ? "category_id" in data[0] : undefined,
          latency,
          source: "direct",
        };
      } catch (directErr: unknown) {
        // If direct fails and proxy is allowed, try proxy
        if (!skipProxy) {
          try {
            const proxyUrl = `/api/proxy${item.link.replace(/^\/api\/v1/, "")}`;
            const res = await fetch(proxyUrl, { cache: "no-store" });
            const latency = Math.round(performance.now() - start);

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();
            return {
              success: true,
              count: Array.isArray(data) ? data.length : undefined,
              sample: Array.isArray(data) ? data[0] : data,
              hasIdField: Array.isArray(data) && data[0] ? "id" in data[0] : false,
              hasCategoryIdField: Array.isArray(data) && data[0] ? "category_id" in data[0] : undefined,
              latency,
              source: "proxy",
            };
          } catch (proxyErr: unknown) {
            return {
              success: false,
              error: `${directErr instanceof Error ? directErr.message : String(directErr)} / Proxy failed: ${
                proxyErr instanceof Error ? proxyErr.message : String(proxyErr)
              }`,
              latency: Math.round(performance.now() - start),
              source: "proxy",
            };
          }
        }

        // Direct only failure
        return {
          success: false,
          error: directErr instanceof Error ? directErr.message : String(directErr),
          latency: Math.round(performance.now() - start),
          source: "direct",
        };
      }
    }

    async function fetchAllApis() {
      const results: Record<string, ApiStat> = {};
      for (const item of AcademicSessionTerms) {
        const key = item.label.replace(/\s+/g, "_").toLowerCase();
        const stat = await fetchApi(item);
        results[key] = stat;
      }
      setStats(results);
    }

    async function checkNetworkSpeed() {
      const start = performance.now();
      try {
        await fetch("/api/ping");
        setNetworkSpeed(Math.round(performance.now() - start));
      } catch {
        setNetworkSpeed(null);
      }
    }

    fetchAllApis();
    checkNetworkSpeed();
  }, []);

  return (
    <div className="h-screen w-80 bg-white text-gray-900 shadow-xl border-l border-gray-200 flex flex-col">
      <h2 className="font-bold text-xl mb-4 border-b border-gray-200 pb-2 px-4">
        API Debug Dashboard
      </h2>

      <div className="flex-1 overflow-y-auto px-4 space-y-4 scrollbar-none">
        {Object.entries(stats).map(([key, stat]) => (
          <div
            key={key}
            className="bg-gray-50 p-4 rounded-xl flex flex-col items-center text-center border border-gray-100 shadow hover:shadow-lg transition-shadow duration-300"
          >
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-200 mb-3">
              <Cpu
                size={28}
                className={
                  stat.success
                    ? stat.source === "direct"
                      ? "text-green-500"
                      : "text-yellow-500"
                    : "text-red-500"
                }
              />
            </div>
            <h4 className="font-semibold text-gray-700 capitalize text-sm">{key.replace(/_/g, " ")}</h4>
            {stat.success ? (
              <>
                {stat.count !== undefined && (
                  <p className="text-green-600 font-bold text-lg">{stat.count}</p>
                )}
                {stat.latency && <p className="text-xs text-gray-500">{stat.latency} ms</p>}
                {stat.source && (
                  <p className="text-[10px] text-gray-400">
                    {stat.source === "direct" ? "Direct" : "Proxy"}
                  </p>
                )}
              </>
            ) : (
              <p className="text-red-500 text-xs break-words">{stat.error}</p>
            )}
          </div>
        ))}

        {networkSpeed !== null && (
          <div className="bg-gray-50 p-4 rounded-xl flex flex-col items-center text-center border border-gray-100 shadow hover:shadow-lg transition-shadow duration-300">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-200 mb-3">
              <Cpu size={28} className="text-blue-500" />
            </div>
            <h4 className="font-semibold text-gray-700 text-sm">Network</h4>
            <p className="text-blue-600 font-bold text-lg">{networkSpeed} ms</p>
          </div>
        )}
      </div>

      <p className="mt-4 text-[10px] text-gray-400 text-center px-4 pb-3">
        Remove before production
      </p>

      <style jsx>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
