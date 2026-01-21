import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
  color?: "default" | "blue" | "green" | "orange" | "purple";
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendUp, 
  className,
  color = "default"
}: StatCardProps) {
  const colorMap = {
    default: "bg-primary/10 text-primary",
    blue: "bg-blue-500/10 text-blue-500",
    green: "bg-green-500/10 text-green-500",
    orange: "bg-orange-500/10 text-orange-500",
    purple: "bg-purple-500/10 text-purple-500",
  };

  return (
    <Card className={`overflow-hidden transition-all hover:shadow-md border-muted ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {trend && (
          <p className={`text-xs mt-1 ${trendUp ? "text-green-500" : "text-red-500"}`}>
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
