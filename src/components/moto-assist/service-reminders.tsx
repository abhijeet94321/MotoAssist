"use client";

import { useState, useTransition } from "react";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BellRing,
  LoaderCircle,
  MessageSquareWarning,
  Send,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getDueServiceReminders } from "@/app/actions";
import type { DueService } from "@/ai/flows/find-due-services";

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
  );

export default function ServiceReminders() {
  const [dueServices, setDueServices] = useState<DueService[]>([]);
  const [isPending, startTransition] = useTransition();
  const [hasChecked, setHasChecked] = useState(false);
  const { toast } = useToast();

  const handleCheckReminders = () => {
    startTransition(async () => {
      const result = await getDueServiceReminders();
      setHasChecked(true);

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        setDueServices([]);
      } else if (result.dueServices) {
        setDueServices(result.dueServices);
        if (result.dueServices.length > 0) {
            toast({
                title: "Reminders Found",
                description: `Found ${result.dueServices.length} customers due for service.`,
            });
        }
      }
    });
  };

  const handleSendReminder = (service: DueService) => {
    const nextServiceDate = format(new Date(service.nextServiceDate), 'PPP');
    const message = `Hi ${service.userName}, this is a friendly reminder from MotoAssist. Your vehicle (${service.vehicleModel}, ${service.licensePlate}) was due for its next service on ${nextServiceDate}. Please contact us to schedule an appointment at your earliest convenience. Thank you!`;
    const encodedText = encodeURIComponent(message);
    const mobileNumber = service.mobile.replace(/\D/g, '');
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${mobileNumber}&text=${encodedText}`;
    
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    
    toast({
      title: "Reminder Ready",
      description: "WhatsApp opened to send the reminder message.",
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Reminders</CardTitle>
        <CardDescription>
          Find customers who are due for their next service and send them a
          WhatsApp reminder.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
            <Button onClick={handleCheckReminders} disabled={isPending} size="lg">
            {isPending ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <BellRing className="mr-2 h-4 w-4" />
            )}
            {isPending ? "Checking..." : "Check for Due Services"}
            </Button>
        </div>

        {hasChecked && !isPending && (
            <div className="border rounded-lg overflow-hidden">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {dueServices.length === 0 ? (
                    <TableRow>
                    <TableCell
                        colSpan={4}
                        className="text-center h-24 text-muted-foreground"
                    >
                        <div className="flex flex-col items-center justify-center gap-2">
                             <MessageSquareWarning className="w-8 h-8"/>
                             <span>No service reminders are due at this time.</span>
                        </div>
                    </TableCell>
                    </TableRow>
                ) : (
                    dueServices.map((service) => (
                    <TableRow key={service.jobId}>
                        <TableCell>
                            <div className="font-medium">{service.userName}</div>
                            <div className="text-sm text-muted-foreground">{service.mobile}</div>
                        </TableCell>
                         <TableCell>
                            <div className="font-medium">{service.vehicleModel}</div>
                            <div className="text-sm text-muted-foreground">{service.licensePlate}</div>
                        </TableCell>
                        <TableCell>
                            {format(new Date(service.nextServiceDate), 'PPP')}
                        </TableCell>
                        <TableCell className="text-right">
                           <Button size="sm" onClick={() => handleSendReminder(service)} className="bg-[#25D366] hover:bg-[#128C7E] text-white">
                                <WhatsAppIcon className="mr-2 h-4 w-4" />
                                Send Reminder
                           </Button>
                        </TableCell>
                    </TableRow>
                    ))
                )}
                </TableBody>
            </Table>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
