"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface StageData { stage: string; label: string; count: number }
interface CategoryData { label: string; count: number }
interface FunnelData { label: string; count: number }

export function ReportsCharts({
  byStage,
  categoryData,
  funnelData,
  total,
}: {
  byStage: StageData[];
  categoryData: CategoryData[];
  funnelData: FunnelData[];
  total: number;
}) {
  return (
    <div className="flex flex-col gap-8">
      <div className="bg-white p-6">
        <h2 className="font-serif text-lg text-text mb-4">Applications by Stage</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={byStage} layout="vertical" margin={{ left: 16, right: 40 }}>
            <XAxis type="number" tick={{ fontSize: 11, fill: "#7a7060" }} />
            <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: "#114E3B" }} width={140} />
            <Tooltip
              contentStyle={{ fontSize: 12, border: "1px solid #ede9e2" }}
              cursor={{ fill: "#f5f2ed" }}
            />
            <Bar dataKey="count" radius={0}>
              {byStage.map((entry, i) => (
                <Cell key={entry.stage} fill={i === 0 ? "#c9972c" : "#114E3B"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6">
        <h2 className="font-serif text-lg text-text mb-4">Domestic vs International</h2>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={categoryData} layout="vertical" margin={{ left: 16, right: 60 }}>
            <XAxis type="number" tick={{ fontSize: 11, fill: "#7a7060" }} />
            <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: "#114E3B" }} width={120} />
            <Tooltip
              contentStyle={{ fontSize: 12, border: "1px solid #ede9e2" }}
              cursor={{ fill: "#f5f2ed" }}
            />
            <Bar dataKey="count" fill="#114E3B" radius={0} label={{ position: "right", fontSize: 11, fill: "#7a7060" }} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6">
        <h2 className="font-serif text-lg text-text mb-1">Conversion Funnel</h2>
        <p className="text-xs text-text-muted mb-4">Applicants who reached each stage (cumulative)</p>
        <div className="flex flex-col gap-2">
          {funnelData.map((item, i) => {
            const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
            return (
              <div key={i} className="flex items-center gap-3 text-xs">
                <span className="w-36 text-text-muted truncate">{item.label}</span>
                <div className="flex-1 bg-surface-dark h-5 relative">
                  <div
                    className="h-5 bg-green transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-16 text-right text-text font-medium">
                  {item.count} <span className="text-text-muted font-normal">({pct}%)</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
