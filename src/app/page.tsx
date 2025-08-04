"use client";

import { useMemo, useState } from 'react';
import type { ServiceJob } from '@/lib/types';
import Dashboard from '@/components/moto-assist/dashboard';
import ServiceJobsList from '@/components/moto-assist/service-jobs-list';
import { Button } from '@/components/ui/button';
import { PlusCircle, Cog, LayoutDashboard, List, IndianRupee, History } from 'lucide-react';
import ServiceIntakeForm from '@/components/moto-assist/service-intake-form';
import ServiceStatusUpdater from '@/components/moto-assist/service-status-updater';
import BillPreview from '@/components/moto-assist/bill-preview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import PaymentsList from '@/components/moto-assist/payments-list';
import HistoryList from '@/components/moto-assist/history-list';
import JobDetailsView from '@/components/moto-assist/job-details-view';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


type View = 'main' | 'new_service' | 'update_status' | 'billing' | 'view_details';

export default function Home() {
  const [view, setView] = useState<View>('main');
  const [serviceJobs, setServiceJobs] = useState<ServiceJob[]>([]);
  const [activeJob, setActiveJob] = useState<ServiceJob | null>(null);
  const { toast } = useToast();

  const handleNewServiceClick = () => {
    setActiveJob(null);
    setView('new_service');
  };
  
  const handleIntakeSubmit = (data: Omit<ServiceJob, 'id' | 'status' | 'serviceItems' | 'payment'>) => {
    const isRepeatCustomer = serviceJobs.some(
      (job) => job.vehicleDetails.mobile === data.vehicleDetails.mobile
    );

    const newJob: ServiceJob = {
      id: crypto.randomUUID(),
      ...data,
      status: 'Service Required',
      serviceItems: [],
      payment: { status: 'Pending' },
      isRepeat: isRepeatCustomer,
      intakeDate: new Date().toISOString(),
    };
    setServiceJobs(prev => [...prev, newJob]);
    
    // Send WhatsApp Welcome Message
    const { userName, vehicleModel, licensePlate, mobile } = newJob.vehicleDetails;
    const message = `Thank you for choosing SAIKRUPA SERVICE CENTER, ${userName}! We have received your vehicle (${vehicleModel}, ${licensePlate}) for service. We will keep you updated on the progress.`;
    const encodedText = encodeURIComponent(message);
    const mobileNumber = mobile.replace(/\D/g, '');
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${mobileNumber}&text=${encodedText}`;
    
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    
    toast({
      title: "Welcome Message Sent",
      description: "A welcome message has been prepared to send via WhatsApp.",
    });

    setView('main');
  };

  const handleUpdateStatusClick = (job: ServiceJob) => {
    setActiveJob(job);
    setView('update_status');
  };

  const handleStatusUpdate = (jobId: string, status: ServiceJob['status'], items?: ServiceJob['serviceItems']) => {
    setServiceJobs(prev => prev.map(job => {
      if (job.id === jobId) {
        const updatedJob = { ...job, status };
        if (items) {
          updatedJob.serviceItems = items;
        }
        if (status === 'Billed') {
          setActiveJob(updatedJob);
          setView('billing');
        } else {
          setView('main');
        }
        return updatedJob;
      }
      return job;
    }));
  };

  const handlePaymentUpdate = (jobId: string, paymentStatus: ServiceJob['payment']['status']) => {
     setServiceJobs(prev => prev.map(job => {
        if (job.id === jobId) {
            const updatedJob = { ...job, status: 'Completed', payment: { status: paymentStatus } };
            if (paymentStatus === 'Paid - Cash' || paymentStatus === 'Paid - Online') {
                updatedJob.status = 'Cycle Complete';
            }
            return updatedJob;
        }
        return job;
     }));
     setView('main');
  };
  
  const handleViewDetails = (job: ServiceJob) => {
    setActiveJob(job);
    setView('view_details');
  };

  const handleDeleteJob = (jobId: string) => {
    setServiceJobs(prev => prev.filter(job => job.id !== jobId));
    toast({
        title: "Job Deleted",
        description: "The service record has been permanently removed.",
    });
  };

  const handleBackToMain = () => {
    setView('main');
    setActiveJob(null);
  };
  
  const ongoingJobs = useMemo(() => {
    return serviceJobs.filter(
      (job) => job.status === 'Service Required' || job.status === 'In Progress'
    );
  }, [serviceJobs]);

  const paymentJobs = useMemo(() => {
    return serviceJobs.filter(
      (job) => job.status === 'Completed' || job.status === 'Billed'
    );
  }, [serviceJobs]);
  
  const completedJobs = useMemo(() => {
    return serviceJobs.filter(
      (job) => job.status === 'Cycle Complete'
    );
  }, [serviceJobs]);


  const renderView = () => {
    switch (view) {
      case 'new_service':
        return (
          <ServiceIntakeForm
            onSubmit={handleIntakeSubmit}
            onBack={handleBackToMain}
            existingJobs={serviceJobs}
          />
        );
      case 'update_status':
        if (activeJob) {
          return (
            <ServiceStatusUpdater
              job={activeJob}
              onUpdate={handleStatusUpdate}
              onBack={handleBackToMain}
            />
          );
        }
        return null;
      case 'billing':
        if (activeJob) {
          return (
            <BillPreview
              job={activeJob}
              onPaymentUpdate={handlePaymentUpdate}
              onBack={() => handleUpdateStatusClick(activeJob)}
              onPendingBill={handleBackToMain}
            />
          );
        }
        return null;
      case 'view_details':
        if (activeJob) {
            return (
                <JobDetailsView job={activeJob} onBack={handleBackToMain} />
            );
        }
        return null;
      case 'main':
      default:
        return (
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="flex flex-wrap h-auto justify-center">
              <TabsTrigger value="dashboard"><LayoutDashboard className="mr-0 sm:mr-2 h-4 w-4" /><span className="hidden sm:inline">Dashboard</span></TabsTrigger>
              <TabsTrigger value="jobs"><List className="mr-0 sm:mr-2 h-4 w-4" /><span className="hidden sm:inline">Ongoing</span></TabsTrigger>
              <TabsTrigger value="payments"><IndianRupee className="mr-0 sm:mr-2 h-4 w-4" /><span className="hidden sm:inline">Payments</span></TabsTrigger>
              <TabsTrigger value="history"><History className="mr-0 sm:mr-2 h-4 w-4" /><span className="hidden sm:inline">History</span></TabsTrigger>
            </TabsList>
            <TabsContent value="dashboard">
              <Dashboard jobs={serviceJobs} />
            </TabsContent>
            <TabsContent value="jobs">
               <ServiceJobsList
                jobs={ongoingJobs}
                onUpdateStatusClick={handleUpdateStatusClick}
              />
            </TabsContent>
             <TabsContent value="payments">
               <PaymentsList
                jobs={paymentJobs}
                onUpdateStatusClick={handleUpdateStatusClick}
              />
            </TabsContent>
            <TabsContent value="history">
               <HistoryList
                  jobs={completedJobs}
                  onViewDetails={handleViewDetails}
                  onDelete={handleDeleteJob}
                />
            </TabsContent>
          </Tabs>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto p-4 sm:p-6 md:p-8">
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <Cog className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                SAIKRUPA SERVICE CENTER
              </h1>
              <p className="text-muted-foreground">
                Your complete service management solution.
              </p>
            </div>
          </div>
           {view === 'main' && (
             <Button onClick={handleNewServiceClick} className="w-full sm:w-auto">
               <PlusCircle className="mr-2 h-4 w-4" /> New Service
             </Button>
           )}
        </header>

        <div className="relative">
          {renderView()}
        </div>
      </main>
      <footer className="py-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>
            Powered by Firebase and Genkit.
          </p>
        </div>
      </footer>
    </div>
  );
}
