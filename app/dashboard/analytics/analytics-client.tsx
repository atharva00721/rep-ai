"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, MessageSquare, Users, TrendingUp } from "lucide-react";
import { useAnalyticsStore } from "@/lib/stores/analytics-store";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { ValueLineBarChart } from "@/components/charts/value-line-bar-chart";

interface AnalyticsSummary {
  totalPageViews: number;
  totalChatSessions: number;
  totalChatMessages: number;
  uniqueVisitors: number;
}

interface DailyAnalytics {
  date: string;
  pageViews: number;
  chatSessions: number;
  chatMessages: number;
}

interface AnalyticsData {
  summary: AnalyticsSummary;
  daily: DailyAnalytics[];
  period: string;
}

type Period = "24h" | "7d" | "30d";

const periodLabels: Record<Period, string> = {
  "24h": "Last 24 hours",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
};

function fetchAnalytics(period: Period): Promise<AnalyticsData> {
  return fetch(`/api/analytics/dashboard?period=${period}`).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

function ChartCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent className="h-[300px]">
        <Skeleton className="h-full w-full" />
      </CardContent>
    </Card>
  );
}

export function AnalyticsClient() {
  const { period, setPeriod } = useAnalyticsStore();
  
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["analytics", period],
    queryFn: () => fetchAnalytics(period),
    staleTime: 30 * 1000,
  });

  const handlePeriodChange = (newPeriod: Period) => {
    setPeriod(newPeriod);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track how visitors interact with your portfolio and AI agent.
          </p>
        </div>
        <div className="flex gap-2">
          {(["24h", "7d", "30d"] as Period[]).map((p) => (
            <Button
              key={p}
              variant={period === p ? "default" : "outline"}
              size="sm"
              onClick={() => handlePeriodChange(p)}
            >
              {periodLabels[p]}
              {isFetching && period === p && (
                <span className="ml-2 h-2 w-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : data ? (
          <>
            <Card className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.summary.totalPageViews.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Unique visitors: {data.summary.uniqueVisitors.toLocaleString()}
                </p>
              </CardContent>
              <div className="absolute bottom-0 left-0 right-0 h-1" />
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chat Sessions</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.summary.totalChatSessions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Total messages: {data.summary.totalChatMessages.toLocaleString()}
                </p>
              </CardContent>
              <div className="absolute bottom-0 left-0 right-0 h-1" />
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Messages per Session</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.summary.totalChatSessions > 0
                    ? (data.summary.totalChatMessages / data.summary.totalChatSessions).toFixed(1)
                    : "0"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Per visitor conversation
                </p>
              </CardContent>
              <div className="absolute bottom-0 left-0 right-0 h-1" />
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.summary.uniqueVisitors > 0
                    ? Math.round((data.summary.totalChatSessions / data.summary.uniqueVisitors) * 100)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Visitors who started a chat
                </p>
              </CardContent>
              <div className="absolute bottom-0 left-0 right-0 h-1" />
            </Card>
          </>
        ) : null}
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <ChartCardSkeleton />
          <ChartCardSkeleton />
        </div>
      ) : data ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Traffic & Chat Trends
              </CardTitle>
              <CardDescription>Page views and chat sessions over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {data.daily.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No data available</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.daily} className="font-medium">
                    <defs>
                      <linearGradient id="colorPageViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorChatSessions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value: string) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      className="text-xs text-muted-foreground"
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis 
                      className="text-xs text-muted-foreground"
                      axisLine={false}
                      tickLine={false}
                      dx={-10}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))", 
                        borderRadius: "8px" 
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: "20px" }}
                      formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="pageViews" 
                      name="Page Views"
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorPageViews)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="chatSessions" 
                      name="Chat Sessions"
                      stroke="#10b981" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorChatSessions)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <ValueLineBarChart
            data={data.daily.map((d) => ({
              label: new Date(d.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
              value: d.chatMessages,
            }))}
            valueLabel="Messages" 
            changeDescription="Total chat messages per day"
          />
        </div>
      ) : null}
    </div>
  );
}
