"use client";

import { useState } from "react";
import type { ServiceJob, ServiceItem, ServiceStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  User,
} from "lucide-react";
import ServiceLogger from "./service-logger";

type ServiceStatusUpdaterProps = {
  job: ServiceJob;
  onUpdate: (jobId: string, status: ServiceStatus, items?: ServiceItem[]) => void;
  onBack: () => void;
};

const nextStatusMap: Partial<Record<ServiceStatus, ServiceStatus>> = {
    'Service Required': 'In Progress',
    'In Progress': 'Completed',
    'Completed': 'Billed',
};


export default function ServiceStatusUpdater({
  job,
  onUpdate,
  onBack,
}: ServiceStatusUpdaterProps) {
    const [currentStatus, setCurrentStatus] = useState<ServiceStatus>(job.status);
    const [serviceItems, setServiceItems] = useState<ServiceItem[]>(job.serviceItems);

    const handleUpdate = () => {
        onUpdate(job.id, currentStatus, serviceItems);
    }

    const handleProceed = () => {
        const nextStatus = nextStatusMap[currentStatus];
        if (nextStatus) {
            onUpdate(job.id, nextStatus, serviceItems);
        }
    }

    const canProceed = nextStatusMap[currentStatus] && (currentStatus !== 'Completed' || serviceItems.length > 0);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Update Service Status</CardTitle>
        <CardDescription>
          Manage the service status, log parts and labor, and proceed to the next step.
        </CardDescription>
        <div className="text-sm text-muted-foreground pt-2 flex flex-wrap gap-x-6 gap-y-2">
            <div className="flex items-center gap-2">
                <User className="w-4 h-4"/> <span>{job.vehicleDetails.userName}</span>
            </div>
            <div className="flex items-center gap-2">
                <Bike className="w-4 h-4"/> <span>{job.vehicleDetails.vehicleModel} - {job.vehicleDetails.licensePlate}</span>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center p-4 border rounded-lg">
            <div>
                <h3 className="font-semibold mb-2">Initial Request</h3>
                <p className="text-sm text-muted-foreground">{job.initialServiceRequest}</p>
            </div>
            <div>
                <h3 className="font-semibold mb-2">Current Status</h3>
                 <Select onValueChange={(v) => setCurrentStatus(v as ServiceStatus)} value={currentStatus}>
                    <SelectTrigger>
                        <SelectValue placeholder="Update status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Service Required">Service Required</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Billed" disabled>Billed</SelectItem>
                        <SelectItem value="Cycle Complete" disabled>Cycle Complete</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        
        {currentStatus === 'Completed' && (
            <ServiceLogger
                vehicleModel={job.vehicleDetails.vehicleModel}
                initialServices={serviceItems}
                onItemsUpdate={setServiceItems}
            />
        )}

      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
        <div className="flex gap-2">
            <Button variant="secondary" onClick={handleUpdate}>Save Changes</Button>
            {canProceed && (
                <Button onClick={handleProceed}>
                    {`Proceed to ${nextStatusMap[currentStatus]}`} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            )}
        </div>
      </CardFooter>
    </Card>
  );
}
