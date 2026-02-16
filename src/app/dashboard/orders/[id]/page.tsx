"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import Link from "next/link";

interface OrderDetail {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  customers: { name: string; email: string; address: string | null } | null;
  order_items: {
    id: string;
    quantity: number;
    unit_price: number;
    products: { name: string; category: string } | null;
  }[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      const supabase = createClient();
      const { data } = await supabase
        .from("orders")
        .select(
          "id, order_number, status, total, created_at, customers(name, email, address), order_items(id, quantity, unit_price, products(name, category))"
        )
        .eq("id", params.id as string)
        .single();

      setOrder(data as unknown as OrderDetail);
      setLoading(false);
    }
    fetchOrder();
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        Order not found.{" "}
        <Link href="/dashboard/orders" className="text-brand-500 hover:text-brand-600">
          Back to orders
        </Link>
      </div>
    );
  }

  const subtotal = order.order_items.reduce(
    (sum, item) => sum + item.quantity * Number(item.unit_price),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <Link
            href="/dashboard/orders"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 inline-flex items-center gap-1 mb-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to Orders
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {order.order_number}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Placed on {formatDate(order.created_at)}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Items ({order.order_items.length})
              </h2>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <th className="text-left font-medium text-gray-500 dark:text-gray-400 px-5 py-3">Product</th>
                      <th className="text-right font-medium text-gray-500 dark:text-gray-400 px-5 py-3">Price</th>
                      <th className="text-right font-medium text-gray-500 dark:text-gray-400 px-5 py-3">Qty</th>
                      <th className="text-right font-medium text-gray-500 dark:text-gray-400 px-5 py-3">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.order_items.map((item) => (
                      <tr key={item.id} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                        <td className="px-5 py-3">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {item.products?.name || "Unknown"}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {item.products?.category || ""}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right text-gray-600 dark:text-gray-400">
                          {formatCurrency(Number(item.unit_price))}
                        </td>
                        <td className="px-5 py-3 text-right text-gray-600 dark:text-gray-400">
                          {item.quantity}
                        </td>
                        <td className="px-5 py-3 text-right font-medium text-gray-900 dark:text-white">
                          {formatCurrency(item.quantity * Number(item.unit_price))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-200 dark:border-gray-700">
                      <td colSpan={3} className="px-5 py-3 text-right font-semibold text-gray-900 dark:text-white">
                        Total
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-gray-900 dark:text-white">
                        {formatCurrency(subtotal)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Info */}
        <div>
          <Card>
            <CardHeader>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Customer
              </h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</p>
                <p className="mt-0.5 text-sm text-gray-900 dark:text-white">
                  {order.customers?.name || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</p>
                <p className="mt-0.5 text-sm text-gray-900 dark:text-white">
                  {order.customers?.email || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Address</p>
                <p className="mt-0.5 text-sm text-gray-900 dark:text-white">
                  {order.customers?.address || "—"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Order Summary
              </h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Status</span>
                <StatusBadge status={order.status} />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Items</span>
                <span className="text-gray-900 dark:text-white">{order.order_items.length}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-gray-100 dark:border-gray-800 pt-3">
                <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {formatCurrency(Number(order.total))}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
