"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ActivityMetricPoint {
  label: string;
  documents: number;
  verifiedBlocks: number;
}

export function StudyActivityPanel({
  data,
  title = "Ringkasan Materi per Kuliah",
}: {
  data: ActivityMetricPoint[];
  title?: string;
}) {
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");

  const hasData = data.some((d) => d.documents > 0 || d.verifiedBlocks > 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-heading text-base font-bold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground font-ui">
            Total dokumen vs terverifikasi
          </p>
        </div>

        <div
          role="group"
          aria-label="Format tampilan ringkasan materi"
          className="inline-flex gap-1 rounded-xl border border-border bg-surface-subtle p-1 font-ui"
        >
          <Button
            type="button"
            size="sm"
            variant={viewMode === "chart" ? "default" : "ghost"}
            aria-pressed={viewMode === "chart"}
            onClick={() => setViewMode("chart")}
            className="h-9 rounded-lg px-2.5 text-xs"
          >
            <BarChart3 className="size-3.5" aria-hidden="true" />
            <span>Grafik</span>
          </Button>
          <Button
            type="button"
            size="sm"
            variant={viewMode === "table" ? "default" : "ghost"}
            aria-pressed={viewMode === "table"}
            onClick={() => setViewMode("table")}
            className="h-9 rounded-lg px-2.5 text-xs"
          >
            <Table2 className="size-3.5" aria-hidden="true" />
            <span>Tabel</span>
          </Button>
        </div>
      </div>

      {!hasData ? (
        <p className="rounded-xl bg-surface-subtle px-4 py-8 text-center text-sm text-muted-foreground">
          Belum ada dokumen mata kuliah yang diproses. Unggah PDF untuk memantau progres verifikasi di sini.
        </p>
      ) : viewMode === "chart" ? (
        <div className="rounded-xl bg-surface-subtle/60 p-3">
          <div
            role="img"
            aria-label={`${title}: ${data
              .map(
                (d) =>
                  `${d.label}: ${d.documents} total materi, ${d.verifiedBlocks} terverifikasi`
              )
              .join("; ")}`}
            className="h-48 w-full min-w-0"
          >
            <ResponsiveContainer width="100%" height={192}>
              <BarChart data={data} barGap={6}>
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  allowDecimals={false}
                  width={26}
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                  contentStyle={{
                    backgroundColor: "var(--popover)",
                    borderColor: "var(--border)",
                    color: "var(--popover-foreground)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="documents"
                  name="Total Materi"
                  fill="var(--chart-3)"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="verifiedBlocks"
                  name="Terverifikasi"
                  fill="var(--chart-1)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center justify-center gap-4 text-xs text-muted-foreground font-ui">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-brand-blue" aria-hidden="true" />
              <span>Total Materi</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-brand-teal" aria-hidden="true" />
              <span>Terverifikasi</span>
            </span>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">{title}</caption>
            <thead>
              <tr className="border-b border-border bg-surface-subtle text-xs font-semibold text-muted-foreground font-ui">
                <th scope="col" className="px-3 py-2.5">
                  Mata Kuliah
                </th>
                <th scope="col" className="px-3 py-2.5">
                  Total Materi
                </th>
                <th scope="col" className="px-3 py-2.5">
                  Terverifikasi
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.label} className="border-b border-border/60 last:border-b-0">
                  <th scope="row" className="px-3 py-2.5 font-semibold text-foreground">
                    {row.label}
                  </th>
                  <td className="px-3 py-2.5 tabular-nums text-foreground">{row.documents}</td>
                  <td className="px-3 py-2.5 tabular-nums font-semibold text-primary">
                    {row.verifiedBlocks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
