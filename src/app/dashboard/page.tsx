"use client";

import { useState } from "react";
import type { DateRange } from "@/types/database";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { StatusBadge } from "@/components/ui/Badge";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { OrdersChart } from "@/components/charts/OrdersChart";
import { CategoryChart } from "@/components/charts/CategoryChart";
import Link from "next/link";

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const { kpis, revenueData, ordersData, categorySales, topProducts, recentOrders, loading } =
    useDashboardData(dateRange);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Overview of your store performance
          </p>
        </div>
        <DateRangePicker selected={dateRange} onChange={setDateRange} />
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Total Revenue"
              value={formatCurrency(kpis.total_revenue)}
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <KpiCard
              title="Total Orders"
              value={formatNumber(kpis.total_orders)}
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              }
            />
            <KpiCard
              title="Avg Order Value"
              value={formatCurrency(kpis.avg_order_value)}
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              }
            />
            <KpiCard
              title="Delivery Rate"
              value={`${kpis.conversion_rate.toFixed(1)}%`}
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  Revenue Over Time
                </h2>
              </CardHeader>
              <CardContent>
                {revenueData.length > 0 ? (
                  <RevenueChart data={revenueData} />
                ) : (
                  <div className="h-72 flex items-center justify-center text-gray-400 dark:text-gray-500">
                    No revenue data for this period
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  Orders Over Time
                </h2>
              </CardHeader>
              <CardContent>
                {ordersData.length > 0 ? (
                  <OrdersChart data={ordersData} />
                ) : (
                  <div className="h-72 flex items-center justify-center text-gray-400 dark:text-gray-500">
                    No order data for this period
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row: Category + Top Products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  Sales by Category
                </h2>
              </CardHeader>
              <CardContent>
                {categorySales.length > 0 ? (
                  <CategoryChart data={categorySales} />
                ) : (
                  <div className="h-72 flex items-center justify-center text-gray-400 dark:text-gray-500">
                    No category data for this period
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  Top Products
                </h2>
              </CardHeader>
              <CardContent className="p-0">
                {topProducts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <th className="text-left font-medium text-gray-500 dark:text-gray-400 px-5 py-3">Product</th>
                          <th className="text-right font-medium text-gray-500 dark:text-gray-400 px-5 py-3">Revenue</th>
                          <th className="text-right font-medium text-gray-500 dark:text-gray-400 px-5 py-3">Sold</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topProducts.map((product) => (
                          <tr key={product.id} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                            <td className="px-5 py-3">
                              <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{product.category}</div>
                            </td>
                            <td className="px-5 py-3 text-right font-medium text-gray-900 dark:text-white">
                              {formatCurrency(product.revenue)}
                            </td>
                            <td className="px-5 py-3 text-right text-gray-600 dark:text-gray-400">
                              {product.quantity_sold}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-gray-400 dark:text-gray-500 px-5">
                    No product data for this period
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  Recent Orders
                </h2>
                <Link
                  href="/dashboard/orders"
                  className="text-sm font-medium text-brand-500 hover:text-brand-600"
                >
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {recentOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <th className="text-left font-medium text-gray-500 dark:text-gray-400 px-5 py-3">Order</th>
                        <th className="text-left font-medium text-gray-500 dark:text-gray-400 px-5 py-3">Customer</th>
                        <th className="text-left font-medium text-gray-500 dark:text-gray-400 px-5 py-3">Status</th>
                        <th className="text-right font-medium text-gray-500 dark:text-gray-400 px-5 py-3">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                          <td className="px-5 py-3">
                            <Link
                              href={`/dashboard/orders/${order.id}`}
                              className="font-medium text-brand-500 hover:text-brand-600"
                            >
                              {order.order_number}
                            </Link>
                          </td>
                          <td className="px-5 py-3 text-gray-600 dark:text-gray-400">
                            {order.customer?.name || "—"}
                          </td>
                          <td className="px-5 py-3">
                            <StatusBadge status={order.status} />
                          </td>
                          <td className="px-5 py-3 text-right font-medium text-gray-900 dark:text-white">
                            {formatCurrency(Number(order.total))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-gray-400 dark:text-gray-500">
                  No orders yet
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
