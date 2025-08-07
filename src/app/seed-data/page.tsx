"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { writeBatch, doc, collection } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoaderCircle, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


// The initial data to be seeded.
const vehicleDataToSeed = {
    "Honda": {
        "BS4": ["Activa (110cc)", "Dio (110cc)", "Shine (125cc)"],
        "BS6": ["Activa 6G (110cc)", "Dio (125cc)", "Shine (125cc)", "SP 125 (125cc)", "Unicorn (160cc)", "Hornet 2.0 (184cc)", "CB350 (350cc)"]
    },
    "TVS": {
        "BS4": ["Jupiter (110cc)", "NTORQ 125 (125cc)", "Apache RTR (160cc)"],
        "BS6": ["Jupiter (125cc)", "Raider (125cc)", "Apache RTR (180cc)", "Apache RTR (200cc)", "Ronin (225cc)"],
        "Electric": ["iQube"]
    },
    "Hero": {
        "BS4": ["Splendor+ (100cc)", "HF Deluxe (100cc)", "Passion+ (100cc)"],
        "BS6": ["Super Splendor (125cc)", "Glamour (125cc)", "Xtreme 160R (160cc)", "Karizma XMR (210cc)"],
        "Electric": ["Vida V1"]
    },
    "Bajaj": {
        "BS4": ["Platina (100cc)", "CT 100 (100cc)", "Pulsar (150cc)"],
        "BS6": ["Platina (110cc)", "CT 110X (110cc)", "Pulsar (125cc)", "Pulsar (160cc)", "Pulsar (200cc)", "Pulsar (250cc)", "Avenger (160cc)", "Avenger (220cc)", "Dominar (250cc)", "Dominar (400cc)"],
        "Electric": ["Chetak"]
    },
    "Royal Enfield": {
        "BS6": ["Hunter 350 (350cc)", "Classic 350 (350cc)", "Bullet 350 (350cc)", "Meteor 350 (350cc)", "Himalayan (411cc)", "Himalayan (450cc)", "Interceptor 650 (650cc)", "Continental GT 650 (650cc)"]
    },
    "Suzuki": {
        "BS6": ["Access 125 (125cc)", "Burgman Street (125cc)", "Gixxer (155cc)", "V-Strom SX (250cc)"]
    },
    "Yamaha": {
        "BS6": ["RayZR 125 (125cc)", "Fascino 125 (125cc)", "FZ-S FI (149cc)", "R15 V4 (155cc)", "MT-15 V2 (155cc)"]
    },
    "Other": {
        "Other": ["Other"]
    }
};

export default function SeedDataPage() {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSeedData = async () => {
        setLoading(true);
        try {
            const batch = writeBatch(db);
            const vehicleDataRef = collection(db, 'vehicleData');

            for (const brand in vehicleDataToSeed) {
                const brandRef = doc(vehicleDataRef, brand);
                // Type assertion to match the expected structure
                const emissionData = vehicleDataToSeed[brand as keyof typeof vehicleDataToSeed];
                batch.set(brandRef, { name: brand, ...emissionData });
            }

            await batch.commit();

            toast({
                title: "Data Seeded Successfully!",
                description: "The initial vehicle data has been uploaded to Firestore.",
            });

        } catch (error) {
            console.error("Error seeding data: ", error);
            let errorMessage = "An unknown error occurred.";
            if (error instanceof Error) {
                errorMessage = error.message;
            }
             if ((error as any).code === 'permission-denied') {
                errorMessage = "Permission denied. You must be an admin to perform this action. Check your Firestore rules and user UID.";
            }

            toast({
                title: "Error Seeding Data",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8 flex justify-center items-center min-h-screen">
            <Card className="max-w-xl">
                <CardHeader>
                    <CardTitle>Seed Firestore Database</CardTitle>
                    <CardDescription>
                        Click the button below to upload the initial vehicle dataset to your Firestore database.
                        This is a one-time action required to get the app running with the new dynamic data structure.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert variant="destructive">
                        <TriangleAlert className="h-4 w-4" />
                        <AlertTitle>Important</AlertTitle>
                        <AlertDescription>
                            Only run this if your 'vehicleData' collection in Firestore is empty. Running this multiple times
                            will overwrite existing data. You must be logged in as an admin to perform this action.
                        </AlertDescription>
                    </Alert>
                    <Button
                        onClick={handleSeedData}
                        disabled={loading}
                        className="w-full"
                    >
                        {loading ? (
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        {loading ? 'Seeding Data...' : 'Seed Vehicle Data'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
