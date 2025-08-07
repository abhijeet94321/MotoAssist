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
  Wrench,
  LoaderCircle,
} from "lucide-react";
import { useState, useEffect, useCallback } from 'react';

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { ServiceJob } from "@/lib/types";
import { Textarea } from "../ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

const formSchema = z.object({
  vehicleDetails: z.object({
      userName: z.string().min(2, "Name must be at least 2 characters."),
      mobile: z
        .string()
        .min(10, "Please enter a valid mobile number.")
        .regex(/^[0-9+]+$/, "Please enter a valid mobile number."),
      address: z.string().min(5, "Address must be at least 5 characters."),
      vehicleModel: z.object({
        brand: z.string({ required_error: "Please select a brand." }),
        emissionType: z.string({ required_error: "Please select an emission type." }),
        model: z.string({ required_error: "Please select a model." }),
      }),
      licensePlate: z.string().min(4, "License plate is required."),
  }),
  initialServiceRequest: z.string().min(5, "Please describe the service required."),
});

type ServiceIntakeFormProps = {
  onSubmit: (data: Omit<ServiceJob, 'id' | 'status' | 'serviceItems' | 'payment' | 'isRepeat' | 'intakeDate' | 'mechanic' | 'userId'>) => void;
  onBack: () => void;
  initialData?: z.infer<typeof formSchema> | null;
  existingJobs: ServiceJob[];
};

type VehicleData = Record<string, Record<string, string[]>>;

export default function ServiceIntakeForm({ onSubmit, onBack, initialData, existingJobs }: ServiceIntakeFormProps) {
  const { toast } = useToast();
  const [vehicleData, setVehicleData] = useState<VehicleData>({});
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      vehicleDetails: {
        userName: "",
        mobile: "",
        address: "",
        vehicleModel: {
            brand: undefined,
            emissionType: undefined,
            model: undefined,
        },
        licensePlate: "",
      },
      initialServiceRequest: "",
    },
  });

  const selectedBrand = form.watch('vehicleDetails.vehicleModel.brand');
  const selectedEmissionType = form.watch('vehicleDetails.vehicleModel.emissionType');

  const fetchVehicleData = useCallback(async () => {
    setLoading(true);
    try {
        const q = query(collection(db, "vehicleData"), orderBy("name"));
        const querySnapshot = await getDocs(q);
        const data: VehicleData = {};
        querySnapshot.forEach((doc) => {
            data[doc.id] = doc.data() as Record<string, string[]>;
        });
        setVehicleData(data);
    } catch (error) {
        console.error("Error fetching vehicle data: ", error);
        toast({
            title: "Error fetching vehicle data",
            description: "Could not load vehicle brands. Please try again.",
            variant: "destructive",
        });
    } finally {
        setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchVehicleData();
  }, [fetchVehicleData]);


  const handleLicensePlateBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const licensePlate = event.target.value.trim().toUpperCase();
    if (!licensePlate) return;

    // Find the most recent job with this license plate
    const jobForVehicle = [...existingJobs]
      .reverse()
      .find(job => job.vehicleDetails.licensePlate.toUpperCase() === licensePlate);

    if (jobForVehicle) {
      const { vehicleDetails } = jobForVehicle;
      form.setValue('vehicleDetails.userName', vehicleDetails.userName);
      form.setValue('vehicleDetails.mobile', vehicleDetails.mobile);
      form.setValue('vehicleDetails.address', vehicleDetails.address);

      if (typeof vehicleDetails.vehicleModel !== 'string') {
        form.setValue('vehicleDetails.vehicleModel', vehicleDetails.vehicleModel);
      }

      toast({
        title: "Repeat Customer Found!",
        description: `Details for ${vehicleDetails.userName} have been auto-filled.`,
      });
    }
  };

  const emissionTypes = Object.keys(vehicleData[selectedBrand] || {}).filter(key => key !== 'name');
  const models = vehicleData[selectedBrand]?.[selectedEmissionType] || [];

  if (loading) {
    return (
        <div className="flex items-center justify-center h-96">
            <LoaderCircle className="w-8 h-8 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">Loading Vehicle Data...</span>
        </div>
    )
  }

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
          <CardContent className="space-y-6 p-6">
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-medium text-lg">Vehicle & Service Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="vehicleDetails.licensePlate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Plate</FormLabel>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input 
                            placeholder="e.g. MH12AB1234" 
                            {...field} 
                            onBlur={handleLicensePlateBlur}
                            className="pl-10 uppercase"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="vehicleDetails.vehicleModel.brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                        <Select onValueChange={(value) => {
                            field.onChange(value);
                            form.resetField('vehicleDetails.vehicleModel.emissionType');
                            form.resetField('vehicleDetails.vehicleModel.model');
                        }} value={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Select brand" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {Object.keys(vehicleData).map(brand => (
                                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="vehicleDetails.vehicleModel.emissionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emission Type</FormLabel>
                        <Select onValueChange={(value) => {
                             field.onChange(value);
                             form.resetField('vehicleDetails.vehicleModel.model');
                        }} value={field.value} disabled={!selectedBrand}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Select emission type" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {emissionTypes.map(type => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vehicleDetails.vehicleModel.model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!selectedEmissionType}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Select model" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                               {models.map(model => (
                                    <SelectItem key={model} value={model}>{model}</SelectItem>
                               ))}
                            </SelectContent>
                        </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
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
               <h3 className="font-medium text-lg">Service Request</h3>
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
