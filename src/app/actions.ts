"use server";

import { revalidatePath } from "next/cache";
import { addPerson as addPersonToDb } from "@/lib/actions";

export async function addPersonAction(name: string) {
  try {
    // Add person to database
    const result = await addPersonToDb(name);
    
    // Revalidate the homepage to show the updated list
    revalidatePath("/");
    
    return { success: true, data: result };
  } catch (error) {
    console.error("Error adding person:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to add person" 
    };
  }
}
