import neo4j, { Driver, Session } from 'neo4j-driver';

// Module-level variables to store connection state
let driver: Driver | null = null;
let uri: string | null = null;
let username: string | null = null;
let password: string | null = null;

// Load environment variables
function loadConfig(): { uri: string; username: string; password: string } {
  const loadedUri = process.env.NEO4J_URI || '';
  const loadedUsername = process.env.NEO4J_USERNAME || '';
  const loadedPassword = process.env.NEO4J_PASSWORD || '';

  // Validate environment variables
  if (!loadedUri || !loadedUsername || !loadedPassword) {
    throw new Error('Neo4j connection details missing from environment variables');
  }

  return {
    uri: loadedUri,
    username: loadedUsername,
    password: loadedPassword
  };
}

// Get driver with lazy initialization
function getDriver(): Driver {
  if (!driver) {
    // Load config if not already loaded
    if (!uri || !username || !password) {
      const config = loadConfig();
      uri = config.uri;
      username = config.username;
      password = config.password;
    }

    driver = neo4j.driver(
      uri,
      neo4j.auth.basic(username, password)
    );
  }
  
  return driver;
}

// Get a new session
function getSession(): Session {
  return getDriver().session();
}

// Close the driver connection
function closeDriver(): void {
  if (driver) {
    driver.close();
    driver = null;
  }
}

// Export the functions for use in other modules
export { getDriver, getSession, closeDriver };

// Helper functions for database operations
export async function executeCypherQuery<T = Record<string, unknown>>(
  cypher: string,
  params: Record<string, unknown> = {}
): Promise<T[]> {
  const session = getSession();

  try {
    const result = await session.run(cypher, params);
    return result.records.map((record) => {
      return record.toObject() as T;
    });
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    session.close();
  }
}

// Initialize database connection
export function initializeDatabase(): void {
  try {
    // Just get the driver to verify connection is working
    getDriver();
    console.log('Neo4j database connection initialized');
    return;
  } catch (error) {
    console.error('Failed to initialize Neo4j connection:', error);
    throw error;
  }
}

// Close database connection
export function closeDatabase(): void {
  try {
    closeDriver();
    console.log('Neo4j database connection closed');
  } catch (error) {
    console.error('Error closing Neo4j connection:', error);
  }
}
