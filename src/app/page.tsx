import { initializeDatabase } from "../lib/db";
import { getAllPeople } from "../lib/actions";

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

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">People in Database</h2>
          {dbResult.success && (
            <div>
              {dbResult.data.length === 0 ? (
                <p className="text-gray-500">No people found in the database. Add some people to get started.</p>
              ) : (
                <ul className="divide-y">
                  {dbResult.data.map((person, index) => (
                    <li key={index} className="py-3 flex items-center">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-500 mr-3">
                        {person.name.charAt(0).toUpperCase()}
                      </span>
                      <span>{person.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
