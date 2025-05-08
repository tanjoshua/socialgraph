import neo4j, { Driver, Session } from 'neo4j-driver';

// Neo4j connection singleton
class Neo4jConnection {
  private static instance: Neo4jConnection;
  private driver: Driver | null = null;
  private readonly uri: string;
  private readonly username: string;
  private readonly password: string;

  private constructor() {
    // Get connection details from environment variables
    this.uri = process.env.NEO4J_URI || '';
    this.username = process.env.NEO4J_USERNAME || '';
    this.password = process.env.NEO4J_PASSWORD || '';

    // Validate environment variables
    if (!this.uri || !this.username || !this.password) {
      throw new Error('Neo4j connection details missing from environment variables');
    }
  }

  public static getInstance(): Neo4jConnection {
    if (!Neo4jConnection.instance) {
      Neo4jConnection.instance = new Neo4jConnection();
    }
    return Neo4jConnection.instance;
  }

  public getDriver(): Driver {
    if (!this.driver) {
      this.driver = neo4j.driver(
        this.uri,
        neo4j.auth.basic(this.username, this.password)
      );
    }
    return this.driver;
  }

  public getSession(): Session {
    return this.getDriver().session();
  }

  public close(): void {
    if (this.driver) {
      this.driver.close();
      this.driver = null;
    }
  }
}

// Helper functions for database operations
export async function executeCypherQuery<T = Record<string, unknown>>(
  cypher: string,
  params: Record<string, unknown> = {}
): Promise<T[]> {
  const dbConnection = Neo4jConnection.getInstance();
  const session = dbConnection.getSession();
  
  try {
    const result = await session.run(cypher, params);
    return result.records.map(record => {
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
    const dbConnection = Neo4jConnection.getInstance();
    // Verify driver is available but don't store the reference
    dbConnection.getDriver();
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
    const dbConnection = Neo4jConnection.getInstance();
    dbConnection.close();
    console.log('Neo4j database connection closed');
  } catch (error) {
    console.error('Error closing Neo4j connection:', error);
  }
}

export default Neo4jConnection.getInstance();
