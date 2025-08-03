"use client";

import type { VehicleDetails, ServiceItem } from "@/lib/types";
import { Wrench } from "lucide-react";

type BillPDFProps = {
  vehicleDetails: VehicleDetails;
  serviceItems: ServiceItem[];
};

export default function BillPDF({
  vehicleDetails,
  serviceItems,
}: BillPDFProps) {
  const totalCost = serviceItems.reduce(
    (acc, item) => acc + item.partsCost + item.laborCost,
    0
  );

  return (
    <div className="bg-white text-black p-8 font-sans" style={{ width: '210mm', minHeight: '297mm' }}>
      <header className="flex items-center justify-between pb-8 border-b-2 border-gray-200">
        <div className="flex items-center gap-4">
            <div className="bg-gray-800 p-3 rounded-lg">
                <Wrench className="h-10 w-10 text-white" />
            </div>
            <div>
                <h1 className="text-4xl font-bold text-gray-800">MotoAssist</h1>
                <p className="text-gray-500">Service Invoice</p>
            </div>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-semibold">Invoice</h2>
          <p className="text-gray-500">Date: {new Date().toLocaleDateString()}</p>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-8 my-8">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-600 border-b pb-1">Billed To</h3>
          <p className="font-bold text-lg">{vehicleDetails.userName}</p>
          <p>{vehicleDetails.address}</p>
          <p>{vehicleDetails.mobile}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-600 border-b pb-1">Vehicle Details</h3>
          <p><span className="font-semibold">Model:</span> {vehicleDetails.vehicleModel}</p>
          <p><span className="font-semibold">License Plate:</span> {vehicleDetails.licensePlate}</p>
        </div>
      </section>

      <section>
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left font-semibold text-gray-600 w-1/2">Service Description</th>
              <th className="p-3 text-right font-semibold text-gray-600">Parts Cost</th>
              <th className="p-3 text-right font-semibold text-gray-600">Labor Cost</th>
              <th className="p-3 text-right font-semibold text-gray-600">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {serviceItems.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="p-3">{item.description}</td>
                <td className="p-3 text-right">₹{item.partsCost.toFixed(2)}</td>
                <td className="p-3 text-right">₹{item.laborCost.toFixed(2)}</td>
                <td className="p-3 text-right font-semibold">
                  ₹{(item.partsCost + item.laborCost).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-8 flex justify-end">
        <div className="w-1/2">
            <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg">
                <span className="text-xl font-bold text-gray-800">Total Amount Due</span>
                <span className="text-2xl font-bold text-gray-900">
                ₹{totalCost.toFixed(2)}
                </span>
            </div>
        </div>
      </section>

      <footer className="mt-16 text-center text-gray-500 text-sm absolute bottom-8 left-0 right-0">
        <p>Thank you for your business!</p>
        <p>MotoAssist | Powered by Firebase and Genkit</p>
      </footer>
    </div>
  );
}
