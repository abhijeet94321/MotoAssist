"use client";

import type { ServiceJob } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, FileText, CheckCircle, UserCheck, BellRing } from "lucide-react";
import { Badge } from "../ui/badge";
import { format } from 'date-fns';


type JobDetailsViewProps = {
  job: ServiceJob;
  onBack: () => void;
};

export default function JobDetailsView({ job, onBack }: JobDetailsViewProps) {
  const { vehicleDetails, serviceItems, payment, initialServiceRequest, mechanic, nextServiceDate } = job;
  const vehicleModelString = typeof vehicleDetails.vehicleModel === 'string' 
    ? vehicleDetails.vehicleModel 
    : `${vehicleDetails.vehicleModel.brand} ${vehicleDetails.vehicleModel.model}`;

  const totalCost = serviceItems.reduce(
    (acc, item) => acc + item.partsCost + item.laborCost,
    0
  );

  return (
    <Card className="max-w-3xl mx-auto shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-primary" />
          <div>
            <CardTitle>Service Record Details</CardTitle>
            <CardDescription>
              A read-only summary of the completed service job.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg">
          <div>
            <h3 className="font-semibold mb-2">Customer</h3>
            <p>{vehicleDetails.userName}</p>
            <p>{vehicleDetails.mobile}</p>
            <p>{vehicleDetails.address}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Vehicle</h3>
            <p>{vehicleModelString}</p>
            <p>{vehicleDetails.licensePlate}</p>
             {mechanic && (
              <div className="mt-2">
                <h3 className="font-semibold mb-1">Mechanic Assigned</h3>
                <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-muted-foreground"/>
                    <p>{mechanic}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <Separator />
        
        <div>
            <h3 className="font-semibold mb-2">Initial Service Request</h3>
            <p className="text-sm text-muted-foreground p-4 bg-accent/20 border-l-4 border-accent rounded-r-lg">
                {initialServiceRequest}
            </p>
        </div>

        <Separator />

        <div>
           <h3 className="font-semibold mb-2">Services Performed & Parts Used</h3>
           <div className="border rounded-lg overflow-x-auto">
             <Table className="min-w-[600px]">
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-1/2">Description</TableHead>
                    <TableHead className="text-right">Parts</TableHead>
                    <TableHead className="text-right">Labor</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {serviceItems.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.description}</TableCell>
                        <TableCell className="text-right">₹{item.partsCost.toFixed(2)}</TableCell>
                        <TableCell className="text-right">₹{item.laborCost.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-semibold">
                        ₹{(item.partsCost + item.laborCost).toFixed(2)}
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
           </div>
        </div>

        <Separator />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <h3 className="font-semibold">Payment Status:</h3>
                <Badge variant="default" className="bg-emerald-600 text-white">
                    <CheckCircle className="mr-2 h-4 w-4"/>
                    {payment.status}
                </Badge>
            </div>
            {nextServiceDate && (
                 <div className="flex items-center gap-2">
                    <h3 className="font-semibold">Next Service Due:</h3>
                    <Badge variant="outline" className="border-amber-400 bg-amber-50 text-amber-900">
                        <BellRing className="mr-2 h-4 w-4"/>
                        {format(new Date(nextServiceDate), 'PPP')}
                    </Badge>
                </div>
            )}
          </div>
          <div className="text-right w-full sm:w-auto">
            <p className="text-muted-foreground">Total Amount Paid</p>
            <p className="text-3xl font-bold text-primary">₹{totalCost.toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-start">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to History
        </Button>
      </CardFooter>
    </Card>
  );
}

    