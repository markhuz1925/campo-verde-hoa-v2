// src/routes/_app/transactions/index.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import type { Purchase, Sticker } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Calendar, DollarSign, Package, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

export const Route = createFileRoute("/_app/transactions/")({
  component: TransactionsPage,
});

// Fetch all purchases with product details
async function fetchPurchasesWithProducts(): Promise<
  (Purchase & { product?: Sticker })[]
> {
  const { data: purchases, error } = await supabase
    .from("purchases")
    .select(
      `
      *,
      product:products(*)
    `
    )
    .order("purchase_date", { ascending: false });

  if (error) throw error;
  return purchases as (Purchase & { product?: Sticker })[];
}

function TransactionsPage() {
  // Fetch purchases data
  const {
    data: purchases,
    isLoading,
    isError,
    error,
  } = useQuery<(Purchase & { product?: Sticker })[], Error>({
    queryKey: ["purchasesWithProducts"],
    queryFn: fetchPurchasesWithProducts,
  });

  // Process data for charts
  const chartData = useMemo(() => {
    if (!purchases) return { monthlyIncome: [], stickerTypes: [], totalStats: {} };

    // Monthly income data
    const monthlyMap = new Map<string, number>();
    
    // Sticker types data
    const stickerMap = new Map<string, { income: number; count: number }>();
    
    let totalRevenue = 0;
    let totalTransactions = 0;

    purchases.forEach((purchase) => {
      const date = new Date(purchase.purchase_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      // Monthly income
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + purchase.amount_paid);
      
      // Sticker types
      const stickerName = purchase.product?.name || 'Unknown';
      const current = stickerMap.get(stickerName) || { income: 0, count: 0 };
      stickerMap.set(stickerName, {
        income: current.income + purchase.amount_paid,
        count: current.count + 1,
      });
      
      totalRevenue += purchase.amount_paid;
      totalTransactions += 1;
    });

    // Convert maps to arrays and sort
    const monthlyIncome = Array.from(monthlyMap.entries())
      .map(([month, income]) => ({ month, income }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const stickerTypes = Array.from(stickerMap.entries())
      .map(([name, data]) => ({ name, income: data.income, count: data.count }))
      .sort((a, b) => b.income - a.income);

    return {
      monthlyIncome,
      stickerTypes,
      totalStats: {
        totalRevenue,
        totalTransactions,
        averageTransaction: totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
        topSticker: stickerTypes[0]?.name || 'N/A',
      },
    };
  }, [purchases]);

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading transactions...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-red-500">Error: {error?.message}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transactions Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor income and analyze sticker purchase trends
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₱{chartData.totalStats.totalRevenue?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              From all sticker sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {chartData.totalStats.totalTransactions?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Sticker purchases made
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Transaction</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₱{chartData.totalStats.averageTransaction?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Per sticker purchase
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Sticker Type</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {chartData.totalStats.topSticker}
            </div>
            <p className="text-xs text-muted-foreground">
              Highest revenue generator
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Income Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Income Trend</CardTitle>
            <CardDescription>
              Track revenue growth over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.monthlyIncome}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`₱${Number(value).toLocaleString()}`, "Income"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#0088FE"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sticker Types Revenue */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Sticker Type</CardTitle>
            <CardDescription>
              Income breakdown by sticker categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.stickerTypes}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`₱${Number(value).toLocaleString()}`, "Income"]}
                  />
                  <Bar dataKey="income" fill="#00C49F" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sticker Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Sticker Distribution</CardTitle>
            <CardDescription>
              Percentage of sales by sticker type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.stickerTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {chartData.stickerTypes.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [
                      `${value} sales`,
                      name
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Summary</CardTitle>
            <CardDescription>
              Latest purchase activity overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chartData.stickerTypes.slice(0, 5).map((sticker, index) => (
                <div key={sticker.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium">{sticker.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">₱{sticker.income.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">
                      {sticker.count} sale{sticker.count !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

