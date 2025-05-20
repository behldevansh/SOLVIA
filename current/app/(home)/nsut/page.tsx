"use client";
import NSUTCHART from "@/components/Chart/NSUTChart";
import { NSUTForm } from "@/components/Form/NSUTForm";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Page() {
  const [formData, setFormData] = useState<{
    from?: Date;
    to?: Date;
    cleaning_type?: string | null;
    cleaning_frequency?: string | null;
    last_cleaning_date?: Date | null;
  }>({});

  const [visible, setVisible] = useState(false);

  const onSubmit = (data: any) => {
    const { dateRange, last_cleaning_date } = data;
    setFormData({
      from: dateRange?.from,
      to: dateRange?.to,
      cleaning_type: data.cleaning_type,
      cleaning_frequency: data.cleaning_frequency,
      last_cleaning_date: data.last_cleaning_date,
    });
    setVisible(true);
  };

  const handleReset = () => {
    setVisible(false);
    setFormData({});
  };

  return (
    <div className="p-4 dark:bg-[#1F1F1F] min-h-screen">
      {visible ? (
        <>
          <div className="flex justify-between items-center mb-4 container mx-auto">
            <h2 className="text-2xl font-bold">Power Chart</h2>
            <Button onClick={handleReset} variant="destructive">
              Reset
            </Button>
          </div>
          <NSUTCHART formData={formData} />
        </>
      ) : (
        <>
          <div className="text-2xl font-bold text-center mb-2">
            NSUT Prediction
          </div>
          <div className="text-center mb-2">
            <p className="text-gray-500">
              Please fill in the details below to get the prediction.
            </p>
          </div>
          <div className="">
            <NSUTForm onSubmit={onSubmit} />
          </div>
        </>
      )}
    </div>
  );
}
