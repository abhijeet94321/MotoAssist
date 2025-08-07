"use client";

import type { ServiceJob } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cva } from "class-variance-authority";
import { UserCheck } from "lucide-react";

type ServiceJobsListProps = {
  jobs: ServiceJob[];
  onUpdateStatusClick: (job: ServiceJob) => void;
};

const statusBadgeVariants = cva("capitalize", {
  variants: {
    status: {
      "Service Required": "bg-red-100 text-red-800 border-red-200",
      "In Progress": "bg-amber-100 text-amber-800 border-amber-200",
      "Completed": "bg-emerald-100 text-emerald-800 border-emerald-200",
      "Billed": "bg-blue-100 text-blue-800 border-blue-200",
      "Cycle Complete": "bg-green-100 text-green-800 border-green-200",
    },
  },
});

export default function ServiceJobsList({
  jobs,
  onUpdateStatusClick,
}: ServiceJobsListProps) {
  const getVehicleModelString = (vehicleModel: ServiceJob['vehicleDetails']['vehicleModel']) => {
    if (typeof vehicleModel === 'string') {
        return vehicleModel;
    }
    return `${vehicleModel.brand} ${vehicleModel.model}`;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ongoing Services</CardTitle>
        <CardDescription>
          A list of all current and recently completed service jobs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Mobile View */}
        <div className="md:hidden space-y-4">
          {jobs.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">
              No service jobs yet. Click "New Service" to begin.
            </p>
          ) : (
            jobs.map((job) => (
              <Card key={job.id} className="w-full">
                <CardHeader>
                   <CardTitle>{getVehicleModelString(job.vehicleDetails.vehicleModel)}</CardTitle>
                   <CardDescription>{job.vehicleDetails.licensePlate}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                   <div>
                       <p className="font-medium">{job.vehicleDetails.userName}</p>
                       <p className="text-sm text-muted-foreground">{job.vehicleDetails.mobile}</p>
                   </div>
                   {job.status === 'In Progress' && job.mechanic && (
                       <div className="flex items-center gap-2 text-sm text-muted-foreground">
                         <UserCheck className="h-4 w-4" />
                         <span>Assigned to: {job.mechanic}</span>
                       </div>
                    )}
                   <div className="flex justify-between items-center">
                      <Badge variant="outline" className={statusBadgeVariants({ status: job.status })}>
                          {job.status}
                      </Badge>
                      <Badge variant={job.payment.status.startsWith('Paid') ? 'default' : 'secondary'}>
                          {job.payment.status}
                      </Badge>
                   </div>
                </CardContent>
                <CardFooter>
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateStatusClick(job)}
                      disabled={job.status === 'Cycle Complete'}
                      className="w-full"
                    >
                      Update
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
        
        {/* Desktop View */}
        <div className="hidden md:block border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center h-24 text-muted-foreground"
                  >
                    No service jobs yet. Click "New Service" to begin.
                  </TableCell>
                </TableRow>
              ) : (
                jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>
                        <div className="font-medium">{job.vehicleDetails.userName}</div>
                        <div className="text-sm text-muted-foreground">{job.vehicleDetails.mobile}</div>
                    </TableCell>
                    <TableCell>
                        <div className="font-medium">{getVehicleModelString(job.vehicleDetails.vehicleModel)}</div>
                        <div className="text-sm text-muted-foreground">{job.vehicleDetails.licensePlate}</div>
                    </TableCell>
                    <TableCell>
                        <Badge variant="outline" className={statusBadgeVariants({ status: job.status })}>
                            {job.status}
                        </Badge>
                    </TableCell>
                    <TableCell>
                      {job.status === 'In Progress' && job.mechanic ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <UserCheck className="h-4 w-4" />
                          <span>{job.mechanic}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateStatusClick(job)}
                        disabled={job.status === 'Cycle Complete'}
                      >
                        Update
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
