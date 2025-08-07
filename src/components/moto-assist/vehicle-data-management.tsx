"use client";

import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, writeBatch, query, orderBy } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LoaderCircle, PlusCircle, Trash2, X, Tag, GripVertical, Upload } from "lucide-react";

type VehicleData = Record<string, Record<string, string[]>>;

type UploadedItem = {
    Brand: string;
    "Emission Type"?: string;
    EngineType?: string; // Accept legacy key
    Model: string;
};

export default function VehicleDataManagement() {
  const [vehicleData, setVehicleData] = useState<VehicleData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newBrand, setNewBrand] = useState("");
  const [newEmissionTypes, setNewEmissionTypes] = useState<Record<string, string>>({}); // { brand: 'newType' }
  const [newModels, setNewModels] = useState<Record<string, Record<string, string>>>({}); // { brand: { emissionType: 'newModel' } }
  const [jsonInput, setJsonInput] = useState("");
  
  const { toast } = useToast();

  const fetchVehicleData = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "vehicleData"), orderBy("name"));
      const querySnapshot = await getDocs(q);
      const data: VehicleData = {};
      querySnapshot.forEach((doc) => {
        const docData = doc.data();
        const brandName = doc.id;
        // The 'name' field is used for ordering, but we need the brand name as the key
        data[brandName] = docData as Record<string, string[]>;
      });
      setVehicleData(data);
    } catch (error) {
      console.error("Error fetching vehicle data: ", error);
      toast({
        title: "Error Fetching Data",
        description: "Could not load vehicle data from Firestore.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchVehicleData();
  }, [fetchVehicleData]);

  const handleSave = async () => {
    setSaving(true);
    const batch = writeBatch(db);
    try {
        Object.keys(vehicleData).forEach(brand => {
            const brandRef = doc(db, 'vehicleData', brand);
            // The document now contains the emission types and models directly.
            // The 'name' field is added for ordering purposes when querying.
            const dataToSave = { name: brand, ...vehicleData[brand] };
            // Since vehicleData[brand] might contain the 'name' key from fetching, we remove it before saving.
            delete dataToSave[brand as keyof typeof dataToSave]?.name;

            batch.set(brandRef, dataToSave, { merge: true });
        });

        await batch.commit();
        toast({
            title: "Data Saved",
            description: "Your changes to the vehicle data have been saved successfully."
        });
    } catch (error: any) {
        let errorMessage = error.message;
        if (error.code === 'permission-denied') {
            errorMessage = "Permission Denied. You must be an admin to save changes.";
        }
        toast({
            title: "Error Saving Data",
            description: errorMessage,
            variant: "destructive",
        });
    } finally {
        setSaving(false);
        fetchVehicleData(); // Re-fetch to ensure sync with DB
    }
  };

  const handleAddBrand = () => {
    if (!newBrand.trim()) return;
    const brandKey = newBrand.trim();
    if (vehicleData[brandKey]) {
      toast({ title: "Brand exists", description: "This brand already exists.", variant: "destructive" });
      return;
    }
    // No need to add 'name' field here, it's handled on save.
    setVehicleData(prev => ({ ...prev, [brandKey]: {} }));
    setNewBrand("");
  };

  const handleAddEmissionType = (brand: string) => {
    const type = (newEmissionTypes[brand] || "").trim();
    if (!type) return;
    if (vehicleData[brand][type]) {
      toast({ title: "Type exists", description: "This emission type already exists for this brand.", variant: "destructive" });
      return;
    }
    setVehicleData(prev => ({
      ...prev,
      [brand]: {
        ...prev[brand],
        [type]: []
      }
    }));
    setNewEmissionTypes(prev => ({ ...prev, [brand]: "" }));
  };

  const handleAddModel = (brand: string, emissionType: string) => {
    const model = (newModels[brand]?.[emissionType] || "").trim();
    if (!model) return;
    if (vehicleData[brand][emissionType].includes(model)) {
       toast({ title: "Model exists", description: "This model already exists.", variant: "destructive" });
       return;
    }
    setVehicleData(prev => ({
      ...prev,
      [brand]: {
        ...prev[brand],
        [emissionType]: [...prev[brand][emissionType], model]
      }
    }));
    setNewModels(prev => {
        const updated = { ...prev };
        if (updated[brand]) {
            updated[brand][emissionType] = "";
        }
        return updated;
    });
  };

  const handleDeleteBrand = (brand: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete the brand "${brand}" and all its data? This cannot be undone.`);
    if (confirmed) {
        const batch = writeBatch(db);
        const brandRef = doc(db, 'vehicleData', brand);
        batch.delete(brandRef);
        batch.commit().then(() => {
            toast({ title: "Brand Deleted", description: `"${brand}" has been removed.` });
            fetchVehicleData();
        }).catch(err => toast({ title: "Error", description: err.message, variant: "destructive" }));
    }
  };

  const handleDeleteEmissionType = (brand: string, emissionType: string) => {
     setVehicleData(prev => {
        const newBrandData = { ...prev[brand] };
        delete newBrandData[emissionType];
        return { ...prev, [brand]: newBrandData };
    });
  }

  const handleDeleteModel = (brand: string, emissionType: string, model: string) => {
    setVehicleData(prev => ({
        ...prev,
        [brand]: {
            ...prev[brand],
            [emissionType]: prev[brand][emissionType].filter(m => m !== model)
        }
    }));
  }

  const handleBulkUpload = () => {
    if (!jsonInput.trim()) {
        toast({ title: "No data", description: "Please paste JSON data into the text area.", variant: "destructive" });
        return;
    }
    try {
        const data: UploadedItem[] = JSON.parse(jsonInput);
        if (!Array.isArray(data)) throw new Error("JSON must be an array.");

        let updatedCount = 0;
        const newData = { ...vehicleData };

        for (const item of data) {
            const brand = item.Brand;
            const emissionType = item["Emission Type"] || item.EngineType; // Accept both keys
            const model = item.Model;

            if (!brand || !emissionType || !model) {
                console.warn("Skipping invalid item:", item);
                continue;
            }
            
            // No need to add 'name' field here
            if (!newData[brand]) newData[brand] = {};
            if (!newData[brand][emissionType]) newData[brand][emissionType] = [];
            if (!newData[brand][emissionType].includes(model)) {
                newData[brand][emissionType].push(model);
                updatedCount++;
            }
        }

        setVehicleData(newData);
        setJsonInput("");
        toast({
            title: "Data Processed",
            description: `${updatedCount} new model(s) were added. Click 'Save All Changes' to persist them to the database.`
        });

    } catch (e: any) {
        toast({
            title: "Invalid JSON",
            description: `Could not parse the data. Please check the format. Error: ${e.message}`,
            variant: "destructive",
        });
    }
  };

  if (loading) {
    return <div className="text-center py-10"><LoaderCircle className="mx-auto h-8 w-8 animate-spin" /></div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle Data Management</CardTitle>
        <CardDescription>
          Add, edit, or remove vehicle data individually or via bulk JSON upload. Click 'Save All Changes' when you're done.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5"/>Bulk Upload from JSON</CardTitle>
                <CardDescription>
                    Convert your Excel file to JSON and paste it here. The JSON must be an array of objects with keys "Brand", "Emission Type" (or "EngineType"), and "Model".
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <Textarea
                    placeholder='[{"Brand": "Honda", "Emission Type": "BS6", "Model": "Activa (110cc)"}]'
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    rows={5}
                />
                <Button onClick={handleBulkUpload}>Process & Add Data</Button>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Manual Data Entry</CardTitle>
                <CardDescription>Add or edit brands, types, and models one by one.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                    <Input
                        value={newBrand}
                        onChange={e => setNewBrand(e.target.value)}
                        placeholder="Enter New Brand Name"
                    />
                    <Button onClick={handleAddBrand}><PlusCircle className="mr-2 h-4 w-4" /> Add Brand</Button>
                </div>
                
                <Accordion type="multiple" className="w-full space-y-2">
                {Object.keys(vehicleData).sort().map(brand => (
                    <Card key={brand} className="overflow-hidden">
                    <AccordionItem value={brand} className="border-0">
                        <div className="flex items-center p-4 pr-12 relative bg-muted/50">
                            <AccordionTrigger className="flex-1 text-left hover:no-underline">
                                <div className="flex items-center gap-2">
                                    <GripVertical className="h-5 w-5 text-muted-foreground"/>
                                    <span className="text-lg font-semibold">{brand}</span>
                                </div>
                            </AccordionTrigger>
                            <Button variant="destructive" size="icon" className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8" onClick={(e) => { e.stopPropagation(); handleDeleteBrand(brand); }}>
                                <Trash2 className="h-4 w-4"/>
                            </Button>
                        </div>
                        <AccordionContent className="p-4 space-y-4">
                        
                        {Object.keys(vehicleData[brand]).filter(key => key !== 'name').map(emissionType => (
                            <div key={emissionType} className="p-4 border rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold text-md flex items-center gap-2"><Tag className="w-4 h-4 text-primary"/>{emissionType}</h4>
                                <Button variant="ghost" size="icon" className="text-destructive h-7 w-7" onClick={() => handleDeleteEmissionType(brand, emissionType)}>
                                    <X className="h-4 w-4"/>
                                </Button>
                                </div>
                                <ul className="space-y-1 pl-6 list-disc list-outside">
                                {vehicleData[brand][emissionType] && Array.isArray(vehicleData[brand][emissionType]) && vehicleData[brand][emissionType].map(model => (
                                    <li key={model} className="flex items-center justify-between">
                                    <span>{model}</span>
                                    <Button variant="ghost" size="icon" className="text-destructive h-6 w-6" onClick={() => handleDeleteModel(brand, emissionType, model)}>
                                        <Trash2 className="h-3 w-3"/>
                                    </Button>
                                    </li>
                                ))}
                                </ul>
                                <div className="flex items-center gap-2 mt-2">
                                    <Input 
                                        placeholder="e.g. New Model (150cc)"
                                        value={newModels[brand]?.[emissionType] || ""}
                                        onChange={e => setNewModels(prev => ({...prev, [brand]: {...prev[brand], [emissionType]: e.target.value}}))}
                                    />
                                    <Button size="sm" onClick={() => handleAddModel(brand, emissionType)}>Add Model</Button>
                                </div>
                            </div>
                        ))}

                        <div className="flex items-center gap-2 pt-4 border-t">
                            <Input 
                                placeholder="e.g. BS6, Electric"
                                value={newEmissionTypes[brand] || ""}
                                onChange={e => setNewEmissionTypes(prev => ({ ...prev, [brand]: e.target.value }))}
                            />
                            <Button variant="secondary" onClick={() => handleAddEmissionType(brand)}>Add Emission Type</Button>
                        </div>
                        </AccordionContent>
                    </AccordionItem>
                    </Card>
                ))}
                </Accordion>
            </CardContent>
        </Card>


         <Button onClick={handleSave} disabled={saving} className="w-full text-lg py-6">
            {saving ? <LoaderCircle className="mr-2 h-5 w-5 animate-spin"/> : null}
            Save All Changes
         </Button>
      </CardContent>
    </Card>
  );
}
