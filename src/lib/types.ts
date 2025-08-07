export type VehicleDetails = {
  userName: string;
  mobile: string;
  address: string;
  vehicleModel: {
    brand: string;
    emissionType: string;
    model: string;
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
    nextServiceDate?: string; // ISO string for the reminder
};

export type Mechanic = {
    id: string;
    userId: string; // Added to associate mechanic with a user
    name: string;
};

// Represents the structure of the vehicle data in Firestore
// e.g. { "Honda": { "BS6": ["Activa (110cc)", "Dio (125cc)"] } }
export type VehicleData = Record<string, Record<string, string[]>>;
