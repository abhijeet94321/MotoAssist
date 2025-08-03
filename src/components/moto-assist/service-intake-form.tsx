"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  User,
  Phone,
  MapPin,
  Bike,
  Hash,
  ArrowRight,
  ArrowLeft,
  Wrench
} from "lucide-react";

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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { VehicleDetails } from "@/lib/types";
import { Textarea } from "../ui/textarea";

const formSchema = z.object({
  vehicleDetails: z.object({
      userName: z.string().min(2, "Name must be at least 2 characters."),
      mobile: z
        .string()
        .min(10, "Please enter a valid mobile number.")
        .regex(/^[0-9+]+$/, "Please enter a valid mobile number."),
      address: z.string().min(5, "Address must be at least 5 characters."),
      vehicleModel: z.string().min(2, "Vehicle model is required."),
      licensePlate: z.string().min(4, "License plate is required."),
  }),
  initialServiceRequest: z.string().min(5, "Please describe the service required."),
});

type ServiceIntakeFormProps = {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  onBack: () => void;
  initialData?: z.infer<typeof formSchema> | null;
};

export default function ServiceIntakeForm({ onSubmit, onBack, initialData }: ServiceIntakeFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      vehicleDetails: {
        userName: "",
        mobile: "",
        address: "",
        vehicleModel: "",
        licensePlate: "",
      },
      initialServiceRequest: "",
    },
  });

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>New Service Intake</CardTitle>
        <CardDescription>
          Enter customer, vehicle, and service details to create a new job.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-medium text-lg">Customer Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vehicleDetails.userName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input placeholder="e.g. John Doe" {...field} className="pl-10" />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vehicleDetails.mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                       <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input placeholder="e.g. 9876543210" {...field} className="pl-10" />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="vehicleDetails.address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input placeholder="Customer's address" {...field} className="pl-10" />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-medium text-lg">Vehicle & Service Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="vehicleDetails.vehicleModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Make & Model</FormLabel>
                      <div className="relative">
                         <Bike className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input placeholder="e.g. Honda Activa 6G" {...field} className="pl-10"/>
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="vehicleDetails.licensePlate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Plate</FormLabel>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input placeholder="e.g. MH12AB1234" {...field} className="pl-10"/>
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <FormField
                  control={form.control}
                  name="initialServiceRequest"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Required</FormLabel>
                      <div className="relative">
                        <Wrench className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Textarea placeholder="Describe the issue or service needed..." {...field} className="pl-10"/>
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
             <Button variant="outline" onClick={onBack} type="button">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Main
             </Button>
            <Button type="submit">
              Create Service Job <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
