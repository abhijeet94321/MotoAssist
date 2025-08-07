"use client";

import { useState } from "react";
import type { ServiceItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
  PlusCircle,
  Trash2,
} from "lucide-react";
import AiSuggestions from "./ai-suggestions";

type ServiceLoggerProps = {
  vehicleModel: string;
  initialServices: ServiceItem[];
  onItemsUpdate: (items: ServiceItem[]) => void;
};

export default function ServiceLogger({
  vehicleModel,
  initialServices,
  onItemsUpdate,
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
    const updatedItems = [...items, newItem]
    setItems(updatedItems);
    onItemsUpdate(updatedItems);
    setDescription("");
    setPartsCost("");
    setLaborCost("");
  };

  const handleRemoveItem = (id: string) => {
    const updatedItems = items.filter((item) => item.id !== id);
    setItems(updatedItems);
    onItemsUpdate(updatedItems);
  };

  const totalCost = items.reduce(
    (acc, item) => acc + item.partsCost + item.laborCost,
    0
  );

  const handleSuggestionSelect = (suggestion: string) => {
    setDescription(prev => prev ? `${prev}, ${suggestion}` : suggestion);
  };

  return (
    <div className="space-y-8">
      <AiSuggestions vehicleModel={vehicleModel} onSuggestionSelect={handleSuggestionSelect} />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-4 border rounded-lg">
        <div className="md:col-span-12 lg:col-span-5">
          <Label htmlFor="description">Service/Part Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Engine oil change, air filter replacement"
          />
        </div>
        <div className="md:col-span-6 lg:col-span-2">
          <Label htmlFor="partsCost">Parts Cost (₹)</Label>
          <Input
            id="partsCost"
            type="number"
            value={partsCost}
            onChange={(e) => setPartsCost(e.target.value)}
            placeholder="e.g. 500"
          />
        </div>
        <div className="md:col-span-6 lg:col-span-2">
          <Label htmlFor="laborCost">Labor Cost (₹)</Label>
          <Input
            id="laborCost"
            type="number"
            value={laborCost}
            onChange={(e) => setLaborCost(e.target.value)}
            placeholder="e.g. 200"
          />
        </div>
        <div className="md:col-span-12 lg:col-span-3">
          <Button onClick={handleAddItem} className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">Service Items</h3>
        <div className="border rounded-lg overflow-x-auto">
          <Table className="min-w-[600px]">
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
    </div>
  );
}
