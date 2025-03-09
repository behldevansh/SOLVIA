"use client";
import PowerChart from "@/components/Chart/PowerChart";
import { DetailForm } from "@/components/Form/DetailForm";
import { useState } from "react";

export default function Page() {
  const [data, setData] = useState(undefined);


  return (
    <div className="p-4">
      <div className="text-2xl font-bold text-center mb-4">Detail Form</div>
      <div className="max-w-sm mx-auto my-4 p-4 md:p-8 border border-gray-200 rounded-xl">
        <DetailForm setData={setData} />
      </div>
      {data && (
        <>
          <div className="text-2xl font-bold text-center mb-4 mt-8">
            Power Charts
          </div>
          <div className="max-w-3xl mx-auto my-4">
            <PowerChart data={data} />
          </div>
        </>
      )}
    </div>
  );
}
