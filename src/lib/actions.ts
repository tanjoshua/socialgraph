import { executeCypherQuery } from './db';
import { serializeNeo4jObject } from './utils';

export interface Person {
  name: string;
}

export interface Relationship {
  person1: string;
  person2: string;
  closeness_score: number;
  comparison_count: number;
}

export interface ComparisonPair {
  pair1: [string, string];
  pair2: [string, string];
}

interface CommunityGroup {
  person: string;
  group: number;
}

// Delete a person from the graph
export async function deletePerson(name: string): Promise<boolean> {
  const cypher = `
    MATCH (p:Person {name: $name})
    DETACH DELETE p
    RETURN count(p) as deleted
  `;

  const result = await executeCypherQuery<{ deleted: number }>(cypher, { name });
  return result[0]?.deleted > 0;
}

// Add a new person to the graph
export async function addPerson(name: string): Promise<Person> {
  const cypher = `
    CREATE (p:Person {name: $name})
    RETURN p.name as name
  `;

  const result = await executeCypherQuery<{ name: string }>(cypher, { name });
  return { name: result[0]?.name as string };
}

// Create or update interaction record between two people
export async function createOrUpdateRelationship(name1: string, name2: string): Promise<Relationship> {
  const cypher = `
    MATCH (a:Person {name: $name1}), (b:Person {name: $name2})
    MERGE (a)-[r:KNOWS]-(b)
    ON CREATE SET r.closeness_score = 1200, r.comparison_count = 0
    RETURN a.name as person1, b.name as person2, r.closeness_score as closeness_score, r.comparison_count as comparison_count
  `;

  const result = await executeCypherQuery<Relationship>(cypher, { name1, name2 });
  // Return serialized data safe for client components
  return serializeNeo4jObject<Relationship>(result[0]);
}

// Update an interaction score after comparison
export async function updateRelationshipScore(
  name1: string,
  name2: string,
  newScore: number
): Promise<Relationship> {
  const cypher = `
    MATCH (a:Person {name: $name1})-[r:KNOWS]-(b:Person {name: $name2})
    SET r.closeness_score = $newScore,
        r.comparison_count = r.comparison_count + 1
    RETURN a.name as person1, b.name as person2, r.closeness_score as closeness_score, r.comparison_count as comparison_count
  `;

  const result = await executeCypherQuery<Relationship>(cypher, { name1, name2, newScore });
  // Return serialized data safe for client components
  return serializeNeo4jObject<Relationship>(result[0]);
}

// Get all people for selection
export async function getAllPeople(): Promise<Person[]> {
  const cypher = `
    MATCH (p:Person)
    RETURN p.name AS name
    ORDER BY p.name
  `;

  const result = await executeCypherQuery<{ name: string }>(cypher);
  return result.map(record => ({ name: record.name }));
}

// Get two pairs of people for comparison, prioritizing the selected user if specified
export async function getPairsToCompare(selectedUser?: string): Promise<ComparisonPair> {
  // If no selectedUser is provided, get all possible relationship pairs
  if (!selectedUser) {
    const cypher = `
      MATCH (a:Person), (b:Person)
      WHERE id(a) < id(b)
      RETURN a.name as person1, b.name as person2
    `;

    const relationships = await executeCypherQuery<{ person1: string, person2: string }>(cypher);

    if (relationships.length < 2) {
      throw new Error('Not enough people to create two comparison pairs');
    }

    // Randomly select two different pairs
    const shuffled = [...relationships].sort(() => 0.5 - Math.random());
    const pair1 = [shuffled[0].person1, shuffled[0].person2] as [string, string];
    const pair2 = [shuffled[1].person1, shuffled[1].person2] as [string, string];

    // Return serialized data safe for client components
    return serializeNeo4jObject<ComparisonPair>({
      pair1,
      pair2
    });
  }

  // If selectedUser is provided, we'll get potential pairings with all other users
  // First, get all potential pairs involving the selected user (regardless of existing relationships)
  const directCypher = `
    MATCH (selected:Person {name: $selectedUser}), (other:Person)
    WHERE selected <> other
    RETURN selected.name as person1, other.name as person2
  `;

  const directRelationships = await executeCypherQuery<{ person1: string, person2: string }>(directCypher, { selectedUser });

  // Get the top closest people to the selected user with scores above 1200
  const closestPeopleCypher = `
    MATCH (selected:Person {name: $selectedUser})-[r:KNOWS]-(connectedPerson:Person)
    WHERE r.closeness_score IS NOT NULL AND r.closeness_score > 1240
    WITH selected, connectedPerson, r.closeness_score as closeness
    ORDER BY closeness DESC
    LIMIT 5
    RETURN connectedPerson.name as name
  `;

  const closestPeople = await executeCypherQuery<{ name: string }>(closestPeopleCypher, { selectedUser });

  // Generate all possible pair combinations in JavaScript
  const indirectRelationships: { person1: string, person2: string }[] = [];

  // Create all possible pairs (combinations) from the closest people
  for (let i = 0; i < closestPeople.length; i++) {
    for (let j = i + 1; j < closestPeople.length; j++) {
      indirectRelationships.push({
        person1: closestPeople[i].name,
        person2: closestPeople[j].name
      });
    }
  }

  // Combine relationships, prioritizing direct relationships
  const allRelationships: { person1: string, person2: string }[] = [...directRelationships, ...indirectRelationships];

  // Randomly select two different pairs
  const shuffled = [...allRelationships].sort(() => 0.5 - Math.random());
  const pair1 = [shuffled[0].person1, shuffled[0].person2] as [string, string];

  // Make sure pair2 is different from pair1 (regardless of order)
  let pairIndex = 1;
  while (pairIndex < shuffled.length) {
    const potentialPair = [shuffled[pairIndex].person1, shuffled[pairIndex].person2];

    // Check if the potential pair contains different people than pair1
    // Two pairs are different if they don't have the same two people (regardless of order)
    const isDifferentPair = !(
      (potentialPair[0] === pair1[0] && potentialPair[1] === pair1[1]) || // Same order
      (potentialPair[0] === pair1[1] && potentialPair[1] === pair1[0])    // Reversed order
    );

    if (isDifferentPair) {
      break;
    }
    pairIndex++;
  }

  // If we couldn't find a different pair, or we only have one relationship
  if (pairIndex >= shuffled.length || shuffled.length < 2) {
    // If we have only one relationship, create a fallback pair
    // (in a real app, you might want to fetch more people or handle this differently)
    return serializeNeo4jObject<ComparisonPair>({
      pair1,
      pair2: pair1 // Use the same pair as a fallback
    });
  }

  const pair2 = [shuffled[pairIndex].person1, shuffled[pairIndex].person2] as [string, string];

  // Return serialized data safe for client components
  return serializeNeo4jObject<ComparisonPair>({
    pair1,
    pair2
  });
}

// Get all interactions for visualization, sorted by interaction score
export async function getAllRelationships(): Promise<Relationship[]> {
  const cypher = `
    MATCH (a:Person)-[r:KNOWS]-(b:Person)
    WHERE id(a) < id(b)  // avoid duplicates
    RETURN a.name as person1, b.name as person2, r.closeness_score as closeness_score, r.comparison_count as comparison_count
    ORDER BY r.closeness_score DESC
  `;

  const result = await executeCypherQuery<Relationship>(cypher);
  // Return serialized data safe for client components
  return serializeNeo4jObject<Relationship[]>(result);
}

// Get all interactions for a specific person, sorted by interaction score
export async function getRelationshipsForPerson(name: string): Promise<Relationship[]> {
  const cypher = `
    MATCH (a:Person {name: $name})-[r:KNOWS]-(b:Person)
    RETURN a.name as person1, b.name as person2, r.closeness_score as closeness_score, r.comparison_count as comparison_count
    ORDER BY r.closeness_score DESC
  `;

  const result = await executeCypherQuery<Relationship>(cypher, { name });
  // Return serialized data safe for client components
  return serializeNeo4jObject<Relationship[]>(result);
}

// Calculate new scores based on Elo rating formula
export function calculateNewScores(
  pair1Score: number,
  pair2Score: number,
  pair1Won: boolean
): { newPair1Score: number; newPair2Score: number } {
  const K = 32; // K-factor determines how quickly scores change

  // Calculate expected probability of winning
  const expectedPair1 = 1 / (1 + Math.pow(10, (pair2Score - pair1Score) / 400));
  const expectedPair2 = 1 / (1 + Math.pow(10, (pair1Score - pair2Score) / 400));

  // Calculate new scores
  const actualPair1 = pair1Won ? 1 : 0;
  const actualPair2 = pair1Won ? 0 : 1;

  const newPair1Score = Math.round(pair1Score + K * (actualPair1 - expectedPair1));
  const newPair2Score = Math.round(pair2Score + K * (actualPair2 - expectedPair2));

  return {
    newPair1Score,
    newPair2Score
  };
}

// Run community detection to find groups
export async function detectCommunities(): Promise<CommunityGroup[]> {
  // First, ensure the graph exists
  const createGraphCypher = `
    CALL gds.graph.exists('socialGraph') YIELD exists
    RETURN exists
  `;

  const graphExists = await executeCypherQuery<{ exists: boolean }>(createGraphCypher);

  if (!graphExists[0]?.exists) {
    // Create the graph projection if it doesn't exist
    const projectGraphCypher = `
      CALL gds.graph.project(
        'socialGraph',
        'Person',
        'KNOWS',
        {
          relationshipProperties: ['closeness_score']
        }
      )
    `;

    await executeCypherQuery(projectGraphCypher);
  }

  // Run Louvain algorithm to detect communities
  const louvainCypher = `
    CALL gds.louvain.stream('socialGraph', {
      relationshipWeightProperty: 'closeness_score'
    })
    YIELD nodeId, communityId
    RETURN gds.util.asNode(nodeId).name AS person, communityId AS group
    ORDER BY group, person
  `;

  try {
    const result = await executeCypherQuery<CommunityGroup>(louvainCypher);
    return result;
  } catch (error) {
    console.error('Error detecting communities:', error);
    return [];
  }
}

// Submit a comparison result and update scores
export async function submitComparison(
  pair1: [string, string],
  pair2: [string, string],
  pair1Won: boolean
): Promise<{ pair1: Relationship; pair2: Relationship }> {
  // Get current scores
  const getScoresCypher = `
    MATCH (a1:Person {name: $a1Name})-[r1:KNOWS]-(b1:Person {name: $b1Name}),
          (a2:Person {name: $a2Name})-[r2:KNOWS]-(b2:Person {name: $b2Name})
    RETURN r1.closeness_score as pair1Score, r2.closeness_score as pair2Score
  `;

  const scores = await executeCypherQuery<{ pair1Score: number, pair2Score: number }>(getScoresCypher, {
    a1Name: pair1[0],
    b1Name: pair1[1],
    a2Name: pair2[0],
    b2Name: pair2[1]
  });

  if (scores.length === 0) {
    // Create relationships if they don't exist
    await createOrUpdateRelationship(pair1[0], pair1[1]);
    await createOrUpdateRelationship(pair2[0], pair2[1]);

    // Default starting score is 1200
    const pair1Score = 1200;
    const pair2Score = 1200;

    // Calculate new scores
    const { newPair1Score, newPair2Score } = calculateNewScores(pair1Score, pair2Score, pair1Won);

    // Update the scores
    const pair1Result = await updateRelationshipScore(pair1[0], pair1[1], newPair1Score);
    const pair2Result = await updateRelationshipScore(pair2[0], pair2[1], newPair2Score);

    // Return serialized data safe for client components
    return serializeNeo4jObject({
      pair1: pair1Result,
      pair2: pair2Result
    });
  } else {
    const pair1Score = scores[0].pair1Score;
    const pair2Score = scores[0].pair2Score;

    // Calculate new scores
    const { newPair1Score, newPair2Score } = calculateNewScores(pair1Score, pair2Score, pair1Won);

    // Update the scores
    const pair1Result = await updateRelationshipScore(pair1[0], pair1[1], newPair1Score);
    const pair2Result = await updateRelationshipScore(pair2[0], pair2[1], newPair2Score);

    // Return serialized data safe for client components
    return serializeNeo4jObject({
      pair1: pair1Result,
      pair2: pair2Result
    });
  }
}
