"use client"

import { useState } from "react"
import { AddPersonForm } from "./add-person-form"
import { Person } from "@/lib/actions"
import { Button } from "./ui/button"
import { Trash2 } from "lucide-react"
import { deletePersonAction } from "@/app/actions"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog"

interface PeopleSectionProps {
  people: Person[]
}

export function PeopleSection({ people }: PeopleSectionProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [personToDelete, setPersonToDelete] = useState<string | null>(null)
  const [isAlertOpen, setIsAlertOpen] = useState(false)

  const handleDeleteClick = (name: string) => {
    setPersonToDelete(name)
    setIsAlertOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!personToDelete) return

    setIsDeleting(true)
    try {
      await deletePersonAction(personToDelete)
      // Revalidation is handled in the server action
    } catch (error) {
      console.error("Error deleting person:", error)
    } finally {
      setIsDeleting(false)
      setPersonToDelete(null)
      setIsAlertOpen(false)
    }
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">People in Database</h2>
        <AddPersonForm
          onSuccess={() => {
            // The revalidation is handled in the server action
            // This client callback can be used for UI feedback if needed
          }}
        />
      </div>

      <div className="border rounded-md shadow-sm overflow-hidden">
        {people.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No people found in the database.</p>
            <p className="text-gray-500 mt-1">Add some people to get started.</p>
          </div>
        ) : (
          <ul className="divide-y">
            {people.map((person, index) => (
              <li key={index} className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-500 mr-4">
                    {person.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="font-medium">{person.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteClick(person.name)}
                  disabled={isDeleting}
                  aria-label={`Delete ${person.name}`}
                >
                  <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <span className="font-medium">{personToDelete}</span> from the database and remove all their relationships.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
