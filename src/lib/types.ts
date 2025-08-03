export type VehicleDetails = {
  userName: string;
  mobile: string;
  address: string;
  vehicleModel: string;
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
    vehicleDetails: VehicleDetails;
    initialServiceRequest: string;
    status: ServiceStatus;
    serviceItems: ServiceItem[];
    payment: {
        status: PaymentStatus;
    };
};
