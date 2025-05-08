import { initializeDatabase } from "@/lib/db";
import { getAllPeople } from "@/lib/actions";
import { ComparisonSection } from "@/components/comparison-section";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      error: null
    };
  } catch (error) {
    console.error("Database connection error:", error);
    return {
      success: false,
      enoughPeople: false,
      peopleCount: 0,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export default async function ComparePage() {
  const dbResult = await checkDatabaseAndPeople();

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Compare Relationships</h1>

        {/* Navigation */}
        <div className="mb-8">
          <Tabs defaultValue="compare" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="home" asChild>
                <Link href="/">Home</Link>
              </TabsTrigger>
              <TabsTrigger value="compare" asChild>
                <Link href="/compare">Compare Relationships</Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>



        {dbResult.success && !dbResult.enoughPeople && (
          <div className="mb-8 p-6 border rounded-md shadow-sm bg-yellow-50 text-yellow-800">
            <h2 className="text-xl font-semibold mb-2">Not Enough People</h2>
            <p>You need at least 4 people in the database to make meaningful comparisons.</p>
            <p className="mt-2">Current count: {dbResult.peopleCount} people</p>
            <div className="mt-4">
              <Button asChild>
                <Link href="/">
                  Go to Home to Add People
                </Link>
              </Button>
            </div>
          </div>
        )}

        {dbResult.success && dbResult.enoughPeople && (
          <ComparisonSection />
        )}
      </main>
    </div>
  );
}
