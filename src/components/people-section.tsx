"use client"

import { useState } from "react"
import { AddPersonForm } from "./add-person-form"
import { Person } from "@/lib/actions"
import { Button } from "./ui/button"
import { Trash2, Search } from "lucide-react"
import { deletePersonAction } from "@/app/actions"
import Link from "next/link"
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
import { Input } from "./ui/input"

interface PeopleSectionProps {
  people: Person[]
}

// Set this to false to hide add/delete controls, true to show them
const showControls = false;

export function PeopleSection({ people }: PeopleSectionProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [personToDelete, setPersonToDelete] = useState<string | null>(null)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

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



  // Filter people based on search query
  const filteredPeople = people.filter(person => 
    person.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">People in Database</h2>
        {showControls && (
          <AddPersonForm
            onSuccess={() => {
              // The revalidation is handled in the server action
              // This client callback can be used for UI feedback if needed
            }}
          />
        )}
      </div>
      
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder="Search people..."
          className="pl-10 w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="border rounded-md shadow-sm overflow-hidden">
        {people.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No people found in the database.</p>
            <p className="text-gray-500 mt-1">Add some people to get started.</p>
          </div>
        ) : filteredPeople.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No people match your search.</p>
          </div>
        ) : (
          <ul className="divide-y">
            {filteredPeople.map((person, index) => (
              <li key={index} className="relative">
                <Link 
                  href={`/person/${encodeURIComponent(person.name)}`}
                  className="block p-4 hover:bg-gray-50 transition-colors" 
                >
                  <div className="flex items-center">
                    <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-500 mr-4">
                      {person.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="font-medium">{person.name}</span>
                  </div>
                </Link>
                {/* Position the delete button absolutely to avoid it being part of the link */}
                {showControls && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.preventDefault(); // Prevent the link navigation
                        e.stopPropagation();
                        handleDeleteClick(person.name);
                      }}
                      disabled={isDeleting}
                      aria-label={`Delete ${person.name}`}
                    >
                      <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                    </Button>
                  </div>
                )}
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
              This will permanently delete <span className="font-medium">{personToDelete}</span> from the database and remove all their interaction records.
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
