"use client"

import { useState, useEffect } from "react"
import { Relationship } from "@/lib/actions"
import { getRelationshipsForPersonAction } from "@/app/actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Loader2 } from "lucide-react"

interface PersonRelationshipsProps {
  personName: string | null
  onClose: () => void
}

export function PersonRelationships({ personName, onClose }: PersonRelationshipsProps) {
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRelationships() {
      if (!personName) return

      setLoading(true)
      setError(null)
      
      try {
        const result = await getRelationshipsForPersonAction(personName)
        if (result.success && result.data) {
          setRelationships(result.data)
        } else {
          setError(result.error || "Failed to load relationships")
        }
      } catch (err) {
        setError("An error occurred while fetching relationships")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchRelationships()
  }, [personName])

  if (!personName) return null

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl">Relationships for {personName}</CardTitle>
          <CardDescription>
            Showing closeness scores with other people
          </CardDescription>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          &times;
        </button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="text-center py-6 text-red-500">{error}</div>
        ) : relationships.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No relationships found for {personName}
          </div>
        ) : (
          <div className="space-y-4">
            {relationships.map((rel, index) => {
              // Determine the other person in the relationship
              const otherPerson = rel.person1 === personName ? rel.person2 : rel.person1
              
              return (
                <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center">
                    <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-500 mr-4">
                      {otherPerson.charAt(0).toUpperCase()}
                    </span>
                    <span className="font-medium">{otherPerson}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge variant="secondary" className="mb-1">
                      Score: {rel.closeness_score}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      Compared {rel.comparison_count} times
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
