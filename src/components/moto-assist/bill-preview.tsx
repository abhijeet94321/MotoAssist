"use client";

import { useRef } from "react";
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
import { Separator } from "@/components/ui/separator";
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
  FileText,
  Share2,
  RefreshCw,
  FileDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import BillPDF from "./bill-pdf";

type BillPreviewProps = {
  vehicleDetails: VehicleDetails;
  serviceItems: ServiceItem[];
  onBack: () => void;
  onNew: () => void;
};

// A simple SVG for WhatsApp icon as it's not in lucide-react
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


export default function BillPreview({
  vehicleDetails,
  serviceItems,
  onBack,
  onNew,
}: BillPreviewProps) {
  const { toast } = useToast();
  const pdfRef = useRef<HTMLDivElement>(null);

  const totalCost = serviceItems.reduce(
    (acc, item) => acc + item.partsCost + item.laborCost,
    0
  );

  const generateBillText = () => {
    let text = `*MotoAssist Service Bill*\n\n`;
    text += `*Date:* ${new Date().toLocaleDateString()}\n\n`;
    text += `*Customer Details*\n`;
    text += `Name: ${vehicleDetails.userName}\n`;
    text += `Mobile: ${vehicleDetails.mobile}\n\n`;
    text += `*Vehicle Details*\n`;
    text += `Model: ${vehicleDetails.vehicleModel}\n`;
    text += `License: ${vehicleDetails.licensePlate}\n\n`;
    text += `*Service Details*\n`;
    text += `--------------------\n`;
    serviceItems.forEach((item, index) => {
      text += `*${index + 1}. ${item.description}*\n`;
      text += `   Parts: ₹${item.partsCost.toFixed(2)}\n`;
      text += `   Labor: ₹${item.laborCost.toFixed(2)}\n`;
      text += `   Subtotal: ₹${(item.partsCost + item.laborCost).toFixed(2)}\n\n`;
    });
    text += `--------------------\n`;
    text += `*TOTAL AMOUNT: ₹${totalCost.toFixed(2)}*\n\n`;
    text += `Thank you for choosing MotoAssist!`;
    return text;
  };

  const handleShare = () => {
    const billText = generateBillText();
    const encodedText = encodeURIComponent(billText);
    const mobileNumber = vehicleDetails.mobile.replace(/\D/g, ''); // Remove non-digits
    
    // Using api.whatsapp.com is more robust for cross-platform sharing
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${mobileNumber}&text=${encodedText}`;
    
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    
    toast({
      title: "Bill Ready to Share",
      description: "Your WhatsApp application has been opened to share the bill.",
    });
  };

  const handleDownloadPdf = async () => {
    const input = pdfRef.current;
    if (!input) {
      toast({
        title: "Error generating PDF",
        description: "Could not find the bill content.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Generating PDF...",
      description: "Please wait while we create your PDF bill.",
    });

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      await pdf.html(input, {
        callback: function (doc) {
          doc.save(`bill-${vehicleDetails.licensePlate}.pdf`);
          toast({
            title: 'PDF Downloaded',
            description: 'Your bill has been successfully downloaded.',
          });
        },
        x: 0,
        y: 0,
        width: 210, // A4 width in mm
        windowWidth: input.scrollWidth
      });
    } catch (error) {
       console.error("Failed to generate PDF", error);
       toast({
        title: 'Error generating PDF',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };


  return (
    <>
    <div className="hidden">
      <div ref={pdfRef}>
        <BillPDF vehicleDetails={vehicleDetails} serviceItems={serviceItems} />
      </div>
    </div>
    <Card className="max-w-3xl mx-auto shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-primary" />
          <div>
            <CardTitle>Service Bill</CardTitle>
            <CardDescription>
              Review the final bill. You can share it directly or download a PDF.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg">
          <div>
            <h3 className="font-semibold mb-2">Customer</h3>
            <p>{vehicleDetails.userName}</p>
            <p>{vehicleDetails.mobile}</p>
            <p>{vehicleDetails.address}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Vehicle</h3>
            <p>{vehicleDetails.vehicleModel}</p>
            <p>{vehicleDetails.licensePlate}</p>
          </div>
        </div>

        <Separator />

        <div>
           <div className="border rounded-lg overflow-hidden">
             <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-1/2">Description</TableHead>
                    <TableHead className="text-right">Parts</TableHead>
                    <TableHead className="text-right">Labor</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {serviceItems.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.description}</TableCell>
                        <TableCell className="text-right">₹{item.partsCost.toFixed(2)}</TableCell>
                        <TableCell className="text-right">₹{item.laborCost.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-semibold">
                        ₹{(item.partsCost + item.laborCost).toFixed(2)}
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
           </div>
        </div>

        <Separator />

        <div className="flex justify-end">
          <div className="text-right">
            <p className="text-muted-foreground">Total Amount</p>
            <p className="text-3xl font-bold text-primary">₹{totalCost.toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Services
        </Button>
        <div className="flex flex-wrap gap-2 justify-center">
            <Button variant="secondary" onClick={onNew}>
                <RefreshCw className="mr-2 h-4 w-4" /> New Service
            </Button>
            <Button variant="outline" onClick={handleDownloadPdf}>
                <FileDown className="mr-2 h-4 w-4" /> Download PDF
            </Button>
            <Button onClick={handleShare} className="bg-[#25D366] hover:bg-[#128C7E] text-white">
                <WhatsAppIcon className="mr-2 h-4 w-4" /> Share on WhatsApp
            </Button>
        </div>
      </CardFooter>
    </Card>
    </>
  );
}
