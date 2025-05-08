"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { addPersonAction } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Define form schema with Zod
const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
})

type FormValues = z.infer<typeof formSchema>

interface AddPersonFormProps {
  onSuccess: () => void
}

export function AddPersonForm({ onSuccess }: AddPersonFormProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  })

  const handleSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await addPersonAction(data.name)

      if (result.success) {
        form.reset()
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Person</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a New Person</DialogTitle>
          <DialogDescription>
            Enter the name of the person you want to add to the social graph.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right text-sm font-medium">
                Name
              </label>
              <div className="col-span-3">
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="Enter person name"
                  className="w-full"
                />
                {form.formState.errors.name && (
                  <p className="mt-1 text-sm text-red-500">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          {error && (
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
      </DialogContent>
    </Dialog>
  )
}
