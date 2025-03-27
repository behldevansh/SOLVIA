"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import * as React from "react";
import { addDays, format } from "date-fns";
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
  // name: z.string().min(2, {
  //   message: "Username must be at least 2 characters.",
  // }),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
  last_cleaning_date: z.date({
    required_error: "Last cleaning date is required.",
  }),
  cleaning_type: z.string().default("onetime"),
  cleaning_frequency: z.string().default(""),
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
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          onSubmit(data);
        })}
        className="space-y-4 flex justify-center flex-col"
      >
        {/* <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Please enter your Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}
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
                        onSelect={(date: DateRange) => {
                          field.onChange(date);
                        }}
                        numberOfMonths={2}
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
                          const start_date = form.watch("dateRange")?.from;
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

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
