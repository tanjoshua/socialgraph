
import { initializeDatabase } from "../lib/db";
import { getAllPeople } from "../lib/actions";
import { PeopleSection } from "@/components/people-section";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

async function getPeople() {
  try {
    // Initialize database connection
    initializeDatabase();

    // Try to get all people from the database
    const people = await getAllPeople();
    return {
      success: true,
      data: people,
      error: null
    };
  } catch (error) {
    console.error("Database connection error:", error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export default async function Home() {
  const dbResult = await getPeople();

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Social Graph - Relationship Closeness System</h1>

        {/* Navigation */}
        <div className="mb-8">
          <Tabs defaultValue="home" className="w-full">
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



        {dbResult.success && <PeopleSection people={dbResult.data} />}
      </main>
    </div>
  );
}
