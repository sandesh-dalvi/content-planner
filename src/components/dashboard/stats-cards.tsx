import { CheckCircle, Clock, FileText, TrendingUp } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  total: number;
  published: number;
  scheduled: number;
}

const stats = (total: number, published: number, scheduled: number) => [
  {
    label: "Total Posts",
    value: total,
    icon: FileText,
    color: "text-primary",
    bg: "bg-primary/10",
    desc: "across all statuses",
  },
  {
    label: "Published",
    value: published,
    icon: CheckCircle,
    color: "text-success",
    bg: "bg-success/10",
    desc: "posts live",
  },
  {
    label: "Scheduled",
    value: scheduled,
    icon: Clock,
    color: "text-info",
    bg: "bg-info/10",
    desc: "posts queued",
  },
  {
    label: "Remaining",
    value: Math.max(0, total - published),
    icon: TrendingUp,
    color: "text-warning",
    bg: "bg-warning/10",
    desc: "not yet published",
  },
];

export function StatsCards({ total, published, scheduled }: StatsCardsProps) {
  return (
    <div className=" grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats(total, published, scheduled).map((s) => (
        <Card key={s.label}>
          <CardContent className=" p-6">
            <div className=" flex items-center justify-between mb-4">
              <p className=" text-sm font-medium text-muted-foreground">
                {s.label}
              </p>
              <div className={cn("rounded-lg p-2", s.bg)}>
                <s.icon className={cn("h-4 w-4", s.color)} />
              </div>
            </div>
            <p className=" text-3xl font-bold tracking-tight">{s.value}</p>
            <p className=" mt-1 text-xs text-muted-foreground">{s.desc}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
