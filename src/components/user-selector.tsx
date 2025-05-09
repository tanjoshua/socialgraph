"use client"

import { useEffect, useState } from "react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserIcon, XCircleIcon, UserRoundIcon } from "lucide-react"
import { Person } from "@/lib/actions"

const USER_STORAGE_KEY = "selectedUser"

interface UserSelectorProps {
  people: Person[]
}

export function UserSelector({ people }: UserSelectorProps) {
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  
  // Load selected user from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY)
    if (storedUser) {
      setSelectedUser(storedUser)
    }
  }, [])

  // Handle user selection
  const handleUserSelect = (value: string) => {
    setSelectedUser(value)
    localStorage.setItem(USER_STORAGE_KEY, value)
  }

  // Handle removing user selection
  const handleRemoveSelection = () => {
    setSelectedUser(null)
    localStorage.removeItem(USER_STORAGE_KEY)
  }

  return (
    <div className="mb-6">
      <Card >
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <UserRoundIcon className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              {selectedUser ? `Selected user is ${selectedUser}` : "User Selection"}
            </CardTitle>
          </div>
          <CardDescription>
            {selectedUser 
              ? "We will ask you for comparisons of people you know better"
              : "Select who you are for more suitable comparisons"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            {selectedUser && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRemoveSelection}
                className="flex items-center gap-1 h-9"
              >
                <XCircleIcon className="h-4 w-4" />
                <span>Clear</span>
              </Button>
            )}
            <Select onValueChange={handleUserSelect} value={selectedUser || undefined}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select a person" />
              </SelectTrigger>
              <SelectContent>
                {people.map((person) => (
                  <SelectItem key={person.name} value={person.name}>
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      <span>{person.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
