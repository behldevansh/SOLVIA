"use client";

import { format } from "date-fns";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
  ReferenceArea,
  ReferenceDot,
  Legend,
  ResponsiveContainer,
  Label
} from "recharts";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DateRange } from "react-day-picker";

function formatPriceINR(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "₹0.00";
  }
  
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return formatter.format(amount);
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black bg-opacity-80 p-2 rounded border border-gray-700">
        <p className="label text-white">{`Date: ${format(new Date(label), "MMM d, yyyy")}`}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.name.includes("Financial") || entry.name.includes("Loss") ? 
              formatPriceINR(entry.value) : entry.value.toFixed(2)}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom component for reference line labels to ensure visibility
const CustomizedLabel = ({ viewBox, value, fill, fontSize, fontWeight, offset = 0 }) => {
  const { x, y, width, height } = viewBox;
  return (
    <text 
      x={x} 
      y={y - offset} 
      fill={fill} 
      fontSize={fontSize} 
      fontWeight={fontWeight}
      textAnchor="middle"
      dominantBaseline="middle"
    >
      {value}
    </text>
  );
};

export default function PowerAndDustCharts({ formData }) {
  const [powerData, setPowerData] = useState(null);
  const [dustData, setDustData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cleaningDates, setCleaningDates] = useState([]);

  useEffect(() => {
    async function fetchData() {
      if (
        !formData ||
        !formData.from ||
        !formData.to ||
        !formData.last_cleaning_date
      )
        return;

      setLoading(true);
      try {
        const powerResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/predict/range`,
          {
            method: "POST",
            body: JSON.stringify({
              start_date: format(formData.from, "yyyy-MM-dd"),
              end_date: format(formData.to, "yyyy-MM-dd"),
            }),
            headers: { "Content-Type": "application/json" },
          }
        );
        const powerData = await powerResponse.json();
        setPowerData(powerData.data);

        const dustResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/predict/dust`,
          {
            method: "POST",
            body: JSON.stringify({
              start_date: format(formData.from, "yyyy-MM-dd"),
              end_date: format(formData.to, "yyyy-MM-dd"),
              last_cleaning_date: format(
                formData.last_cleaning_date,
                "yyyy-MM-dd"
              ),
              cleaning_type: formData.cleaning_type || "onetime",
            }),
            headers: { "Content-Type": "application/json" },
          }
        );
        const dustData = await dustResponse.json();
        setDustData(dustData);

        generateCleaningDates(
          formData.last_cleaning_date,
          formData.cleaning_type,
          formData.to
        );
      } catch (error) {
        console.error("Error fetching data:", error);
        setPowerData(null);
        setDustData(null);
      } finally {
        setLoading(false);
      }
    }

    function generateCleaningDates(lastCleaningDate, cleaningType, endDate) {
      if (!lastCleaningDate || !cleaningType || !endDate) return [];

      const dates = [];
      let currentDate = new Date(lastCleaningDate);
      const end = new Date(endDate);

      dates.push(format(currentDate, "yyyy-MM-dd"));

      while (currentDate < end) {
        const nextDate = new Date(currentDate);

        if (cleaningType === "weekly") {
          nextDate.setDate(nextDate.getDate() + 7);
        } else if (cleaningType === "monthly") {
          nextDate.setMonth(nextDate.getMonth() + 1);
        } else {
          break;
        }

        if (nextDate <= end) {
          dates.push(format(nextDate, "yyyy-MM-dd"));
          currentDate = nextDate;
        } else {
          break;
        }
      }

      setCleaningDates(dates);
    }

    fetchData();
  }, [formData]);

  if (loading) return <div className="text-center py-8">Loading data...</div>;
  if (!powerData || !dustData)
    return <div className="text-center py-8">No data available.</div>;

  const lastCleaningDate = formData?.last_cleaning_date
    ? format(formData.last_cleaning_date, "yyyy-MM-dd")
    : null;
  const optimalCleaningDate =
    dustData.cleaning_recommendation?.optimal_cleaning_date || null;

  const potentialSavings =
    dustData.cleaning_recommendation?.cost_comparison?.potential_savings || 0;
  const absolutePotentialSavings = Math.abs(potentialSavings);

  const lastCleaningPowerDataPoint = powerData?.find(
    (point) => point.metric_date === lastCleaningDate
  );
  const lastCleaningDustDataPoint = dustData.forecast?.find(
    (point) => point.Date === lastCleaningDate
  );

  // Find max values for proper scaling
  const maxACPower = Math.max(...powerData.map(d => d.ac_power || 0));
  const maxDust = Math.max(...dustData.forecast.map(d => d.Dust || 0));
  const maxPowerLoss = Math.max(...dustData.forecast.map(d => d.Power_Loss || 0));
  const maxFinancialLoss = Math.max(...dustData.forecast.map(d => d.Financial_Loss || 0));

  return (
    <div className="my-8 bg-[#1F1F1F]">
      <div className="max-w-5xl mx-auto">
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle>Cleaning Recommendations</CardTitle>
            <CardDescription>
              Optimal and regular cleaning dates.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="">
              Last Cleaning Date:{" "}
              {lastCleaningDate
                ? format(new Date(lastCleaningDate), "MMMM d, yyyy")
                : "Not provided"}
            </p>
            <p className="">
              Optimal Cleaning Date:{" "}
              {optimalCleaningDate
                ? format(new Date(optimalCleaningDate), "MMMM d, yyyy")
                : "Not provided"}
            </p>
            <p className="">
              Regular Cleaning Dates:{" "}
              <span className="inline-block break-words whitespace-normal">
                {cleaningDates.length > 1
                  ? cleaningDates
                      .slice(1)
                      .map((date) => format(new Date(date), "MMM d, yyyy"))
                      .join(", ")
                  : "Not scheduled"}
              </span>
            </p>
            <p className="">
              Optimized Cleaning Dates:{" "}
              {dustData.cleaning_recommendation?.optimized_cleaning_dates
                ?.map((date) => format(new Date(date), "MMM d, yyyy"))
                .join(", ") || "None"}
            </p>
          </CardContent>
          <CardFooter className="flex flex-col text-center">
            <p className="text-red-500">
              Total Loss Without Cleaning: {formatPriceINR(
                dustData.cleaning_recommendation?.cost_comparison?.total_loss_without_cleaning
              )}
            </p>
            <p className="text-green-500">
              Potential Savings: {formatPriceINR(absolutePotentialSavings)}
            </p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>AC Power Over Time</CardTitle>
            <CardDescription className="text-center">
              Tracking power generation over time.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex justify-center">
              <AreaChart
                width={600}
                height={300}
                data={powerData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 12,
                  bottom: 5,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="metric_date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return isNaN(date.getTime())
                      ? value
                      : format(date, "MM/dd");
                  }}
                />
                <YAxis
                  dataKey="ac_power"
                  tickLine={false}
                  axisLine={false}
                  unit="W"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  dataKey="ac_power"
                  type="natural"
                  fill="var(--color-ac_power, #fbc3b0)"
                  fillOpacity={0.4}
                  stroke="#fbc3b0"
                  name="AC Power"
                />
                
                {optimalCleaningDate && (
                  <ReferenceLine
                    x={optimalCleaningDate}
                    stroke="#00ff00"
                    strokeWidth={2}
                    isFront={true}
                  >
                    <Label 
                      value="Optimal Cleaning" 
                      position="top" 
                      fill="#00ff00"
                      fontSize={12}
                      fontWeight="bold"
                      offset={15}
                    />
                  </ReferenceLine>
                )}
                
                {lastCleaningDate && lastCleaningPowerDataPoint && (
                  <ReferenceDot
                    x={lastCleaningDate}
                    y={lastCleaningPowerDataPoint.ac_power}
                    r={7}
                    fill="#FF0000"
                    stroke="none"
                    isFront={true}
                  >
                    <Label 
                      value="Last Cleaning" 
                      position="top" 
                      fill="#FF0000"
                      fontSize={12}
                      fontWeight="bold"
                      offset={15}
                    />
                  </ReferenceDot>
                )}
                
                {cleaningDates.slice(1).map((date, index) => (
                  <ReferenceLine
                    key={`reg-clean-${index}`}
                    x={date}
                    stroke="#FF0000"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    isFront={true}
                  >
                    <Label 
                      value="Regular" 
                      position="top" 
                      fill="#FF0000"
                      fontSize={10}
                      offset={15}
                    />
                  </ReferenceLine>
                ))}
              </AreaChart>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader className="text-center">
            <CardTitle>Dust Accumulation & Power Loss</CardTitle>
            <CardDescription>
              Effect of dust on power generation.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex justify-center">
              <AreaChart 
                width={600} 
                height={300} 
                data={dustData.forecast}
                margin={{
                  top: 25,
                  right: 30,
                  left: 12,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="Date" 
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return isNaN(date.getTime())
                      ? value
                      : format(date, "MM/dd");
                  }}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="Dust"
                  fill="#ffc658"
                  stroke="#ffc658"
                  name="Dust"
                />
                <Area
                  type="monotone"
                  dataKey="Power_Loss"
                  fill="#ff7300"
                  stroke="#ff7300"
                  name="Power Loss"
                />
                
                {optimalCleaningDate && (
                  <ReferenceLine
                    x={optimalCleaningDate}
                    stroke="#00ff00"
                    strokeWidth={2}
                    isFront={true}
                  >
                    <Label 
                      value="Optimal Cleaning" 
                      position="top" 
                      fill="#00ff00"
                      fontSize={12}
                      fontWeight="bold"
                      offset={15}
                    />
                  </ReferenceLine>
                )}
                
                {lastCleaningDate && lastCleaningDustDataPoint && (
                  <ReferenceDot
                    x={lastCleaningDate}
                    y={lastCleaningDustDataPoint.Dust || 0}
                    r={7}
                    fill="#FF0000"
                    stroke="none"
                    isFront={true}
                  >
                    <Label 
                      value="Last Cleaning" 
                      position="top" 
                      fill="#FF0000"
                      fontSize={12}
                      fontWeight="bold"
                      offset={15}
                    />
                  </ReferenceDot>
                )}
                
                {cleaningDates.slice(1).map((date, index) => (
                  <ReferenceLine
                    key={`dust-clean-${index}`}
                    x={date}
                    stroke="#FF0000"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    isFront={true}
                  >
                    <Label 
                      value="Regular" 
                      position="top" 
                      fill="#FF0000"
                      fontSize={10}
                      offset={15}
                    />
                  </ReferenceLine>
                ))}
              </AreaChart>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader className="text-center">
            <CardTitle>Financial Loss Over Time</CardTitle>
            <CardDescription>
              Monitoring monetary losses due to power loss.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex justify-center">
              <AreaChart 
                width={600} 
                height={300} 
                data={dustData.forecast}
                margin={{
                  top: 25,
                  right: 30,
                  left: 12,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="Date" 
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return isNaN(date.getTime())
                      ? value
                      : format(date, "MM/dd");
                  }}
                />
                <YAxis 
                  tickFormatter={(value) => {
                    return new Intl.NumberFormat('en-IN', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(value);
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="Financial_Loss"
                  fill="#82ca9d"
                  stroke="#82ca9d"
                  name="Financial Loss"
                />
                
                {optimalCleaningDate && (
                  <ReferenceLine
                    x={optimalCleaningDate}
                    stroke="#00ff00"
                    strokeWidth={2}
                    isFront={true}
                  >
                    <Label 
                      value="Optimal Cleaning" 
                      position="top" 
                      fill="#00ff00"
                      fontSize={12}
                      fontWeight="bold"
                      offset={15}
                    />
                  </ReferenceLine>
                )}
                
                {lastCleaningDate && lastCleaningDustDataPoint && (
                  <ReferenceDot
                    x={lastCleaningDate}
                    y={lastCleaningDustDataPoint.Financial_Loss || 0}
                    r={7}
                    fill="#FF0000"
                    stroke="none"
                    isFront={true}
                  >
                    <Label 
                      value="Last Cleaning" 
                      position="top" 
                      fill="#FF0000"
                      fontSize={12}
                      fontWeight="bold"
                      offset={15}
                    />
                  </ReferenceDot>
                )}
                
                {cleaningDates.slice(1).map((date, index) => (
                  <ReferenceLine
                    key={`fin-clean-${index}`}
                    x={date}
                    stroke="#FF0000"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    isFront={true}
                  >
                    <Label 
                      value="Regular" 
                      position="top" 
                      fill="#FF0000"
                      fontSize={10}
                      offset={15}
                    />
                  </ReferenceLine>
                ))}
              </AreaChart>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}