"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatNumber, formatDateShort } from "@/lib/utils";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { RevenueChart } from "@/components/charts/RevenueChart";
import Link from "next/link";
import type { RevenueDataPoint } from "@/types/database";

interface ProductDetail {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  stock: number;
  created_at: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [salesData, setSalesData] = useState<RevenueDataPoint[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSold, setTotalSold] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      const supabase = createClient();

      const { data: prod } = await supabase
        .from("products")
        .select("*")
        .eq("id", params.id as string)
        .single();

      if (!prod) {
        setLoading(false);
        return;
      }

      setProduct(prod as ProductDetail);

      // Get order items for this product with order dates
      const { data: items } = await supabase
        .from("order_items")
        .select("quantity, unit_price, orders(created_at, status)")
        .eq("product_id", params.id as string);

      let revenue = 0;
      let sold = 0;
      const dailyMap = new Map<string, number>();

      (items || []).forEach((item) => {
        const order = item.orders as unknown as { created_at: string; status: string } | null;
        if (!order || order.status === "cancelled") return;

        const itemRevenue = Number(item.quantity) * Number(item.unit_price);
        revenue += itemRevenue;
        sold += Number(item.quantity);

        const day = order.created_at.slice(0, 10);
        dailyMap.set(day, (dailyMap.get(day) || 0) + itemRevenue);
      });

      setTotalRevenue(revenue);
      setTotalSold(sold);
      setSalesData(
        Array.from(dailyMap.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, rev]) => ({ date, revenue: rev }))
      );
      setLoading(false);
    }
    fetchProduct();
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        Product not found.{" "}
        <Link href="/dashboard/products" className="text-brand-500 hover:text-brand-600">
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/products"
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 inline-flex items-center gap-1 mb-2"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Products
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {product.name}
        </h1>
        <div className="flex items-center gap-3 mt-2">
          <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-300">
            {product.category}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Added {formatDateShort(product.created_at)}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {formatCurrency(Number(product.price))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500 dark:text-gray-400">Stock</p>
            <p className={`text-xl font-bold mt-1 ${product.stock < 20 ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"}`}>
              {formatNumber(product.stock)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {formatCurrency(totalRevenue)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500 dark:text-gray-400">Units Sold</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {formatNumber(totalSold)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {product.description && (
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Description</h2>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">{product.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Sales Chart */}
      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Sales Over Time
          </h2>
        </CardHeader>
        <CardContent>
          {salesData.length > 0 ? (
            <RevenueChart data={salesData} />
          ) : (
            <div className="h-72 flex items-center justify-center text-gray-400 dark:text-gray-500">
              No sales data yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
