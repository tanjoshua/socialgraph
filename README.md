# Social Graph - Relationship Closeness System

A simple system for tracking relationship closeness between people using paired comparisons (similar to chess Elo ratings), with Neo4j for storage and group detection.

## Algorithm Overview

This system uses a modified Elo rating approach to quantify how close different relationships are:

1. **Comparison Process**:
   - User is shown two pairs of people: (A,B) vs (C,D)
   - User selects which pair has the closer relationship
   - System updates scores based on selection

2. **Score Update Formula**:
   When pair (A,B) is chosen as closer than pair (C,D):
   ```
   S(A,B)_new = S(A,B)_old + K × (1 - P(A,B))
   S(C,D)_new = S(C,D)_old + K × (0 - P(C,D))
   ```
   Where:
   - K = 32 (determines how quickly scores change)
   - P(A,B) = 1 / (1 + 10^((S(C,D) - S(A,B))/400))

3. **Initialization**: New relationships start with score 1200

## Neo4j Implementation

### Data Model

```
(Person) -[:KNOWS {closeness_score, comparison_count}]-> (Person)
```

### Setup Neo4j Aura

1. Sign up for Neo4j Aura (cloud database): https://neo4j.com/cloud/aura/
2. Create a new database instance (Free tier available for small projects)
3. Enable Graph Data Science on your Aura instance
4. Save your connection credentials (URI, username, password) for application configuration

### Core Queries

```cypher
// Create a person
CREATE (p:Person {name: $name}) RETURN p

// Create or update relationship
MATCH (a:Person {name: $name1}), (b:Person {name: $name2})
MERGE (a)-[r:KNOWS]-(b)
ON CREATE SET r.closeness_score = 1200, r.comparison_count = 0
RETURN r

// Update a relationship score after comparison
MATCH (a:Person {name: $name1})-[r:KNOWS]-(b:Person {name: $name2})
SET r.closeness_score = $newScore,
    r.comparison_count = r.comparison_count + 1
RETURN r

// Get all people for selection
MATCH (p:Person) RETURN p.name ORDER BY p.name

// Get all relationships for visualization
MATCH (a:Person)-[r:KNOWS]-(b:Person)
WHERE id(a) < id(b)  // avoid duplicates
RETURN a.name as person1, b.name as person2, r.closeness_score as score
ORDER BY score DESC
```

### Community Detection (Group Formation)

```cypher
// Find natural groups based on relationship closeness
CALL gds.graph.create(
  'socialGraph',
  'Person',
  'KNOWS',
  {
    relationshipProperties: ['closeness_score']
  }
)

// Run Louvain algorithm to detect communities
CALL gds.louvain.stream('socialGraph', {
  relationshipWeightProperty: 'closeness_score'
})
YIELD nodeId, communityId
RETURN gds.util.asNode(nodeId).name AS person, communityId AS group
ORDER BY group, person
```

## Minimal Implementation Steps

1. **Backend**:
   - Neo4j database setup
   - Simple API with endpoints:
     - `/people` - List/add people
     - `/compare` - Get two relationship pairs for comparison
     - `/submit` - Submit comparison result & update scores
     - `/groups` - Get community groups
     - `/graph` - Get relationships for visualization

2. **Frontend**:
   - Simple form to add people
   - Comparison interface showing two pairs
   - Basic visualization using D3.js or similar
   - Group display panel

## Getting Started

```bash
# Install dependencies
npm install neo4j-driver express cors

# Start server
node server.js
```

Access the app at http://localhost:3000

## Tech Stack

- **Database**: Neo4j
- **Backend**: Node.js + Express
- **Frontend**: Simple HTML/CSS/JS or React
- **Visualization**: D3.js or Neovis.js
