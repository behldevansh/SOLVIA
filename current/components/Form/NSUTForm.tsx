"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
  data_source_provider: z.string().default("openweathermap"),
});

export function NSUTForm({ onSubmit }: { onSubmit: any }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dateRange: { from: null, to: null },
      last_cleaning_date: null,
      cleaning_type: "onetime",
      cleaning_frequency: "",
      data_source_provider: "openweathermap",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-xl mx-auto p-6 border border-border rounded-xl shadow-md bg-background"
      >
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
                      variant="outline"
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
                      mode="range"
                      selected={field.value}
                      onSelect={field.onChange}
                      numberOfMonths={2}
                      //   disabled={(date: Date) => {
                      //     const today = new Date();
                      //     today.setHours(0, 0, 0, 0);
                      //     const maxFutureDate = new Date(today);
                      //     maxFutureDate.setDate(today.getDate() + 6);
                      //     const startDate = field.value?.from;
                      //     if (startDate) {
                      //       const fromDate = new Date(startDate);
                      //       fromDate.setHours(0, 0, 0, 0);
                      //       const maxEndDate = new Date(fromDate);
                      //       maxEndDate.setDate(fromDate.getDate() + 5);
                      //       if (date > maxEndDate) return true;
                      //     }
                      //     return date > maxFutureDate;
                      //   }}
                    />
                  </PopoverContent>
                </Popover>
              </FormControl>
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
                      variant="outline"
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
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => {
                        const start = form.watch("dateRange")?.from;
                        return start ? date > start : false;
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

        <FormField
          control={form.control}
          name="data_source_provider"
          render={({ field }) => (
            <FormItem>
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
