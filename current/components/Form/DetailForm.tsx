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

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
});

export function DetailForm({ setData }: { setData: any }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const onSubmit = (data: any) => {
    const { name, dateRange } = data;
    const { from, to } = dateRange;
    const response = fetch(
      new URL("/predict/range", process.env.NEXT_PUBLIC_API_URL),
      {
        method: "POST",
        body: JSON.stringify({
          start_date: format(from, "yyyy-MM-dd"),
          end_date: format(to, "yyyy-MM-dd"),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    response
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setData(data.data);
      });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 flex justify-center flex-col"
      >
        <FormField
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
        />
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
                        onSelect={(range) => {
                          if (range?.from) {
                            const maxToDate = addDays(range.from, 15);
                            if (range.to && range.to > maxToDate) {
                              range.to = maxToDate;
                            }
                          }
                          field.onChange(range);
                        }}
                        disabled={(date) =>
                          field.value?.from
                            ? date < field.value.from ||
                              date > addDays(field.value.from, 15)
                            : false
                        }
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
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
