"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { getPairsToCompareAction, submitComparisonAction } from "@/app/actions"
import { ComparisonPair } from "@/lib/actions"
import { ArrowLeftRight, RefreshCw, Check } from "lucide-react"

export function ComparisonSection() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pairs, setPairs] = useState<ComparisonPair | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionSuccess, setSubmissionSuccess] = useState(false)

  // Load pairs on component mount
  useEffect(() => {
    loadPairs()
  }, [])

  const loadPairs = async () => {
    setIsLoading(true)
    setError(null)
    setSubmissionSuccess(false)
    
    try {
      const result = await getPairsToCompareAction()
      
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
  }

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
        setSubmissionSuccess(true)
        // Wait 1.5 seconds before loading new pairs
        setTimeout(() => {
          loadPairs()
        }, 1500)
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

  if (isLoading) {
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
        <p>There are no relationship pairs available for comparison.</p>
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
        <h2 className="text-xl font-semibold mb-2">Which Relationship is Closer?</h2>
        <p className="text-gray-600">
          Select the pair of people who you believe have a closer relationship.
          Your choices help build a more accurate social graph.
        </p>
      </div>

      {submissionSuccess && (
        <div className="mb-6 p-4 border rounded-md shadow-sm bg-green-50 text-green-800 flex items-center">
          <Check className="h-5 w-5 mr-2" />
          <p>Comparison recorded successfully! Loading next comparison...</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Pair */}
        <Card className="border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Pair 1</CardTitle>
            <CardDescription>Select if these people are closer</CardDescription>
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
              disabled={isSubmitting}
            >
              This Pair is Closer
            </Button>
          </CardFooter>
        </Card>

        {/* Second Pair */}
        <Card className="border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Pair 2</CardTitle>
            <CardDescription>Select if these people are closer</CardDescription>
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
              disabled={isSubmitting}
            >
              This Pair is Closer
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-6 flex justify-center">
        <Button 
          variant="outline"
          onClick={loadPairs}
          disabled={isLoading || isSubmitting}
          className="flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Get Different Pairs
        </Button>
      </div>
    </div>
  )
}
