"use client";

import { useState } from "react";
import type { VehicleDetails, ServiceItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  PlusCircle,
  Trash2,
  User,
} from "lucide-react";
import AiSuggestions from "./ai-suggestions";

type ServiceLoggerProps = {
  vehicleDetails: VehicleDetails;
  initialServices: ServiceItem[];
  onSubmit: (items: ServiceItem[]) => void;
  onBack: () => void;
};

export default function ServiceLogger({
  vehicleDetails,
  initialServices,
  onSubmit,
  onBack,
}: ServiceLoggerProps) {
  const [items, setItems] = useState<ServiceItem[]>(initialServices);
  const [description, setDescription] = useState("");
  const [partsCost, setPartsCost] = useState("");
  const [laborCost, setLaborCost] = useState("");

  const handleAddItem = () => {
    if (!description || (!partsCost && !laborCost)) {
      alert("Please provide a description and at least one cost.");
      return;
    }
    const newItem: ServiceItem = {
      id: crypto.randomUUID(),
      description,
      partsCost: parseFloat(partsCost) || 0,
      laborCost: parseFloat(laborCost) || 0,
    };
    setItems([...items, newItem]);
    setDescription("");
    setPartsCost("");
    setLaborCost("");
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const totalCost = items.reduce(
    (acc, item) => acc + item.partsCost + item.laborCost,
    0
  );

  const handleSuggestionSelect = (suggestion: string) => {
    setDescription(prev => prev ? `${prev}, ${suggestion}` : suggestion);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Log Service Details</CardTitle>
        <div className="flex justify-between items-start">
            <CardDescription>
                Add service items, parts, and labor costs. Use the AI assistant for service suggestions.
            </CardDescription>
        </div>
        <div className="text-sm text-muted-foreground pt-2 flex flex-wrap gap-x-6 gap-y-2">
            <div className="flex items-center gap-2">
                <User className="w-4 h-4"/> <span>{vehicleDetails.userName}</span>
            </div>
            <div className="flex items-center gap-2">
                <Bike className="w-4 h-4"/> <span>{vehicleDetails.vehicleModel} - {vehicleDetails.licensePlate}</span>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <AiSuggestions vehicleModel={vehicleDetails.vehicleModel} onSuggestionSelect={handleSuggestionSelect} />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-4 border rounded-lg">
          <div className="md:col-span-5">
            <Label htmlFor="description">Service/Part Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Engine oil change, air filter replacement"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="partsCost">Parts Cost (₹)</Label>
            <Input
              id="partsCost"
              type="number"
              value={partsCost}
              onChange={(e) => setPartsCost(e.target.value)}
              placeholder="e.g. 500"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="laborCost">Labor Cost (₹)</Label>
            <Input
              id="laborCost"
              type="number"
              value={laborCost}
              onChange={(e) => setLaborCost(e.target.value)}
              placeholder="e.g. 200"
            />
          </div>
          <div className="md:col-span-3">
            <Button onClick={handleAddItem} className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Service Items</h3>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Parts Cost</TableHead>
                  <TableHead className="text-right">Labor Cost</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                      No service items added yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium max-w-xs break-words">{item.description}</TableCell>
                      <TableCell className="text-right">₹{item.partsCost.toFixed(2)}</TableCell>
                      <TableCell className="text-right">₹{item.laborCost.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{(item.partsCost + item.laborCost).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item.id)}
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end mt-4 pr-4">
              <div className="text-xl font-bold">
                  Total: ₹{totalCost.toFixed(2)}
              </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={() => onSubmit(items)} disabled={items.length === 0}>
          Generate Bill <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
