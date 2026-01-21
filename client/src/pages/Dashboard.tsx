import { useDashboardStats } from "@/hooks/use-stats";
import Layout from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Package, 
  AlertTriangle,
  TrendingUp 
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (isLoading || !stats) {
    return (
      <Layout>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 h-96">
          <Skeleton className="h-full rounded-xl" />
          <Skeleton className="h-full rounded-xl" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Inward Today"
          value={stats.totalInwardToday}
          icon={ArrowDownToLine}
          color="green"
          trend="+12% from yesterday"
          trendUp={true}
        />
        <StatCard
          title="Total Outward Today"
          value={stats.totalOutwardToday}
          icon={ArrowUpFromLine}
          color="blue"
          trend="+5% from yesterday"
          trendUp={true}
        />
        <StatCard
          title="Total Stock Items"
          value={stats.totalItems}
          icon={Package}
          color="purple"
        />
        <StatCard
          title="Low Stock Alerts"
          value={stats.lowStockItems}
          icon={AlertTriangle}
          color="orange"
          trend={stats.lowStockItems > 0 ? "Action needed" : "Healthy"}
          trendUp={stats.lowStockItems === 0}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card className="shadow-lg shadow-black/5 border-border/50">
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="inward" name="Inward" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="outward" name="Outward" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg shadow-black/5 border-border/50">
          <CardHeader>
            <CardTitle>Inventory by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.inventoryByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.inventoryByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4 flex-wrap">
              {stats.inventoryByCategory.map((entry, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-muted-foreground">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-primary">Total Inventory Valuation</h3>
            <p className="text-muted-foreground">Estimated value of current stock on hand</p>
          </div>
          <div className="text-3xl font-bold font-mono text-primary">
            ${stats.valuation.toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}
