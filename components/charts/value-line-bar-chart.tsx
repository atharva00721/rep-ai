"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, Cell, XAxis, ReferenceLine } from "recharts";
import React from "react";
import { AnimatePresence } from "motion/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { JetBrains_Mono } from "next/font/google";
import { useMotionValueEvent, useSpring } from "motion/react";

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const CHART_MARGIN = 35;

export interface ValueLineBarChartDataPoint {
  label: string;
  value: number;
}

const chartConfig = {
  value: {
    label: "Value",
    color: "var(--secondary-foreground)",
  },
} satisfies ChartConfig;

interface ValueLineBarChartProps {
  data: ValueLineBarChartDataPoint[];
  title?: string;
  valueLabel?: string;
  changePercent?: string;
  changeDescription?: string;
}

export function ValueLineBarChart({
  data,
  title,
  valueLabel = "Value",
  changePercent = "0%",
  changeDescription = "vs. last period",
}: ValueLineBarChartProps) {
  const [activeIndex, setActiveIndex] = React.useState<number | undefined>(
    undefined
  );

  const maxValueIndex = React.useMemo(() => {
    if (data.length === 0) return { index: 0, value: 0 };
    if (activeIndex !== undefined) {
      return { index: activeIndex, value: data[activeIndex].value };
    }
    return data.reduce(
      (max, item, index) => {
        return item.value > max.value ? { index, value: item.value } : max;
      },
      { index: 0, value: 0 }
    );
  }, [activeIndex, data]);

  const maxValueIndexSpring = useSpring(maxValueIndex.value, {
    stiffness: 100,
    damping: 20,
  });

  const [springyValue, setSpringyValue] = React.useState(maxValueIndex.value);

  useMotionValueEvent(maxValueIndexSpring, "change", (latest) => {
    setSpringyValue(Number(latest.toFixed(0)));
  });

  React.useEffect(() => {
    maxValueIndexSpring.set(maxValueIndex.value);
  }, [maxValueIndex.value, maxValueIndexSpring]);

  const chartData = data.map((d) => ({ month: d.label, value: d.value }));

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title ?? valueLabel}</CardTitle>
          <CardDescription>{changeDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span
            className={cn(jetBrainsMono.className, "text-2xl tracking-tighter")}
          >
            {maxValueIndex.value.toLocaleString()}
          </span>
          <Badge variant="secondary">
            <TrendingUp className="h-4 w-4" />
            <span>{changePercent}</span>
          </Badge>
        </CardTitle>
        <CardDescription>{changeDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              onMouseLeave={() => setActiveIndex(undefined)}
              margin={{
                left: CHART_MARGIN,
              }}
            >
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => (value?.length >= 3 ? value.slice(0, 3) : value)}
              />
              <Bar dataKey="value" fill="var(--color-value)" radius={4}>
                {chartData.map((_, index) => (
                  <Cell
                    className="duration-200"
                    opacity={index === maxValueIndex.index ? 1 : 0.2}
                    key={index}
                    onMouseEnter={() => setActiveIndex(index)}
                  />
                ))}
              </Bar>
              <ReferenceLine
                opacity={0.4}
                y={springyValue}
                stroke="var(--secondary-foreground)"
                strokeWidth={1}
                strokeDasharray="3 3"
                label={<CustomReferenceLabel value={maxValueIndex.value} />}
              />
            </BarChart>
          </ChartContainer>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

interface CustomReferenceLabelProps {
  viewBox?: {
    x?: number;
    y?: number;
  };
  value: number;
}

const CustomReferenceLabel: React.FC<CustomReferenceLabelProps> = (props) => {
  const { viewBox, value } = props;
  const x = viewBox?.x ?? 0;
  const y = viewBox?.y ?? 0;

  const width = React.useMemo(() => {
    const characterWidth = 8;
    const padding = 10;
    return value.toString().length * characterWidth + padding;
  }, [value]);

  return (
    <>
      <rect
        x={x - CHART_MARGIN}
        y={y - 9}
        width={width}
        height={18}
        fill="var(--secondary-foreground)"
        rx={4}
      />
      <text
        fontWeight={600}
        x={x - CHART_MARGIN + 6}
        y={y + 4}
        fill="var(--primary-foreground)"
      >
        {value.toLocaleString()}
      </text>
    </>
  );
};
