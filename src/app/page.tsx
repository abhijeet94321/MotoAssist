"use client";

import { useState } from 'react';
import type { VehicleDetails, ServiceItem } from '@/lib/types';
import VehicleRegistrationForm from '@/components/moto-assist/vehicle-registration-form';
import ServiceLogger from '@/components/moto-assist/service-logger';
import BillPreview from '@/components/moto-assist/bill-preview';
import { Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Step = 'registration' | 'service' | 'bill';

export default function Home() {
  const [step, setStep] = useState<Step>('registration');
  const [vehicleDetails, setVehicleDetails] = useState<VehicleDetails | null>(
    null
  );
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);

  const handleRegistrationSubmit = (data: VehicleDetails) => {
    setVehicleDetails(data);
    setStep('service');
  };

  const handleServiceSubmit = (items: ServiceItem[]) => {
    setServiceItems(items);
    setStep('bill');
  };

  const handleBackToRegistration = () => {
    setStep('registration');
    setServiceItems([]);
  };
  
  const handleBackToService = () => {
    setStep('service');
  };
  
  const handleStartNew = () => {
    setStep('registration');
    setVehicleDetails(null);
    setServiceItems([]);
  };

  const renderStep = () => {
    switch (step) {
      case 'registration':
        return (
          <VehicleRegistrationForm
            key="registration"
            onSubmit={handleRegistrationSubmit}
            initialData={vehicleDetails}
          />
        );
      case 'service':
        if (vehicleDetails) {
          return (
            <ServiceLogger
              key="service"
              vehicleDetails={vehicleDetails}
              onBack={handleBackToRegistration}
              onSubmit={handleServiceSubmit}
              initialServices={serviceItems}
            />
          );
        }
        return null;
      case 'bill':
        if (vehicleDetails) {
          return (
            <BillPreview
              key="bill"
              vehicleDetails={vehicleDetails}
              serviceItems={serviceItems}
              onBack={handleBackToService}
              onNew={handleStartNew}
            />
          );
        }
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto p-4 sm:p-6 md:p-8">
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <Wrench className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                MotoAssist
              </h1>
              <p className="text-muted-foreground">
                Two-wheeler service management made easy.
              </p>
            </div>
          </div>
        </header>

        <div className="relative">
          {renderStep()}
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
