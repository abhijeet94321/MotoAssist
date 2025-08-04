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
  MessageSquare,
} from "lucide-react";
import ServiceLogger from "./service-logger";
import { useToast } from "@/hooks/use-toast";

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

const statusUpdateTextMap: Partial<Record<ServiceStatus, string>> = {
    'In Progress': 'Hi {userName}, work has started on your vehicle ({vehicleModel}). We will keep you updated.',
    'Completed': 'Hi {userName}, the service on your vehicle ({vehicleModel}) is complete. We will share the bill with you shortly for payment.',
    'Billed': 'Hi {userName}, your bill for the service on your vehicle ({vehicleModel}) is ready. Please proceed with the payment.',
};


export default function ServiceStatusUpdater({
  job,
  onUpdate,
  onBack,
}: ServiceStatusUpdaterProps) {
    const { toast } = useToast();
    const [currentStatus, setCurrentStatus] = useState<ServiceStatus>(job.status);
    const [serviceItems, setServiceItems] = useState<ServiceItem[]>(job.serviceItems);

    const handleUpdate = () => {
        onUpdate(job.id, currentStatus, serviceItems);
    }

    const handleShareUpdate = () => {
        let message = statusUpdateTextMap[currentStatus];
        if (!message) {
            toast({
                title: "No Update Message",
                description: "There is no pre-defined message for this status.",
                variant: "destructive"
            });
            return;
        }

        message = message.replace('{userName}', job.vehicleDetails.userName)
                         .replace('{vehicleModel}', job.vehicleDetails.vehicleModel);
        
        const encodedText = encodeURIComponent(message);
        const mobileNumber = job.vehicleDetails.mobile.replace(/\D/g, '');
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${mobileNumber}&text=${encodedText}`;
        
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        
        toast({
          title: "Update Ready to Share",
          description: "Your WhatsApp application has been opened to share the status update.",
        });
    }

    const handleProceed = () => {
        const nextStatus = nextStatusMap[currentStatus];
        if (nextStatus) {
            onUpdate(job.id, nextStatus, serviceItems);
        }
    }

    const canProceed = nextStatusMap[currentStatus] && (currentStatus !== 'In Progress' || serviceItems.length > 0);

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
            <div className="space-y-2">
                <h3 className="font-semibold">Current Status</h3>
                 <div className="flex gap-2">
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
                    {statusUpdateTextMap[currentStatus] && (
                         <Button variant="outline" size="icon" onClick={handleShareUpdate} aria-label="Share status update">
                            <MessageSquare className="h-5 w-5"/>
                        </Button>
                    )}
                 </div>
            </div>
        </div>
        
        {currentStatus === 'In Progress' && (
            <ServiceLogger
                vehicleModel={job.vehicleDetails.vehicleModel}
                initialServices={serviceItems}
                onItemsUpdate={setServiceItems}
            />
        )}

      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Main
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
