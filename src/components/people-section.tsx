"use client"

import { AddPersonForm } from "./add-person-form"
import { Person } from "@/lib/actions" // Assuming Person type is exported from actions

interface PeopleSectionProps {
  people: Person[]
}

export function PeopleSection({ people }: PeopleSectionProps) {
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
              <li key={index} className="p-4 flex items-center">
                <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-500 mr-4">
                  {person.name.charAt(0).toUpperCase()}
                </span>
                <span className="font-medium">{person.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
