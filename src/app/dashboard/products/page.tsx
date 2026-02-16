"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/Card";
import Link from "next/link";

interface ProductRow {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  total_revenue: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    // Get all products
    const { data: productData } = await supabase
      .from("products")
      .select("id, name, category, price, stock")
      .order("name");

    // Get revenue per product from order_items
    const { data: revenueData } = await supabase
      .from("order_items")
      .select("product_id, quantity, unit_price");

    const revenueMap = new Map<string, number>();
    (revenueData || []).forEach((item) => {
      const rev = Number(item.quantity) * Number(item.unit_price);
      revenueMap.set(item.product_id, (revenueMap.get(item.product_id) || 0) + rev);
    });

    const enriched: ProductRow[] = (productData || []).map((p) => ({
      ...p,
      price: Number(p.price),
      total_revenue: revenueMap.get(p.id) || 0,
    }));

    setProducts(enriched);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filtered = search.trim()
    ? products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    : products;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          View product performance and inventory
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-400 dark:text-gray-500">Loading products...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-400 dark:text-gray-500">
              No products found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left font-medium text-gray-500 dark:text-gray-400 px-5 py-3">Product</th>
                    <th className="text-left font-medium text-gray-500 dark:text-gray-400 px-5 py-3">Category</th>
                    <th className="text-right font-medium text-gray-500 dark:text-gray-400 px-5 py-3">Price</th>
                    <th className="text-right font-medium text-gray-500 dark:text-gray-400 px-5 py-3">Stock</th>
                    <th className="text-right font-medium text-gray-500 dark:text-gray-400 px-5 py-3">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-gray-50 dark:border-gray-800/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <Link
                          href={`/dashboard/products/${product.id}`}
                          className="font-medium text-brand-500 hover:text-brand-600"
                        >
                          {product.name}
                        </Link>
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-gray-900 dark:text-white">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span
                          className={
                            product.stock < 20
                              ? "text-red-600 dark:text-red-400 font-medium"
                              : "text-gray-600 dark:text-gray-400"
                          }
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-gray-900 dark:text-white">
                        {formatCurrency(product.total_revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
