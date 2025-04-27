"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

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
        onSubmit={form.handleSubmit((data) => {
          onSubmit(data);
        })}
        className="space-y-4 flex justify-center flex-col"
      >
        {/* Date Range Picker */}
        <FormField
          control={form.control}
          name="dateRange"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date Range</FormLabel>
              <FormControl>
                <div className={cn("grid gap-2")}>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                          " justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon />
                        {field.value ? (
                          field.value.from && field.value.to ? (
                            <>
                              {format(field.value.from, "LLL dd, y")} -{" "}
                              {format(field.value.to, "LLL dd, y")}
                            </>
                          ) : (
                            <span>Pick a date</span>
                          )
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        selected={field.value}
                        onSelect={(date: any) => {
                          field.onChange(date);
                        }}
                        numberOfMonths={2}
                        disabled={(date: Date) => {
                          // Disable dates more than 6 days in the future from today
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const maxFutureDate = new Date(today);
                          maxFutureDate.setDate(today.getDate() + 6);

                          if (date > maxFutureDate) {
                            return true;
                          }

                          // If a start date is selected, implement range limitations
                          const startDate = field.value?.from;
                          if (startDate) {
                            const fromDate = new Date(startDate);
                            fromDate.setHours(0, 0, 0, 0);

                            // Disable dates before the selected start date (when selecting end date)
                            // if (date < fromDate) {
                            //   return true;
                            // }

                            // Limit maximum range to 5 days
                            const maxEndDate = new Date(fromDate);
                            maxEndDate.setDate(fromDate.getDate() + 5);

                            if (date > maxEndDate) {
                              return true;
                            }
                          }

                          return false;
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </FormControl>
              <FormMessage />
              <FormDescription>Please select a date range.</FormDescription>
            </FormItem>
          )}
        />

        {/* Last Cleaning Date */}
        <FormField
          control={form.control}
          name="last_cleaning_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Cleaning Date</FormLabel>
              <FormControl>
                <div className={cn("grid gap-2")}>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="last_cleaning_date"
                        variant={"outline"}
                        className={cn(
                          "justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon />
                        {field.value ? (
                          format(field.value, "LLL dd, y")
                        ) : (
                          <span>Pick a date</span>
                        )}
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
                </div>
              </FormControl>
              <FormMessage />
              <FormDescription>
                Please select the last cleaning date.
              </FormDescription>
            </FormItem>
          )}
        />

        {/* Cleaning Type */}
        <FormField
          control={form.control}
          name="cleaning_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cleaning Type</FormLabel>
              <FormControl>
                <Select
                  defaultValue={field.value || "onetime"}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a cleaning type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="onetime">One-time</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
              <FormDescription>
                Please select the cleaning type.
              </FormDescription>
            </FormItem>
          )}
        />

        {/* Cleaning Frequency */}
        <div
          className={cn(
            form.watch("cleaning_type") === "" && "hidden",
            form.watch("cleaning_type") === "onetime" && "hidden"
          )}
        >
          <FormField
            control={form.control}
            name="cleaning_frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cleaning Frequency</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Please enter the cleaning frequency"
                    {...field}
                    type="number"
                  />
                </FormControl>
                <FormMessage />
                <FormDescription>
                  Please enter the cleaning frequency.
                </FormDescription>
              </FormItem>
            )}
          />
        </div>

        {/* Location Search */}
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
                    <div className="absolute z-10 bg-background border border-border w-full mt-1 rounded-md shadow-lg max-h-60 overflow-y-auto text-sm">
                      {searchResults.map((location, idx) => (
                        <div
                          key={idx}
                          className="p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                          onClick={() => handleSelectLocation(location)}
                        >
                          {location.display_name}
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

        {/* Hidden Lat / Long */}
        <input type="hidden" {...form.register("latitude")} />
        <input type="hidden" {...form.register("longitude")} />

        <Button type="submit">Submit</Button>
        <Button type="reset" variant="destructive" onClick={() => form.reset()}>
          Reset
        </Button>
      </form>
    </Form>
  );
}
