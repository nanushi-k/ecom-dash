import { Card } from "@/components/ui/Card";

interface KpiCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: { value: string; positive: boolean };
}

export function KpiCard({ title, value, icon, trend }: KpiCardProps) {
  return (
    <Card>
      <div className="px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              {title}
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
            {trend && (
              <p
                className={`mt-1 text-xs font-medium ${
                  trend.positive
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {trend.positive ? "+" : ""}
                {trend.value} vs prev period
              </p>
            )}
          </div>
          <div className="flex-shrink-0 rounded-lg bg-brand-50 dark:bg-brand-900/20 p-3 text-brand-600 dark:text-brand-400">
            {icon}
          </div>
        </div>
      </div>
    </Card>
  );
}
