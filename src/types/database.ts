export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  stock: number;
  image_url: string | null;
  created_at: string;
}

export interface Customer {
  id: string;
  user_id: string;
  name: string;
  email: string;
  address: string | null;
  created_at: string;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;
  user_id: string;
  customer_id: string;
  order_number: string;
  status: OrderStatus;
  total: number;
  created_at: string;
  customer?: Customer;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product?: Product;
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

export interface DashboardKPIs {
  total_revenue: number;
  total_orders: number;
  avg_order_value: number;
  conversion_rate: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
}

export interface OrdersDataPoint {
  date: string;
  count: number;
}

export interface CategorySales {
  category: string;
  revenue: number;
}

export interface TopProduct {
  id: string;
  name: string;
  category: string;
  revenue: number;
  quantity_sold: number;
}

export type DateRange = "today" | "7d" | "30d" | "90d" | "custom";

export interface DateRangeValue {
  from: string;
  to: string;
  preset: DateRange;
}
