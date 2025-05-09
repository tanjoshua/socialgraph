"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { getPairsToCompareAction, submitComparisonAction } from "@/app/actions"
import { ComparisonPair } from "@/lib/actions"
import { ArrowLeftRight, RefreshCw } from "lucide-react"

interface ComparisonSectionProps {
  selectedUser: string | null
}

export function ComparisonSection({ selectedUser }: ComparisonSectionProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pairs, setPairs] = useState<ComparisonPair | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Define loadPairs with useCallback to avoid dependency issues
  const loadPairs = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Pass the selected user to the action to prioritize relevant pairs
      const result = await getPairsToCompareAction(selectedUser || undefined)

      if (result.success && result.data) {
        setPairs(result.data)
      } else {
        setError(result.error || "Failed to load comparison pairs")
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [selectedUser])

  // Load pairs when selectedUser changes
  useEffect(() => {
    loadPairs()
  }, [loadPairs, selectedUser])

  const handleComparisonSubmit = async (pair1Won: boolean) => {
    if (!pairs) return

    setIsSubmitting(true)

    try {
      const result = await submitComparisonAction(
        pairs.pair1,
        pairs.pair2,
        pair1Won
      )

      if (result.success) {
        // Immediately start loading new pairs
        loadPairs()
      } else {
        setError(result.error || "Failed to submit comparison")
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || isSubmitting) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border rounded-md shadow-sm">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600">Loading comparison pairs...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 border rounded-md shadow-sm bg-red-50 text-red-800">
        <h2 className="text-xl font-semibold mb-2">Error</h2>
        <p>{error}</p>
        <Button
          className="mt-4"
          onClick={loadPairs}
          disabled={isLoading}
        >
          Try Again
        </Button>
      </div>
    )
  }

  if (!pairs) {
    return (
      <div className="p-6 border rounded-md shadow-sm bg-yellow-50 text-yellow-800">
        <h2 className="text-xl font-semibold mb-2">No Pairs Available</h2>
        <p>There are no interaction pairs available for comparison.</p>
        <Button
          className="mt-4"
          onClick={loadPairs}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Which Pair Has More Interactions?</h2>
        <p className="text-gray-600">
          Select the pair of people who you believe have more interactions with each other.
          Your choices help build a more accurate social graph.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Pair */}
        <Card className="border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Pair 1</CardTitle>
            <CardDescription>Select if these people has interacted more</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center space-x-4 py-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 text-xl font-semibold mb-2">
                  {pairs.pair1[0].charAt(0).toUpperCase()}
                </div>
                <p className="font-medium">{pairs.pair1[0]}</p>
              </div>
              <ArrowLeftRight className="h-6 w-6 text-gray-400" />
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 text-xl font-semibold mb-2">
                  {pairs.pair1[1].charAt(0).toUpperCase()}
                </div>
                <p className="font-medium">{pairs.pair1[1]}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => handleComparisonSubmit(true)}
            >
              This Pair Interacts More
            </Button>
          </CardFooter>
        </Card>

        {/* Second Pair */}
        <Card className="border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Pair 2</CardTitle>
            <CardDescription>Select if these people have interacted more</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center space-x-4 py-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 text-purple-600 text-xl font-semibold mb-2">
                  {pairs.pair2[0].charAt(0).toUpperCase()}
                </div>
                <p className="font-medium">{pairs.pair2[0]}</p>
              </div>
              <ArrowLeftRight className="h-6 w-6 text-gray-400" />
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 text-purple-600 text-xl font-semibold mb-2">
                  {pairs.pair2[1].charAt(0).toUpperCase()}
                </div>
                <p className="font-medium">{pairs.pair2[1]}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => handleComparisonSubmit(false)}
            >
              This Pair Interacts More
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-6 flex justify-center">
        <Button
          variant="outline"
          onClick={loadPairs}
          disabled={isLoading}
          className="flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Get Different Pairs
        </Button>
      </div>
    </div>
  )
}
