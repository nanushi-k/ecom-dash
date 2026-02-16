"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  type ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { RevenueDataPoint } from "@/types/database";
import { formatDateShort } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
);

interface RevenueChartProps {
  data: RevenueDataPoint[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const chartData = {
    labels: data.map((d) => formatDateShort(d.date)),
    datasets: [
      {
        label: "Revenue",
        data: data.map((d) => d.revenue),
        borderColor: "#f97316",
        backgroundColor: "rgba(249, 115, 22, 0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "#f97316",
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        backgroundColor: isDark ? "#1f2937" : "#ffffff",
        titleColor: isDark ? "#f3f4f6" : "#111827",
        bodyColor: isDark ? "#d1d5db" : "#4b5563",
        borderColor: isDark ? "#374151" : "#e5e7eb",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (ctx) =>
            `$${(ctx.parsed.y ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: isDark ? "#6b7280" : "#9ca3af",
          maxTicksLimit: 8,
        },
      },
      y: {
        grid: {
          color: isDark ? "#1f2937" : "#f3f4f6",
        },
        ticks: {
          color: isDark ? "#6b7280" : "#9ca3af",
          callback: (value) => `$${Number(value).toLocaleString()}`,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
  };

  return (
    <div className="h-72">
      <Line data={chartData} options={options} />
    </div>
  );
}
