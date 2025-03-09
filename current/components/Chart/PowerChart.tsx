"use client"

import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

// const chartData = [
//     { date: "2023-11-01", ac_power: 2177.76 },
//     { date: "2023-11-02", ac_power: 2177.76 },
//     { date: "2023-11-03", ac_power: 2177.76 },
//     { date: "2023-11-04", ac_power: 2177.76 },
//     { date: "2023-11-05", ac_power: 2177.76 },
//     { date: "2023-11-06", ac_power: 2177.76 },
//     { date: "2023-11-07", ac_power: 2177.76 },
//     { date: "2023-11-08", ac_power: 2177.76 },
//     { date: "2023-11-09", ac_power: 2177.76 },
//     { date: "2023-11-10", ac_power: 2177.76 },
//     { date: "2023-11-11", ac_power: 2177.76 },
//     { date: "2023-11-12", ac_power: 2177.76 },
//     { date: "2023-11-13", ac_power: 2177.76 },
//     { date: "2023-11-14", ac_power: 2177.76 },
//     { date: "2023-11-15", ac_power: 2177.76 },
//     { date: "2023-11-16", ac_power: 2177.76 },
//     { date: "2023-11-17", ac_power: 2177.76 },
//     { date: "2023-11-18", ac_power: 2177.76 },
//     { date: "2023-11-19", ac_power: 2177.76 },
//     { date: "2023-11-20", ac_power: 2177.76 },
//     { date: "2023-11-21", ac_power: 2177.76 },
//     { date: "2023-11-22", ac_power: 2177.76 },
//     { date: "2023-11-23", ac_power: 2177.76 },
//     { date: "2023-11-24", ac_power: 2177.76 },
//     { date: "2023-11-25", ac_power: 2177.76 },
//     { date: "2023-11-26", ac_power: 2177.76 },
//     { date: "2023-11-27", ac_power: 2177.76 },
//     { date: "2023-11-28", ac_power: 2177.76 },
//     { date: "2023-11-29", ac_power: 2177.76 },
//     { date: "2023-11-30", ac_power: 2177.76 },
//     { date: "2023-12-01", ac_power: 2177.76 },
//     { date: "2023-12-02", ac_power: 2177.76 },
//     { date: "2023-12-03", ac_power: 2177.76 },
//     { date: "2023-12-04", ac_power: 2177.76 },
// ]

const chartConfig = {
    ac_power: {
        label: "AC Power",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig

export default function PowerChart({ data }: { data: any }) {
    const chartData = data 
    console.log(chartData)

    if (!chartData) {
        return null
    }
    return (
        <Card className="border border-gray-200 w-full">
            <CardHeader>
                <CardTitle>Area Chart - AC Power</CardTitle>
                <CardDescription>
                    Showing AC Power for the given dates
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <AreaChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="metric_date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => new Date(value).toLocaleDateString("EN-IN")}
                        />
                        <YAxis dataKey="ac_power" tickLine={false} axisLine={false} unit={"W"} />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                        <Area
                            dataKey="ac_power"
                            type="natural"
                            fill="var(--color-ac_power)"
                            fillOpacity={0.4}
                            stroke="var(--color-ac_power)"
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
            <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm">
                    <div className="grid gap-2">
                        <div className="flex items-center gap-2 font-medium leading-none">
                            Total AC Power: {chartData.reduce((acc, item) => acc + item.ac_power, 0).toFixed(2)} W
                        </div>
                        <div className="flex items-center gap-2 leading-none text-muted-foreground">
                            Date Range: {new Date(chartData[0].metric_date).toLocaleDateString("EN-IN")}-{new Date(chartData[chartData.length - 1].metric_date).toLocaleDateString("EN-IN")}
                            </div>
                    </div>
                </div>
            </CardFooter>
        </Card>
    )
}
