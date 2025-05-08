# Social Graph - Minimal Todo List

## 1. Setup Neo4j Aura
- [ ] Sign up for Neo4j Aura at https://neo4j.com/cloud/aura/
- [ ] Create a new Neo4j Aura database instance
- [ ] Enable Graph Data Science on your Aura instance

## 2. Create Database Connection
- [x] Add neo4j-driver package
- [x] Create a simple db.ts connection utility
- [x] Store connection details in .env

## 3. Create Essential Pages
- [x] Home page with links
- [x] People management page
  - [x] Simple form to add people
  - [x] List of added people
  - [x] Delete people functionality
- [x] Comparison page (core feature)
  - [x] Show two pairs of people
  - [x] Button to select which pair is closer
- [ ] Results page
  - [ ] Simple list of relationships sorted by closeness
  - [ ] Basic group visualization

## 4. Implement Server Actions
- [x] addPerson() - Add a new person
- [x] deletePerson() - Delete a person
- [x] getPairsToCompare() - Get two relationship pairs
- [x] submitComparison() - Update scores after selection
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
