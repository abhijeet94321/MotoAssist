export type VehicleDetails = {
  userName: string;
  mobile: string;
  address: string;
  vehicleModel: {
    brand: string;
    engineType: string;
    model: string;
    cc: string;
  } | string; // Keep string for backward compatibility
  licensePlate: string;
};

export type ServiceItem = {
  id: string;
  description: string;
  partsCost: number;
  laborCost: number;
};

export type ServiceStatus = 
  | 'Service Required'
  | 'In Progress'
  | 'Completed'
  | 'Billed'
  | 'Cycle Complete';

export type PaymentStatus = 'Pending' | 'Paid - Cash' | 'Paid - Online';

export type ServiceJob = {
    id: string;
    userId: string; // Added to associate job with a user
    vehicleDetails: VehicleDetails;
    initialServiceRequest: string;
    status: ServiceStatus;
    serviceItems: ServiceItem[];
    payment: {
        status: PaymentStatus;
    };
    isRepeat: boolean;
    intakeDate: string; // ISO string
    mechanic: string;
};

export type Mechanic = {
    id: string;
    userId: string; // Added to associate mechanic with a user
    name: string;
};
