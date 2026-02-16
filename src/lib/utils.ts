import type { DateRange, DateRangeValue } from "@/types/database";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateShort(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function getDateRange(preset: DateRange): DateRangeValue {
  const now = new Date();
  const to = now.toISOString();
  let from: Date;

  switch (preset) {
    case "today":
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "7d":
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "30d":
      from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "90d":
      from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  return { from: from.toISOString(), to, preset };
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getStatusColor(status: string): {
  bg: string;
  text: string;
  dot: string;
} {
  switch (status) {
    case "pending":
      return { bg: "bg-yellow-50 dark:bg-yellow-900/20", text: "text-yellow-700 dark:text-yellow-400", dot: "bg-yellow-500" };
    case "processing":
      return { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500" };
    case "shipped":
      return { bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-700 dark:text-purple-400", dot: "bg-purple-500" };
    case "delivered":
      return { bg: "bg-green-50 dark:bg-green-900/20", text: "text-green-700 dark:text-green-400", dot: "bg-green-500" };
    case "cancelled":
      return { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-700 dark:text-red-400", dot: "bg-red-500" };
    default:
      return { bg: "bg-gray-50 dark:bg-gray-900/20", text: "text-gray-700 dark:text-gray-400", dot: "bg-gray-500" };
  }
}
