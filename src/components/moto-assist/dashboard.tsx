"use client";

import { useMemo } from 'react';
import type { ServiceJob } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { IndianRupee, Users, Wrench, Wallet } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type DashboardProps = {
  jobs: ServiceJob[];
};

const COLORS = ['#0088FE', '#00C49F'];

export default function Dashboard({ jobs }: DashboardProps) {

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    
    const todaysJobs = jobs.filter(j => new Date(j.intakeDate).toDateString() === today);
    const todaysRevenue = todaysJobs
      .filter(j => j.payment.status === 'Paid - Cash' || j.payment.status === 'Paid - Online')
      .reduce((acc, job) => acc + job.serviceItems.reduce((itemTotal, item) => itemTotal + item.partsCost + item.laborCost, 0), 0);

    const newCustomers = jobs.filter(j => !j.isRepeat).length;
    const repeatCustomers = jobs.filter(j => j.isRepeat).length;

    const pendingPayments = jobs.filter(j => j.payment.status === 'Pending' && j.status === 'Billed');

    return {
      todaysRevenue,
      vehiclesServicedToday: todaysJobs.length,
      customerData: [
        { name: 'New Customers', value: newCustomers },
        { name: 'Repeat Customers', value: repeatCustomers },
      ],
      pendingPayments,
    };
  }, [jobs]);

  const getVehicleModelString = (vehicleModel: ServiceJob['vehicleDetails']['vehicleModel']) => {
    if (typeof vehicleModel === 'string') {
        return vehicleModel;
    }
    return `${vehicleModel.brand} ${vehicleModel.model}`;
  }

  return (
    <div className="grid gap-6">
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.todaysRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total revenue from services paid today
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vehicles Serviced Today</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.vehiclesServicedToday}</div>
            <p className="text-xs text-muted-foreground">
              Vehicles with intake date of today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPayments.length}</div>
            <p className="text-xs text-muted-foreground">
              Customers with outstanding bills
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customerData[0].value + stats.customerData[1].value}</div>
            <p className="text-xs text-muted-foreground">
              New and repeat customers
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Pending Payments</CardTitle>
            <CardDescription>A list of customers with unpaid bills.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="overflow-x-auto">
                 <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.pendingPayments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center h-24">No pending payments.</TableCell>
                        </TableRow>
                      ) : (
                        stats.pendingPayments.map(job => (
                           <TableRow key={job.id}>
                             <TableCell>
                               <div className="font-medium">{job.vehicleDetails.userName}</div>
                               <div className="text-sm text-muted-foreground">{job.vehicleDetails.mobile}</div>
                             </TableCell>
                             <TableCell>
                               <div className="font-medium">{getVehicleModelString(job.vehicleDetails.vehicleModel)}</div>
                               <div className="text-sm text-muted-foreground">{job.vehicleDetails.licensePlate}</div>
                             </TableCell>
                             <TableCell className="text-right font-medium">
                               ₹{job.serviceItems.reduce((acc, item) => acc + item.partsCost + item.laborCost, 0).toFixed(2)}
                             </TableCell>
                           </TableRow>
                        ))
                      )}
                    </TableBody>
                 </Table>
             </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>Customer Overview</CardTitle>
                <CardDescription>A breakdown of new vs. returning customers.</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px] min-w-0">
               <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={stats.customerData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {stats.customerData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
               </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
