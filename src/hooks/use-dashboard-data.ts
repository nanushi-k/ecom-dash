"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  DashboardKPIs,
  RevenueDataPoint,
  OrdersDataPoint,
  CategorySales,
  TopProduct,
  DateRange,
} from "@/types/database";
import { getDateRange } from "@/lib/utils";

interface RecentOrder {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  customer: { name: string } | null;
}

interface DashboardData {
  kpis: DashboardKPIs;
  revenueData: RevenueDataPoint[];
  ordersData: OrdersDataPoint[];
  categorySales: CategorySales[];
  topProducts: TopProduct[];
  recentOrders: RecentOrder[];
  loading: boolean;
}

const defaultKPIs: DashboardKPIs = {
  total_revenue: 0,
  total_orders: 0,
  avg_order_value: 0,
  conversion_rate: 0,
};

export function useDashboardData(dateRange: DateRange): DashboardData {
  const [data, setData] = useState<DashboardData>({
    kpis: defaultKPIs,
    revenueData: [],
    ordersData: [],
    categorySales: [],
    topProducts: [],
    recentOrders: [],
    loading: true,
  });

  const fetchData = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true }));
    const supabase = createClient();
    const { from, to } = getDateRange(dateRange);

    // Fetch orders in range
    const { data: orders } = await supabase
      .from("orders")
      .select(
        "id, total, status, created_at, order_number, customer_id, user_id, customers(name)",
      )
      .gte("created_at", from)
      .lte("created_at", to)
      .order("created_at", { ascending: true });

    const orderList = orders || [];

    // KPIs
    const totalRevenue = orderList
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + Number(o.total), 0);
    const totalOrders = orderList.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const deliveredCount = orderList.filter(
      (o) => o.status === "delivered",
    ).length;
    const conversionRate =
      totalOrders > 0 ? (deliveredCount / totalOrders) * 100 : 0;

    // Revenue over time (group by day)
    const revenueMap = new Map<string, number>();
    orderList
      .filter((o) => o.status !== "cancelled")
      .forEach((o) => {
        const day = o.created_at.slice(0, 10);
        revenueMap.set(day, (revenueMap.get(day) || 0) + Number(o.total));
      });
    const revenueData: RevenueDataPoint[] = Array.from(revenueMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, revenue]) => ({ date, revenue }));

    // Orders over time (group by day)
    const ordersMap = new Map<string, number>();
    orderList.forEach((o) => {
      const day = o.created_at.slice(0, 10);
      ordersMap.set(day, (ordersMap.get(day) || 0) + 1);
    });
    const ordersData: OrdersDataPoint[] = Array.from(ordersMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    // Category sales via order_items
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("quantity, unit_price, products(name, category, id)")
      .in(
        "order_id",
        orderList.filter((o) => o.status !== "cancelled").map((o) => o.id),
      );

    const categoryMap = new Map<string, number>();
    const productMap = new Map<
      string,
      { name: string; category: string; revenue: number; quantity: number }
    >();

    (orderItems || []).forEach((item) => {
      const product = item.products as unknown as {
        name: string;
        category: string;
        id: string;
      } | null;
      if (!product) return;
      const revenue = Number(item.quantity) * Number(item.unit_price);

      categoryMap.set(
        product.category,
        (categoryMap.get(product.category) || 0) + revenue,
      );

      const existing = productMap.get(product.id);
      if (existing) {
        existing.revenue += revenue;
        existing.quantity += Number(item.quantity);
      } else {
        productMap.set(product.id, {
          name: product.name,
          category: product.category,
          revenue,
          quantity: Number(item.quantity),
        });
      }
    });

    const categorySales: CategorySales[] = Array.from(categoryMap.entries())
      .map(([category, revenue]) => ({ category, revenue }))
      .sort((a, b) => b.revenue - a.revenue);

    const topProducts: TopProduct[] = Array.from(productMap.entries())
      .map(([id, p]) => ({
        id,
        name: p.name,
        category: p.category,
        revenue: p.revenue,
        quantity_sold: p.quantity,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Recent orders (last 10 overall)
    const { data: recent } = await supabase
      .from("orders")
      .select(
        "id, total, status, created_at, order_number, customer_id, user_id, customers(name)",
      )
      .order("created_at", { ascending: false })
      .limit(10);

    const recentOrders: RecentOrder[] = (recent || []).map((o) => {
      const cust = o.customers as unknown as { name: string } | null;
      return {
        id: o.id,
        order_number: o.order_number,
        status: o.status,
        total: Number(o.total),
        created_at: o.created_at,
        customer: cust,
      };
    });

    setData({
      kpis: {
        total_revenue: totalRevenue,
        total_orders: totalOrders,
        avg_order_value: avgOrderValue,
        conversion_rate: conversionRate,
      },
      revenueData,
      ordersData,
      categorySales,
      topProducts,
      recentOrders,
      loading: false,
    });
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return data;
}
