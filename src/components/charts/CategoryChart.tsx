"use client";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import type { CategorySales } from "@/types/database";
import { useTheme } from "@/hooks/use-theme";

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = [
  "#f97316",
  "#3b82f6",
  "#10b981",
  "#8b5cf6",
  "#ef4444",
  "#f59e0b",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
  "#6366f1",
];

interface CategoryChartProps {
  data: CategorySales[];
}

export function CategoryChart({ data }: CategoryChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const chartData = {
    labels: data.map((d) => d.category),
    datasets: [
      {
        data: data.map((d) => d.revenue),
        backgroundColor: COLORS.slice(0, data.length),
        borderColor: isDark ? "#111827" : "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: isDark ? "#9ca3af" : "#6b7280",
          padding: 12,
          usePointStyle: true,
          pointStyleWidth: 8,
          font: { size: 12 },
        },
      },
      tooltip: {
        backgroundColor: isDark ? "#1f2937" : "#ffffff",
        titleColor: isDark ? "#f3f4f6" : "#111827",
        bodyColor: isDark ? "#d1d5db" : "#4b5563",
        borderColor: isDark ? "#374151" : "#e5e7eb",
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (ctx) =>
            `${ctx.label}: $${ctx.parsed.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
        },
      },
    },
  };

  return (
    <div className="h-72">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
