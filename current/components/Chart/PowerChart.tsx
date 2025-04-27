"use client";

import { format } from "date-fns";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  Label,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
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
import BeautifulLoading from "./BeautifulLoading";

// Currency formatter
function formatPriceINR(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "₹0.00";
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Custom tooltip
const CustomTooltip = ({ active, payload, label }) => {
  console.log("CustomTooltip", { active, payload, label });
  if (active && payload && payload.length) {
    return (
      <div className="bg-black bg-opacity-80 p-3 rounded border border-gray-700">
        <p className="text-white">{`Date: ${format(
          new Date(label),
          "MMM d, yyyy"
        )}`}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {`${entry.name}: ${
              entry.name.includes("Financial") || entry.name.includes("Loss")
                ? formatPriceINR(entry.value)
                : entry.value.toFixed(2)
            }`}
          </p>
        ))}
      </div>
    );
  }
  return null;
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
        !formData.last_cleaning_date ||
        !formData.longitude ||
        !formData.latitude
      )
        return;

      setLoading(true);
      try {
        // Fetch power data
        const powerResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/predict/range`,
          {
            method: "POST",
            body: JSON.stringify({
              start_date: format(formData.from, "yyyy-MM-dd"),
              end_date: format(formData.to, "yyyy-MM-dd"),
              latitude: formData.latitude,
              longitude: formData.longitude,
            }),
            headers: { "Content-Type": "application/json" },
          }
        );
        const powerData = await powerResponse.json();
        setPowerData(powerData.data);

        // Fetch dust data
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

        // Generate cleaning dates
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

  if (loading) return <BeautifulLoading/>;
  if (!powerData || !dustData)
    return <div className="text-center py-8">No data available.</div>;

  const lastCleaningDate = formData?.last_cleaning_date
    ? format(formData.last_cleaning_date, "yyyy-MM-dd")
    : null;
  const regularCleaningDates = cleaningDates.slice(1);
  const optimalCleaningDate =
    dustData.cleaning_recommendation?.optimal_cleaning_date || null;

  const potentialSavings =
    dustData.cleaning_recommendation?.cost_comparison?.potential_savings || 0;
  const absolutePotentialSavings = Math.abs(potentialSavings);

  const labelStyles = {
    fontSize: 12,
    fontWeight: "bold",
    background: "black",
    borderRadius: 5,
    padding: "2px 5px",
    opacity: 0.8,
  };

  return (
    <div className="my-8 dark:bg-[#1F1F1F]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 gap-8">
        {/* Cleaning Recommendations */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Cleaning Recommendations</CardTitle>
            <CardDescription>
              Optimal and regular cleaning dates.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col justify-center items-center">
            <p>Last Cleaning Date: {lastCleaningDate || "Not provided"}</p>
            <p>
              Regular Cleaning Dates:{" "}
              {cleaningDates.length > 1
                ? cleaningDates
                    .slice(1)
                    .map((date) => format(new Date(date), "MMM d, yyyy"))
                    .join(", ")
                : "Not scheduled"}
            </p>
            <p>
              Optimal Cleaning Date: {optimalCleaningDate || "Not provided"}
            </p>
          </CardContent>
          <CardFooter className="flex justify-center flex-col">
            <p className="text-red-500">
              Total Loss Without Cleaning:{" "}
              {formatPriceINR(
                dustData.cleaning_recommendation?.cost_comparison
                  ?.total_loss_without_cleaning
              )}
            </p>
            <p className="text-green-500">
              Savings If Cleaned on Time:{" "}
              {formatPriceINR(absolutePotentialSavings)}
            </p>
          </CardFooter>
        </Card>

        {/* Forecasted AC PV Power */}
        <Card>
          <CardHeader>
            <CardTitle>Predicted AC PV Power</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={powerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric_date">
                  {/* <Label position="insideBottom" offset={-5}>Date</Label> */}
                </XAxis>
                <YAxis>
                  <Label angle={-90} position="insideLeft" offset={2}>
                    AC Power (W)
                  </Label>
                </YAxis>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="ac_power"
                  stroke="#8884d8"
                  fill="#8884d8"
                  name="Predicted AC Power"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Dust Accumulation */}
        <Card>
          <CardHeader>
            <CardTitle>Dust Accumulation</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={dustData.forecast}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Date">
                  {/* <Label position="insideBottom" offset={-5}>Date</Label> */}
                </XAxis>
                <YAxis>
                  <Label angle={-90} position="insideLeft" offset={10}>
                    Dust Level
                  </Label>
                </YAxis>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="Dust"
                  fill="#ffc658"
                  stroke="#ffc658"
                  name="Dust Level"
                />

                {/* Last Cleaning Date (Red) */}
                {lastCleaningDate && (
                  <ReferenceLine
                    x={lastCleaningDate}
                    stroke="red"
                    strokeWidth={2}
                    label={{
                      value: "Last Cleaning",
                      position: "insideTopLeft",
                      fill: "red",
                      style: labelStyles,
                      dy: 20,
                    }}
                  />
                )}

                {/* Regular Cleaning Dates (Yellow) */}
                {regularCleaningDates.map((date) => (
                  <ReferenceLine
                    key={date}
                    x={date}
                    stroke="yellow"
                    strokeWidth={2}
                    label={{
                      value: "Regular Cleaning",
                      position: "insideTopRight",
                      fill: "yellow",
                      style: labelStyles,
                      dy: 10,
                    }}
                  />
                ))}

                {/* Optimal Cleaning Date (Green) */}
                {optimalCleaningDate && (
                  <ReferenceLine
                    x={optimalCleaningDate}
                    stroke="green"
                    strokeWidth={2}
                    label={{
                      value: "Optimal Cleaning",
                      position: "insideTopRight",
                      fill: "green",
                      style: labelStyles,
                      dy: -2,
                    }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Power Loss Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Power Loss Over Time</CardTitle>
            <CardDescription>
              Financial loss due to dust accumulation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={dustData.forecast}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Date">
                  {/* <Label position="insideBottom" offset={-5}>Date</Label> */}
                </XAxis>
                <YAxis>
                  <Label angle={-90} position="insideLeft" offset={2}>
                    AC Power (W)
                  </Label>{" "}
                </YAxis>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="Power_Loss"
                  fill="#82fa7d"
                  stroke="#82fa7"
                  name="Power Loss"
                />
                {lastCleaningDate && (
                  <ReferenceLine
                    x={lastCleaningDate}
                    stroke="red"
                    strokeWidth={2}
                    label={{
                      value: "Last Cleaning",
                      position: "insideTopLeft",
                      fill: "red",
                      style: labelStyles,
                      dy: 20,
                    }}
                  />
                )}

                {/* Regular Cleaning Dates (Yellow) */}
                {regularCleaningDates.map((date) => (
                  <ReferenceLine
                    key={date}
                    x={date}
                    stroke="yellow"
                    strokeWidth={2}
                    label={{
                      value: "Regular Cleaning",
                      position: "insideTopRight",
                      fill: "yellow",
                      style: labelStyles,
                      dy: 10,
                    }}
                  />
                ))}

                {/* Optimal Cleaning Date (Green) */}
                {optimalCleaningDate && (
                  <ReferenceLine
                    x={optimalCleaningDate}
                    stroke="green"
                    strokeWidth={2}
                    label={{
                      value: "Optimal Cleaning",
                      position: "insideTopRight",
                      fill: "green",
                      style: labelStyles,
                      dy: -2,
                    }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Financial Loss Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Loss Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={dustData.forecast}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Date">
                  {/* <Label position="insideBottom" offset={-5}>Date</Label> */}
                </XAxis>
                <YAxis>
                  <Label angle={-90} position="insideLeft" offset={10}>
                    Financial Loss (₹)
                  </Label>
                </YAxis>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="Financial_Loss"
                  fill="#82ca9d"
                  stroke="#82ca9d"
                  name="Financial Loss"
                />
                {lastCleaningDate && (
                  <ReferenceLine
                    x={lastCleaningDate}
                    stroke="red"
                    strokeWidth={2}
                    label={{
                      value: "Last Cleaning",
                      position: "insideTopLeft",
                      fill: "red",
                      style: labelStyles,
                    }}
                  />
                )}

                {/* Regular Cleaning Dates (Yellow) */}
                {regularCleaningDates.map((date) => (
                  <ReferenceLine
                    key={date}
                    x={date}
                    stroke="yellow"
                    strokeWidth={2}
                    label={{
                      value: "Regular Cleaning",
                      position: "insideTopRight",
                      fill: "yellow",
                      style: labelStyles,
                    }}
                  />
                ))}

                {/* Optimal Cleaning Date (Green) */}
                {optimalCleaningDate && (
                  <ReferenceLine
                    x={optimalCleaningDate}
                    stroke="green"
                    strokeWidth={2}
                    label={{
                      value: "Optimal Cleaning",
                      position: "insideTopRight",
                      fill: "green",
                      style: labelStyles,
                    }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
