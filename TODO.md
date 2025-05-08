# Social Graph - Minimal Todo List

## 1. Setup Neo4j Aura
- [ ] Sign up for Neo4j Aura at https://neo4j.com/cloud/aura/
- [ ] Create a new Neo4j Aura database instance
- [ ] Enable Graph Data Science on your Aura instance

## 2. Create Database Connection
- [ ] Add neo4j-driver package
- [ ] Create a simple db.js connection utility
- [ ] Store connection details in .env.local

## 3. Create Essential Pages
- [ ] Home page with links
- [ ] People management page
  - [ ] Simple form to add people
  - [ ] List of added people
- [ ] Comparison page (core feature)
  - [ ] Show two pairs of people
  - [ ] Button to select which pair is closer
- [ ] Results page
  - [ ] Simple list of relationships sorted by closeness
  - [ ] Basic group visualization

## 4. Implement Server Actions
- [ ] addPerson() - Add a new person
- [ ] getPairsToCompare() - Get two relationship pairs
- [ ] submitComparison() - Update scores after selection
- [ ] getGroups() - Run community detection

## 5. Test
- [ ] Test with 5-10 friends
- [ ] Make any necessary fixes

## Core Files Needed
- `lib/db.js` - Neo4j connection
- `lib/actions.js` - Server actions
- `app/page.js` - Home page
- `app/people/page.js` - Add/manage people
- `app/compare/page.js` - Make comparisons
- `app/results/page.js` - View relationships/groups
