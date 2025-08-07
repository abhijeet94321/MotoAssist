"use client";

import type { ServiceJob, PaymentStatus } from "@/lib/types";
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
    CreditCard,
    Wallet,
    QrCode,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Image from "next/image";
import { useState } from "react";

type BillPreviewProps = {
  job: ServiceJob;
  onPaymentUpdate: (jobId: string, status: PaymentStatus) => void;
  onBack: () => void;
  onPendingBill: () => void;
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
  job,
  onPaymentUpdate,
  onBack,
  onPendingBill,
}: BillPreviewProps) {
  const { toast } = useToast();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(job.payment.status);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const { vehicleDetails, serviceItems } = job;

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

  const handleConfirmPayment = () => {
    if (paymentStatus === 'Paid - Online') {
        setIsQrModalOpen(true);
    } else if (paymentStatus !== 'Pending') {
        onPaymentUpdate(job.id, paymentStatus);
    }
  };

  const handleQrConfirm = () => {
    onPaymentUpdate(job.id, 'Paid - Online');
    setIsQrModalOpen(false);
  }

  const handleQrCancel = () => {
    setIsQrModalOpen(false);
  }

  return (
    <>
    <Card className="max-w-3xl mx-auto shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-primary" />
          <div>
            <CardTitle>Service Bill & Payment</CardTitle>
            <CardDescription>
              Review the final bill, share it, and record the payment status.
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

        <div className="overflow-x-auto">
           <div className="border rounded-lg overflow-hidden min-w-[600px]">
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

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="w-full sm:w-1/3">
            <h3 className="font-semibold mb-2">Payment Status</h3>
            <Select onValueChange={(v) => setPaymentStatus(v as PaymentStatus)} defaultValue={paymentStatus}>
                <SelectTrigger>
                    <SelectValue placeholder="Update payment status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Paid - Cash">Paid - Cash</SelectItem>
                    <SelectItem value="Paid - Online">Paid - Online</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="text-right w-full sm:w-auto">
            <p className="text-muted-foreground">Total Amount</p>
            <p className="text-3xl font-bold text-primary">₹{totalCost.toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 justify-center w-full sm:w-auto">
            {paymentStatus === 'Pending' ? (
                 <Button onClick={onPendingBill} variant="secondary" className="w-full">
                    Bill Pending
                 </Button>
            ) : (
                <Button onClick={handleConfirmPayment} className="w-full">
                    {paymentStatus === 'Paid - Cash' && <Wallet className="mr-2 h-4 w-4" />}
                    {paymentStatus === 'Paid - Online' && <CreditCard className="mr-2 h-4 w-4" />}
                    Confirm Payment
                </Button>
            )}

            <Button onClick={handleShare} className="bg-[#25D366] hover:bg-[#128C7E] text-white w-full">
                <WhatsAppIcon className="mr-2 h-4 w-4" /> Share Bill
            </Button>
        </div>
      </CardFooter>
    </Card>

    <AlertDialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center"><QrCode className="mr-2"/>Scan to Pay Online</AlertDialogTitle>
                <AlertDialogDescription>
                   Please scan the QR code below to complete the payment. After payment, click "Confirm Payment".
                   If you choose to pay by other means, please Cancel.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex justify-center p-4">
                <Image 
                    src="https://github.com/abhijeet94321/sanjeevika-assets/raw/main/111.jpg" 
                    alt="Payment QR Code"
                    width={250}
                    height={250}
                    data-ai-hint="QR code"
                />
            </div>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={handleQrCancel}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleQrConfirm}>Confirm Payment</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
