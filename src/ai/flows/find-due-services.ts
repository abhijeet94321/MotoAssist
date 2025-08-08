'use server';

/**
 * @fileOverview Finds service jobs that are due for a reminder.
 *
 * - findDueServices - A function that queries Firestore for due services.
 * - DueService - The type for a single due service job.
 * - FindDueServicesOutput - The return type for the findDueServices function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ServiceJob } from '@/lib/types';


const DueServiceSchema = z.object({
  jobId: z.string().describe('The ID of the service job.'),
  userName: z.string().describe('The name of the customer.'),
  mobile: z.string().describe('The mobile number of the customer.'),
  licensePlate: z.string().describe('The license plate of the vehicle.'),
  vehicleModel: z.string().describe('The model of the vehicle.'),
  nextServiceDate: z.string().describe('The scheduled date for the next service.'),
});
export type DueService = z.infer<typeof DueServiceSchema>;

const FindDueServicesOutputSchema = z.object({
  dueServices: z.array(DueServiceSchema).describe('An array of service jobs that are due.'),
});
export type FindDueServicesOutput = z.infer<typeof FindDueServicesOutputSchema>;


export async function findDueServices(): Promise<FindDueServicesOutput> {
  return findDueServicesFlow();
}

const findDueServicesFlow = ai.defineFlow(
  {
    name: 'findDueServicesFlow',
    inputSchema: z.void(),
    outputSchema: FindDueServicesOutputSchema,
  },
  async () => {
    const now = new Date();
    
    // Query for completed jobs that have a nextServiceDate set for today or in the past
    const q = query(
        collection(db, "serviceJobs"), 
        where("status", "==", "Cycle Complete"),
        where("nextServiceDate", "<=", now.toISOString())
    );

    const querySnapshot = await getDocs(q);
    const dueServices: DueService[] = [];

    querySnapshot.forEach((doc) => {
        const job = { id: doc.id, ...doc.data() } as ServiceJob;
        
        const vehicleModelString = typeof job.vehicleDetails.vehicleModel === 'string' 
            ? job.vehicleDetails.vehicleModel 
            : `${job.vehicleDetails.vehicleModel.brand} ${job.vehicleDetails.vehicleModel.model}`;

        if (job.nextServiceDate) {
            dueServices.push({
                jobId: job.id,
                userName: job.vehicleDetails.userName,
                mobile: job.vehicleDetails.mobile,
                licensePlate: job.vehicleDetails.licensePlate,
                vehicleModel: vehicleModelString,
                nextServiceDate: job.nextServiceDate,
            });
        }
    });

    return { dueServices };
  }
);
