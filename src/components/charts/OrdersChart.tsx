"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  type ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import type { OrdersDataPoint } from "@/types/database";
import { formatDateShort } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

interface OrdersChartProps {
  data: OrdersDataPoint[];
}

export function OrdersChart({ data }: OrdersChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const chartData = {
    labels: data.map((d) => formatDateShort(d.date)),
    datasets: [
      {
        label: "Orders",
        data: data.map((d) => d.count),
        backgroundColor: isDark
          ? "rgba(96, 165, 250, 0.6)"
          : "rgba(59, 130, 246, 0.6)",
        borderRadius: 4,
        borderSkipped: false as const,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
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
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="h-72">
      <Bar data={chartData} options={options} />
    </div>
  );
}
