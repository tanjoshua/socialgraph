import { initializeDatabase } from "@/lib/db";
import { getAllPeople } from "@/lib/actions";
import { ComparePageClient } from "@/components/compare-page-client";
import Link from "next/link";

async function checkDatabaseAndPeople() {
  try {
    // Initialize database connection
    initializeDatabase();

    // Check if we have enough people for comparison
    const people = await getAllPeople();

    return {
      success: true,
      enoughPeople: people.length >= 4, // Need at least 4 people to have 2 different pairs
      peopleCount: people.length,
      people: people,
      error: null
    };
  } catch (error) {
    console.error("Database connection error:", error);
    return {
      success: false,
      enoughPeople: false,
      peopleCount: 0,
      people: [],
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export default async function ComparePage() {
  const dbResult = await checkDatabaseAndPeople();

  return dbResult.success ? (
    <ComparePageClient
      people={dbResult.people}
      enoughPeople={dbResult.enoughPeople}
      peopleCount={dbResult.peopleCount}
    />
  ) : (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Compare Interactions</h1>
        <div className="p-6 border rounded-md shadow-sm bg-red-50 text-red-800">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p>{dbResult.error || 'Failed to connect to database'}</p>
          <div className="mt-4">
            <Link href="/" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
              Return to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
