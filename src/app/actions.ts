"use server";

import { revalidatePath } from "next/cache";
import {
  addPerson as addPersonToDb,
  deletePerson as deletePersonFromDb,
  getPairsToCompare as getPairsToCompareFromDb,
  submitComparison as submitComparisonToDb,
  getRelationshipsForPerson as getRelationshipsForPersonFromDb,
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

export async function getPairsToCompareAction(selectedUser?: string) {
  try {
    // Get pairs to compare from database, prioritizing pairs related to the selected user
    const result = await getPairsToCompareFromDb(selectedUser);

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

export async function getRelationshipsForPersonAction(name: string) {
  try {
    // Get interactions for a specific person from database
    const result = await getRelationshipsForPersonFromDb(name);

    return { success: true, data: result };
  } catch (error) {
    console.error("Error getting interactions for person:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get interactions for person"
    };
  }
}

export async function addPeopleAction(names: string[]) {
  try {
    const results = [];
    let hasErrors = false;
    let errorMessage = "";

    // Add each person to database
    for (const name of names) {
      try {
        const result = await addPersonToDb(name.trim());
        results.push(result);
      } catch (error) {
        hasErrors = true;
        errorMessage += `Error adding "${name}": ${error instanceof Error ? error.message : String(error)}. `;
      }
    }

    // Revalidate the homepage to show the updated list
    revalidatePath("/");

    if (hasErrors) {
      return { 
        success: true, 
        data: results,
        partialSuccess: true,
        error: errorMessage
      };
    }

    return { success: true, data: results };
  } catch (error) {
    console.error("Error in bulk adding people:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add people"
    };
  }
}
