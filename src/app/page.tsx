import { initializeDatabase } from "../lib/db";
import { getAllPeople } from "../lib/actions";
import { PeopleSection } from "@/components/people-section";

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

        <div className="mb-8 p-4 border rounded-md shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Neo4j Database Connection</h2>
          <div className={`p-3 rounded-md ${dbResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {dbResult.success ? (
              <p>✅ Successfully connected to Neo4j database!</p>
            ) : (
              <div>
                <p>❌ Failed to connect to Neo4j database</p>
                {dbResult.error && (
                  <div className="mt-2">
                    <p className="font-semibold">Error:</p>
                    <pre className="mt-1 text-sm whitespace-pre-wrap overflow-auto">{dbResult.error}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {dbResult.success && <PeopleSection people={dbResult.data} />}
      </main>
    </div>
  );
}
