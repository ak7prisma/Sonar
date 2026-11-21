"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
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
  title = "Course Accessibility Pipeline Summary",
}: {
  data: ActivityMetricPoint[];
  title?: string;
}) {
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");

  const hasData = data.some((d) => d.documents > 0 || d.verifiedBlocks > 0);

  return (
    <section
      aria-labelledby="activity-panel-heading"
      className="rounded-xl border bg-card p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div>
          <h2
            id="activity-panel-heading"
            className="font-heading text-lg font-semibold text-foreground"
          >
            {title}
          </h2>
          <p className="text-xs text-muted-foreground">
            Includes full keyboard-accessible tabular data representation.
          </p>
        </div>

        <div
          role="group"
          aria-label="Visualization display format"
          className="inline-flex gap-1 rounded-lg border bg-surface-subtle p-1"
        >
          <Button
            size="xs"
            variant={viewMode === "chart" ? "default" : "ghost"}
            aria-pressed={viewMode === "chart"}
            onClick={() => setViewMode("chart")}
          >
            <BarChart3 className="mr-1 size-3.5" aria-hidden="true" />
            Chart
          </Button>
          <Button
            size="xs"
            variant={viewMode === "table" ? "default" : "ghost"}
            aria-pressed={viewMode === "table"}
            onClick={() => setViewMode("table")}
          >
            <Table2 className="mr-1 size-3.5" aria-hidden="true" />
            Data table
          </Button>
        </div>
      </div>

      {!hasData ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No course documents have been processed yet. Upload a PDF to track
          conversion and volunteer verification metrics here.
        </p>
      ) : viewMode === "chart" ? (
        <div className="mt-4">
          <div
            role="img"
            aria-label={`${title}: ${data
              .map(
                (d) =>
                  `${d.label}: ${d.documents} documents, ${d.verifiedBlocks} verified`
              )
              .join("; ")}`}
            className="h-64 w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--popover)",
                    borderColor: "var(--border)",
                    color: "var(--popover-foreground)",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="documents"
                  name="Documents"
                  fill="var(--chart-1)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="verifiedBlocks"
                  name="Verified"
                  fill="var(--chart-3)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">{title}</caption>
            <thead>
              <tr className="border-b">
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Category
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Documents
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Verified
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.label} className="border-b last:border-b-0">
                  <th scope="row" className="py-2 pr-4 font-medium">
                    {row.label}
                  </th>
                  <td className="py-2 pr-4 tabular-nums">{row.documents}</td>
                  <td className="py-2 tabular-nums">{row.verifiedBlocks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
