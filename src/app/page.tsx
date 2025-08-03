"use client";

import { useState } from 'react';
import type { ServiceJob } from '@/lib/types';
import ServiceDashboard from '@/components/moto-assist/service-dashboard';
import { Button } from '@/components/ui/button';
import { PlusCircle, Wrench } from 'lucide-react';
import ServiceIntakeForm from '@/components/moto-assist/service-intake-form';
import ServiceStatusUpdater from '@/components/moto-assist/service-status-updater';
import BillPreview from '@/components/moto-assist/bill-preview';

type View = 'dashboard' | 'new_service' | 'update_status' | 'billing';

export default function Home() {
  const [view, setView] = useState<View>('dashboard');
  const [serviceJobs, setServiceJobs] = useState<ServiceJob[]>([]);
  const [activeJob, setActiveJob] = useState<ServiceJob | null>(null);

  const handleNewServiceClick = () => {
    setActiveJob(null);
    setView('new_service');
  };
  
  const handleIntakeSubmit = (data: Omit<ServiceJob, 'id' | 'status' | 'serviceItems' | 'payment'>) => {
    const newJob: ServiceJob = {
      id: crypto.randomUUID(),
      ...data,
      status: 'Service Required',
      serviceItems: [],
      payment: { status: 'Pending' },
    };
    setServiceJobs(prev => [...prev, newJob]);
    setView('dashboard');
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
          setView('dashboard');
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
     setView('dashboard');
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
    setActiveJob(null);
  };

  const renderView = () => {
    switch (view) {
      case 'new_service':
        return (
          <ServiceIntakeForm
            onSubmit={handleIntakeSubmit}
            onBack={handleBackToDashboard}
          />
        );
      case 'update_status':
        if (activeJob) {
          return (
            <ServiceStatusUpdater
              job={activeJob}
              onUpdate={handleStatusUpdate}
              onBack={handleBackToDashboard}
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
            />
          );
        }
        return null;
      case 'dashboard':
      default:
        return (
          <ServiceDashboard
            jobs={serviceJobs}
            onUpdateStatusClick={handleUpdateStatusClick}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto p-4 sm:p-6 md:p-8">
        <header className="mb-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <Wrench className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                MotoAssist
              </h1>
              <p className="text-muted-foreground">
                Your complete service management solution.
              </p>
            </div>
          </div>
           {view === 'dashboard' && (
             <Button onClick={handleNewServiceClick}>
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
