"use server";

import { revalidatePath } from "next/cache";
import {
  addPerson as addPersonToDb,
  deletePerson as deletePersonFromDb,
  getPairsToCompare as getPairsToCompareFromDb,
  submitComparison as submitComparisonToDb,
} from "@/lib/actions";

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

export async function deletePersonAction(name: string) {
  try {
    // Delete person from database
    const result = await deletePersonFromDb(name);

    // Revalidate the homepage to show the updated list
    revalidatePath("/");

    return { success: true, deleted: result };
  } catch (error) {
    console.error("Error deleting person:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete person"
    };
  }
}

export async function getPairsToCompareAction() {
  try {
    // Get pairs to compare from database
    const result = await getPairsToCompareFromDb();

    return { success: true, data: result };
  } catch (error) {
    console.error("Error getting pairs to compare:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get pairs to compare"
    };
  }
}

export async function submitComparisonAction(
  pair1: [string, string],
  pair2: [string, string],
  pair1Won: boolean
) {
  try {
    // Submit comparison to database
    const result = await submitComparisonToDb(pair1, pair2, pair1Won);

    // Revalidate the comparison page
    revalidatePath("/compare");

    return { success: true, data: result };
  } catch (error) {
    console.error("Error submitting comparison:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to submit comparison"
    };
  }
}
