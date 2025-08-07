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
import { useState, useMemo } from 'react';

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
import { vehicleData } from "@/lib/vehicle-data";


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
        engineType: z.string({ required_error: "Please select an engine type." }),
        model: z.string({ required_error: "Please select a model." }),
        cc: z.string({ required_error: "Please select a CC." }),
      }),
      licensePlate: z.string().min(4, "License plate is required."),
  }),
  initialServiceRequest: z.string().min(5, "Please describe the service required."),
});

type ServiceIntakeFormProps = {
  onSubmit: (data: Omit<ServiceJob, 'id' | 'status' | 'serviceItems' | 'payment' | 'isRepeat' | 'intakeDate' | 'mechanic' | 'userId' | 'vehicleDetails'> & { vehicleDetails: Omit<ServiceJob['vehicleDetails'], 'vehicleModel'> & { vehicleModel: string }}) => void;
  onBack: () => void;
  initialData?: z.infer<typeof formSchema> | null;
  existingJobs: ServiceJob[];
};

export default function ServiceIntakeForm({ onSubmit, onBack, initialData, existingJobs }: ServiceIntakeFormProps) {
  const { toast } = useToast();
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>(initialData?.vehicleDetails.vehicleModel.brand);
  const [selectedEngineType, setSelectedEngineType] = useState<string | undefined>(initialData?.vehicleDetails.vehicleModel.engineType);
  const [selectedModel, setSelectedModel] = useState<string | undefined>(initialData?.vehicleDetails.vehicleModel.model);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      vehicleDetails: {
        userName: "",
        mobile: "",
        address: "",
        vehicleModel: {
            brand: undefined,
            engineType: undefined,
            model: undefined,
            cc: undefined,
        },
        licensePlate: "",
      },
      initialServiceRequest: "",
    },
  });

  const handleFormSubmit = (data: z.infer<typeof formSchema>) => {
    const { brand, engineType, model, cc } = data.vehicleDetails.vehicleModel;
    const vehicleModelString = `${brand} - ${model} - ${cc}cc (${engineType})`;
    const submissionData = {
        ...data,
        vehicleDetails: {
            ...data.vehicleDetails,
            vehicleModel: vehicleModelString
        }
    };
    onSubmit(submissionData);
  }

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

      // This part is trickier with the new vehicleModel object structure
      // For now, we just fill user details
      toast({
        title: "Repeat Customer Found!",
        description: `Details for ${vehicleDetails.userName} have been auto-filled.`,
      });
    }
  };

  const engineTypes = useMemo(() => {
    if (!selectedBrand) return [];
    return Object.keys(vehicleData[selectedBrand] || {});
  }, [selectedBrand]);

  const models = useMemo(() => {
    if (!selectedBrand || !selectedEngineType) return [];
    return Object.keys(vehicleData[selectedBrand]?.[selectedEngineType] || {});
  }, [selectedBrand, selectedEngineType]);

  const ccs = useMemo(() => {
    if (!selectedBrand || !selectedEngineType || !selectedModel) return [];
    return vehicleData[selectedBrand]?.[selectedEngineType]?.[selectedModel] || [];
  }, [selectedBrand, selectedEngineType, selectedModel]);


  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>New Service Intake</CardTitle>
        <CardDescription>
          Enter customer, vehicle, and service details to create a new job.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
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
                            setSelectedBrand(value);
                            form.setValue('vehicleDetails.vehicleModel.engineType', undefined as any);
                            form.setValue('vehicleDetails.vehicleModel.model', undefined as any);
                            form.setValue('vehicleDetails.vehicleModel.cc', undefined as any);
                            setSelectedEngineType(undefined);
                            setSelectedModel(undefined);
                        }} defaultValue={field.value}>
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
                  name="vehicleDetails.vehicleModel.engineType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Engine Type</FormLabel>
                        <Select onValueChange={(value) => {
                             field.onChange(value);
                             setSelectedEngineType(value)
                             form.setValue('vehicleDetails.vehicleModel.model', undefined as any);
                             form.setValue('vehicleDetails.vehicleModel.cc', undefined as any);
                             setSelectedModel(undefined);
                        }} value={field.value} disabled={!selectedBrand}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Select engine type" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {engineTypes.map(type => (
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
                        <Select onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedModel(value);
                             form.setValue('vehicleDetails.vehicleModel.cc', undefined as any);
                        }} value={field.value} disabled={!selectedEngineType}>
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
                 <FormField
                  control={form.control}
                  name="vehicleDetails.vehicleModel.cc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CC</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!selectedModel}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Select CC" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                               {ccs.map(cc => (
                                    <SelectItem key={cc} value={String(cc)}>{cc}cc</SelectItem>
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
