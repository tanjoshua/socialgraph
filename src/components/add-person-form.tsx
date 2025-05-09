"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { addPersonAction, addPeopleAction } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

// Define form schemas with Zod
const singleFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
})

const bulkFormSchema = z.object({
  names: z.string().min(1, "At least one name is required"),
})

type SingleFormValues = z.infer<typeof singleFormSchema>
type BulkFormValues = z.infer<typeof bulkFormSchema>

interface AddPersonFormProps {
  onSuccess: () => void
}

export function AddPersonForm({ onSuccess }: AddPersonFormProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single")

  const singleForm = useForm<SingleFormValues>({
    resolver: zodResolver(singleFormSchema),
    defaultValues: {
      name: "",
    },
  })

  const bulkForm = useForm<BulkFormValues>({
    resolver: zodResolver(bulkFormSchema),
    defaultValues: {
      names: "",
    },
  })

  const handleSingleSubmit = async (data: SingleFormValues) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await addPersonAction(data.name)

      if (result.success) {
        singleForm.reset()
        setOpen(false)
        onSuccess()
      } else {
        setError(result.error || "Failed to add person")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add person")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBulkSubmit = async (data: BulkFormValues) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Split the text by newlines and filter out empty lines
      const nameList = data.names
        .split('\n')
        .map(name => name.trim())
        .filter(name => name.length > 0)

      if (nameList.length === 0) {
        setError("Please provide at least one valid name")
        setIsSubmitting(false)
        return
      }

      const result = await addPeopleAction(nameList)

      if (result.success) {
        bulkForm.reset()
        setOpen(false)
        onSuccess()
        
        // Show a partial success message if there were any errors
        if (result.partialSuccess && result.error) {
          console.warn("Some names could not be added:", result.error)
        }
      } else {
        setError(result.error || "Failed to add people")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add people")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value as "single" | "bulk")
    setError(null)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Person</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add People</DialogTitle>
          <DialogDescription>
            Add one or multiple people to the social graph.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Single Person</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
          </TabsList>
          
          <TabsContent value="single">
            <form onSubmit={singleForm.handleSubmit(handleSingleSubmit)}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="name" className="text-right text-sm font-medium">
                    Name
                  </label>
                  <div className="col-span-3">
                    <Input
                      id="name"
                      {...singleForm.register("name")}
                      placeholder="Enter person name"
                      className="w-full"
                    />
                    {singleForm.formState.errors.name && (
                      <p className="mt-1 text-sm text-red-500">
                        {singleForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {error && activeTab === "single" && (
                <div className="mb-4 p-3 text-sm bg-red-50 text-red-500 rounded-md">
                  {error}
                </div>
              )}
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Person"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="bulk">
            <form onSubmit={bulkForm.handleSubmit(handleBulkSubmit)}>
              <div className="grid gap-4 py-4">
                <div className="grid">
                  <label htmlFor="names" className="mb-2 text-sm font-medium">
                    Names (one per line)
                  </label>
                  <div>
                    <Textarea
                      id="names"
                      {...bulkForm.register("names")}
                      placeholder="John Smith&#10;Jane Doe&#10;Alex Johnson"
                      className="w-full h-32"
                    />
                    {bulkForm.formState.errors.names && (
                      <p className="mt-1 text-sm text-red-500">
                        {bulkForm.formState.errors.names.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {error && activeTab === "bulk" && (
                <div className="mb-4 p-3 text-sm bg-red-50 text-red-500 rounded-md">
                  {error}
                </div>
              )}
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add People"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
