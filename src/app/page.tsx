
"use client";

import { useMemo, useState, useEffect } from 'react';
import type { ServiceJob, Mechanic } from '@/lib/types';
import Dashboard from '@/components/moto-assist/dashboard';
import ServiceJobsList from '@/components/moto-assist/service-jobs-list';
import { Button } from '@/components/ui/button';
import { PlusCircle, Cog, LayoutDashboard, List, IndianRupee, History, Settings, LogOut } from 'lucide-react';
import ServiceIntakeForm from '@/components/moto-assist/service-intake-form';
import ServiceStatusUpdater from '@/components/moto-assist/service-status-updater';
import BillPreview from '@/components/moto-assist/bill-preview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import PaymentsList from '@/components/moto-assist/payments-list';
import HistoryList from '@/components/moto-assist/history-list';
import JobDetailsView from '@/components/moto-assist/job-details-view';
import MechanicSettings from '@/components/moto-assist/mechanic-settings';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, query, where, orderBy, Query } from 'firebase/firestore';
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
import { useAuth } from '@/components/auth-provider';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


type View = 'main' | 'new_service' | 'update_status' | 'billing' | 'view_details';

const ADMIN_UID = "YOUR_ADMIN_UID_HERE"; // IMPORTANT: Replace with your actual Admin User ID

export default function Home() {
  const [view, setView] = useState<View>('main');
  const [serviceJobs, setServiceJobs] = useState<ServiceJob[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [activeJob, setActiveJob] = useState<ServiceJob | null>(null);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading, signOut } = useAuth();
  
  const isAdmin = useMemo(() => user?.uid === ADMIN_UID, [user]);


  useEffect(() => {
    if (!user) return; // Wait for the user to be authenticated

    setLoading(true);
    
    const isUserAdmin = user.uid === ADMIN_UID;

    // Define base queries
    let jobsQuery: Query = collection(db, "serviceJobs");
    let mechanicsQuery: Query = collection(db, "mechanics");

    // Adjust queries based on user role
    if (isUserAdmin) {
        // Admin sees all jobs and mechanics, ordered as before
        jobsQuery = query(jobsQuery, orderBy("intakeDate", "desc"));
        mechanicsQuery = query(mechanicsQuery, orderBy("name"));
    } else {
        // Regular user only sees their own data
        jobsQuery = query(jobsQuery, where("userId", "==", user.uid), orderBy("intakeDate", "desc"));
        mechanicsQuery = query(mechanicsQuery, where("userId", "==", user.uid), orderBy("name"));
    }


    const unsubscribeJobs = onSnapshot(jobsQuery, (querySnapshot) => {
      const jobs: ServiceJob[] = [];
      querySnapshot.forEach((doc) => {
        jobs.push({ id: doc.id, ...doc.data() } as ServiceJob);
      });
      setServiceJobs(jobs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching service jobs: ", error);
      toast({
        title: "Error fetching data",
        description: "Could not connect to the jobs database. Check Firestore rules and indexes.",
        variant: "destructive",
      });
      setLoading(false);
    });

    const unsubscribeMechanics = onSnapshot(mechanicsQuery, (querySnapshot) => {
      const mechanicList: Mechanic[] = [];
      querySnapshot.forEach((doc) => {
        mechanicList.push({ id: doc.id, ...doc.data() } as Mechanic);
      });
      setMechanics(mechanicList);
    }, (error) => {
       console.error("Error fetching mechanics: ", error);
       toast({
        title: "Error fetching mechanics",
        description: "Could not connect to the mechanics database. Check Firestore rules and indexes.",
        variant: "destructive",
      });
    });


    return () => {
      unsubscribeJobs();
      unsubscribeMechanics();
    };
  }, [toast, user]);


  const handleNewServiceClick = () => {
    setActiveJob(null);
    setView('new_service');
  };
  
  const handleIntakeSubmit = async (data: Omit<ServiceJob, 'id' | 'status' | 'serviceItems' | 'payment' | 'isRepeat' | 'intakeDate' | 'mechanic' | 'userId'>) => {
    if (!user) {
        toast({ title: "Not Authenticated", description: "You must be logged in to create a job.", variant: "destructive"});
        return;
    }

    const isRepeatCustomer = serviceJobs.some(
      (job) => job.vehicleDetails.mobile === data.vehicleDetails.mobile
    );

    const newJobData = {
      ...data,
      userId: user.uid,
      status: 'Service Required',
      serviceItems: [],
      payment: { status: 'Pending' },
      isRepeat: isRepeatCustomer,
      intakeDate: new Date().toISOString(),
      mechanic: '',
    };
    
    try {
      const docRef = await addDoc(collection(db, 'serviceJobs'), newJobData);
      
      const newJob: ServiceJob = { ...newJobData, id: docRef.id };

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

    } catch (error) {
       console.error("Error adding document: ", error);
       toast({
        title: "Error Creating Job",
        description: "Could not save the new service job. Please try again.",
        variant: "destructive",
       });
    }
  };

  const handleUpdateStatusClick = (job: ServiceJob) => {
    setActiveJob(job);
    setView('update_status');
  };

  const handleStatusUpdate = async (jobId: string, status: ServiceJob['status'], items?: ServiceJob['serviceItems'], mechanic?: string) => {
    const jobRef = doc(db, 'serviceJobs', jobId);
    const updateData: Partial<ServiceJob> = { status };
    if (items) {
      updateData.serviceItems = items;
    }
    if (mechanic !== undefined) {
      updateData.mechanic = mechanic;
    }
    
    try {
      await updateDoc(jobRef, updateData);
      if (status === 'Billed') {
        // Find the full job object to pass to the billing view
        const updatedJob = serviceJobs.find(j => j.id === jobId);
        if (updatedJob) {
           setActiveJob({ ...updatedJob, ...updateData });
           setView('billing');
        }
      } else {
        setView('main');
      }
      toast({
        title: "Status Updated",
        description: `Job status has been updated to ${status}.`,
      });
    } catch (error) {
       console.error("Error updating document: ", error);
       toast({
        title: "Error Updating Status",
        description: "Could not update the job status. Please try again.",
        variant: "destructive",
       });
    }
  };

  const handlePaymentUpdate = async (jobId: string, paymentStatus: ServiceJob['payment']['status']) => {
     const jobRef = doc(db, 'serviceJobs', jobId);
     
     try {
        const job = serviceJobs.find(j => j.id === jobId);
        if (!job) throw new Error("Job not found");

        const payment = { ...job.payment, status: paymentStatus };
        const newStatus = (paymentStatus === 'Paid - Cash' || paymentStatus === 'Paid - Online') ? 'Cycle Complete' : 'Completed';
        
        await updateDoc(jobRef, { payment, status: newStatus });

        toast({
          title: "Payment Updated",
          description: `Payment status has been updated.`,
        });
        setView('main');
     } catch (error) {
        console.error("Error updating payment: ", error);
        toast({
          title: "Error Updating Payment",
          description: "Could not update the payment status. Please try again.",
          variant: "destructive",
        });
     }
  };
  
  const handleViewDetails = (job: ServiceJob) => {
    setActiveJob(job);
    setView('view_details');
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      await deleteDoc(doc(db, 'serviceJobs', jobId));
      toast({
          title: "Job Deleted",
          description: "The service record has been permanently removed.",
      });
    } catch (error) {
       console.error("Error deleting document: ", error);
       toast({
          title: "Error Deleting Job",
          description: "Could not delete the job. Please try again.",
          variant: "destructive",
       });
    }
  };

  const handleBackToMain = () => {
    setView('main');
    setActiveJob(null);
  };

  const handleAddMechanic = async (name: string) => {
    if (!name || !user) return;
    try {
        await addDoc(collection(db, 'mechanics'), { name, userId: user.uid });
        toast({
            title: "Mechanic Added",
            description: `${name} has been added to the list.`,
        });
    } catch (error) {
        console.error("Error adding mechanic: ", error);
        toast({
            title: "Error Adding Mechanic",
            description: "Could not add the new mechanic. Please try again.",
            variant: "destructive",
        });
    }
  };

  const handleDeleteMechanic = async (mechanicId: string) => {
    try {
        await deleteDoc(doc(db, 'mechanics', mechanicId));
        toast({
            title: "Mechanic Deleted",
            description: "The mechanic has been removed from the list.",
        });
    } catch (error) {
        console.error("Error deleting mechanic: ", error);
        toast({
            title: "Error Deleting Mechanic",
            description: "Could not delete the mechanic. Please try again.",
            variant: "destructive",
        });
    }
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
    if (loading) {
      return <div className="text-center py-10">Loading service data...</div>;
    }
    
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
              mechanics={mechanics}
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
              <TabsTrigger value="settings"><Settings className="mr-0 sm:mr-2 h-4 w-4" /><span className="hidden sm:inline">Settings</span></TabsTrigger>
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
            <TabsContent value="settings">
               <MechanicSettings
                  mechanics={mechanics}
                  onAddMechanic={handleAddMechanic}
                  onDeleteMechanic={handleDeleteMechanic}
                />
            </TabsContent>
          </Tabs>
        );
    }
  };

  if (authLoading) {
    return <div className="text-center py-10">Authenticating...</div>;
  }
  
  if (!user && !authLoading) {
    return <div className="text-center py-10">Please log in to continue.</div>;
  }

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
                {isAdmin ? 'Admin Dashboard' : 'Your complete service management solution.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             {user && (
                 <div className="flex items-center gap-3">
                     <Avatar className="h-9 w-9">
                         <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                     </Avatar>
                     <div className="text-sm text-right">
                         <p className="font-medium text-foreground">{user.email}</p>
                         <Button variant="link" className="p-0 h-auto text-xs" onClick={signOut}>
                            Sign Out <LogOut className="ml-2 h-3 w-3" />
                         </Button>
                     </div>
                 </div>
             )}
            {view === 'main' && (
              <Button onClick={handleNewServiceClick} className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" /> New Service
              </Button>
            )}
           </div>
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

    