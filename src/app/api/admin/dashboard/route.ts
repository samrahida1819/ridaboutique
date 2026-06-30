import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-api-server";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);

  if (admin instanceof NextResponse) {
    return admin;
  }

  const supabase = admin.supabase;
  const [orders, pending, products, customers, recent, lowStock, recentCustomers] = await Promise.all([
    supabase.from("orders").select("total", { count: "exact" }),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "Pending"),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
    supabase
      .from("orders")
      .select("order_number, full_name, total, status, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("products")
      .select("id, name, slug, stock, active")
      .lte("stock", 5)
      .order("stock", { ascending: true })
      .limit(8),
    supabase
      .from("profiles")
      .select("id, full_name, email, role, created_at")
      .order("created_at", { ascending: false })
      .limit(6)
  ]);

  const firstError = orders.error || pending.error || products.error || customers.error || recent.error || lowStock.error || recentCustomers.error;

  if (firstError) {
    return NextResponse.json({ error: firstError.message }, { status: 400 });
  }

  // These modules may not exist before the latest migration is run, so tolerate errors.
  const [pendingCustomOrders, pendingReviews, recentCustomOrders] = await Promise.all([
    supabase.from("custom_orders").select("id", { count: "exact", head: true }).eq("status", "Pending"),
    supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", "Pending"),
    supabase
      .from("custom_orders")
      .select("reference, full_name, product_type, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5)
  ]);

  return NextResponse.json({
    metrics: {
      pendingOrders: pending.count || 0,
      totalCustomers: customers.count || 0,
      totalOrders: orders.count || orders.data?.length || 0,
      totalProducts: products.count || 0,
      totalRevenue: (orders.data || []).reduce((sum, order) => sum + Number(order.total || 0), 0),
      pendingCustomOrders: pendingCustomOrders.error ? 0 : pendingCustomOrders.count || 0,
      pendingReviews: pendingReviews.error ? 0 : pendingReviews.count || 0
    },
    lowStockProducts: lowStock.data || [],
    recentCustomers: recentCustomers.data || [],
    recentOrders: recent.data || [],
    recentCustomOrders: recentCustomOrders.error ? [] : recentCustomOrders.data || []
  });
}
