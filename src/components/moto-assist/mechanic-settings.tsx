"use client";

import { useState } from "react";
import type { Mechanic } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Input } from "@/components/ui/input";
import { PlusCircle, Trash2 } from "lucide-react";

type MechanicSettingsProps = {
  mechanics: Mechanic[];
  onAddMechanic: (name: string) => void;
  onDeleteMechanic: (id: string) => void;
};

export default function MechanicSettings({
  mechanics,
  onAddMechanic,
  onDeleteMechanic,
}: MechanicSettingsProps) {
  const [newMechanicName, setNewMechanicName] = useState("");

  const handleAddClick = () => {
    if (newMechanicName.trim()) {
      onAddMechanic(newMechanicName.trim());
      setNewMechanicName("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mechanic Management</CardTitle>
        <CardDescription>
          Add, view, or remove mechanics from your service center.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="text"
            placeholder="Enter mechanic's name"
            value={newMechanicName}
            onChange={(e) => setNewMechanicName(e.target.value)}
          />
          <Button onClick={handleAddClick}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Mechanic
          </Button>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mechanic Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mechanics.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No mechanics added yet.
                  </TableCell>
                </TableRow>
              ) : (
                mechanics.map((mechanic) => (
                  <TableRow key={mechanic.id}>
                    <TableCell className="font-medium">{mechanic.name}</TableCell>
                    <TableCell className="text-right">
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button variant="destructive" size="sm">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete
                                      the mechanic "{mechanic.name}".
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => onDeleteMechanic(mechanic.id)} className="bg-destructive hover:bg-destructive/90">
                                    Delete
                                  </AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                       </AlertDialog>
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
