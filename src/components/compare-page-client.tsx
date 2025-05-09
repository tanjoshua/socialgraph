"use client"

import { useState } from "react"
import { ComparisonSection } from "./comparison-section"
import { UserSelector } from "./user-selector"
import { Person } from "@/lib/actions"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ComparePageClientProps {
  people: Person[]
  enoughPeople: boolean
  peopleCount: number
}

export function ComparePageClient({ people, enoughPeople, peopleCount }: ComparePageClientProps) {
  const [selectedUser, setSelectedUser] = useState<string>("")

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Compare Interactions</h1>

        {/* Navigation */}
        <div className="mb-8">
          <Tabs defaultValue="compare" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="home" asChild>
                <Link href="/">Home</Link>
              </TabsTrigger>
              <TabsTrigger value="compare" asChild>
                <Link href="/compare">Compare Interactions</Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* User Selector with shared state */}
        <UserSelector
          people={people}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
        />

        {!enoughPeople && (
          <div className="mb-8 p-6 border rounded-md shadow-sm bg-yellow-50 text-yellow-800">
            <h2 className="text-xl font-semibold mb-2">Not Enough People</h2>
            <p>You need at least 4 people in the database to make meaningful comparisons.</p>
            <p className="mt-2">Current count: {peopleCount} people</p>
            <div className="mt-4">
              <Button asChild>
                <Link href="/">
                  Go to Home to Add People
                </Link>
              </Button>
            </div>
          </div>
        )}

        {enoughPeople && (
          <ComparisonSection selectedUser={selectedUser} />
        )}
      </main>
    </div>
  )
}
