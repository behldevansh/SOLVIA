"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, MapPin, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

const formSchema = z.object({
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
  last_cleaning_date: z.date({
    required_error: "Last cleaning date is required.",
  }),
  cleaning_type: z.string().default("onetime"),
  cleaning_frequency: z.string().default(""),
  location: z.string().min(1, { message: "Location is required." }),
  latitude: z.number(),
  longitude: z.number(),
  data_source_provider: z.string().default("openweathermap"),
});

export function DetailForm({ onSubmit }: { onSubmit: any }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dateRange: {
        from: null,
        to: null,
      },
      last_cleaning_date: null,
      cleaning_type: "onetime",
      cleaning_frequency: "",
      location: "",
      latitude: 0,
      longitude: 0,
      data_source_provider: "openweathermap",
    },
  });

  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");

  async function handleSearch(query: string) {
    setSearchQuery(query);
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?countrycodes=in&q=${encodeURIComponent(
          query
        )}&format=json`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching location:", error);
    }
  }

  function handleSelectLocation(location: any) {
    form.setValue("location", location.display_name);
    form.setValue("latitude", parseFloat(location.lat));
    form.setValue("longitude", parseFloat(location.lon));
    setSearchResults([]);
    setSearchQuery(location.display_name);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-2xl mx-auto p-6 border border-border rounded-xl shadow-md bg-background border border-gray-200 rounded-xl"
      >
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="dateRange"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date Range</FormLabel>
                <FormControl>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                          "justify-start text-left font-normal w-full",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value?.from && field.value?.to ? (
                          <>
                            {format(field.value.from, "LLL dd, y")} -{" "}
                            {format(field.value.to, "LLL dd, y")}
                          </>
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        selected={field.value}
                        onSelect={field.onChange}
                        numberOfMonths={2}
                        disabled={(date: Date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const maxFutureDate = new Date(today);
                          maxFutureDate.setDate(today.getDate() + 6);
                          if (date > maxFutureDate) return true;
                          const startDate = field.value?.from;
                          if (startDate) {
                            const fromDate = new Date(startDate);
                            fromDate.setHours(0, 0, 0, 0);
                            const maxEndDate = new Date(fromDate);
                            maxEndDate.setDate(fromDate.getDate() + 5);
                            if (date > maxEndDate) return true;
                          }
                          return false;
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormDescription>Please select a date range.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="last_cleaning_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Cleaning Date</FormLabel>
                <FormControl>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="last_cleaning_date"
                        variant={"outline"}
                        className={cn(
                          "justify-start text-left font-normal w-full",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value
                          ? format(field.value, "LLL dd, y")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => {
                          const start_date: any = form.watch("dateRange")?.from;
                          if (start_date) {
                            return date > start_date;
                          }
                          return false;
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormDescription>
                  Please select the last cleaning date.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="cleaning_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cleaning Type</FormLabel>
                <FormControl>
                  <Select
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select cleaning type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="onetime">One-time</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>
                  Please select the cleaning type.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch("cleaning_type") !== "onetime" &&
            form.watch("cleaning_type") !== "" && (
              <FormField
                control={form.control}
                name="cleaning_frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cleaning Frequency</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter frequency (e.g. 7)"
                        {...field}
                        type="number"
                      />
                    </FormControl>
                    <FormDescription>
                      Enter frequency in days/weeks depending on type.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Search location..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                  {searchResults.length > 0 && (
                    <div className="absolute z-10 bg-white dark:bg-gray-950 dark:text-white border border-border w-full mt-1 rounded-md shadow-lg max-h-60 overflow-y-auto text-sm">
                      {searchResults.map((location, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                          onClick={() => handleSelectLocation(location)}
                        >
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{location.display_name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="data_source_provider"
          render={({ field }) => (
            <FormItem className="my-4">
              <FormLabel>Data Source Provider</FormLabel>
              <FormControl>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openweathermap">
                      Open Weather Map
                    </SelectItem>
                    <SelectItem value="visualcrossing">
                      Visual Crossing
                    </SelectItem>
                    <SelectItem value="tomorrowio">Tomorrow.io</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <Link href={"/nsut"} className="">
            <Button variant="outline" className="w-full">
              Check NSUT Prediction
            </Button>
          </Link>
        </div>

        <input type="hidden" {...form.register("latitude")} />
        <input type="hidden" {...form.register("longitude")} />

        <div className="flex justify-end gap-4">
          <Button type="submit">Submit</Button>
          <Button type="reset" variant="outline" onClick={() => form.reset()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </form>
    </Form>
  );
}
