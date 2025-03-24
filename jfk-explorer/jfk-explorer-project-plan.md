# JFK Files Explorer - Project Plan

REMEMBER TO USE tailwindcss defaults
DO NOT CREATE CUSTOM STYLES OR HELPERS

REMEMBER D-R-Y AND KEEP IT SIMPLE

ALWAYS KEEP THE PROJECT SIMPLE AND EASY TO UNDERSTAND
BUILD ONLY WHAT IS NECESSARY AND NOTHING MORE

THE MARKDOWN AND JSON FILES ARE IN THE public/ folder

NEVER NEVER NEVER generate sample data or content - it needs to always be real 
if you cannot make something then ask me
if you generate something that is sample data then you will be fired

## 1. Project Setup
- [x] Initialize Next.js application with TypeScript
  - [x] Create new Next.js project with `npx create-next-app jfk-explorer --typescript`
  - [x] Configure ESLint and Prettier
  - [x] Set up directory structure (pages, components, lib, styles, etc.)
- [x] Configure CSS framework
  - [x] Install and setup Tailwind CSS
  - [x] Create base theme and common styles
- [x] Set up basic navigation infrastructure
  - [x] Create layout components
  - [x] Set up routing

## 2. Data Model & Utilities
- [x] Create TypeScript interfaces for document data
  - [x] Define Document interface
  - [x] Define Relationship interface
  - [x] Define Entity interface
- [x] Build data loading utilities
  - [x] Create function to load JSON document metadata
  - [x] Create function to load MD file content
  - [x] Create function to map between JSON and MD files
  - [x] Create utility to extract relationship data
- [x] Set up data context/state management
  - [x] Implement context or state management solution
  - [x] Create hooks for accessing document data

## 3. Document Browser
- [x] Create document list component
  - [x] Implement virtualized list for performance
  - [x] Add sorting functionality
  - [x] Create document card/preview component
- [x] Add filtering and search capabilities
  - [x] Implement filter by category/type
  - [x] Create search functionality
  - [x] Add date range filtering
- [x] Create document detail view
  - [x] Display markdown content with proper formatting
  - [x] Show metadata information
  - [x] Implement navigation between documents

## 4. Relationship Visualization
- [x] Set up visualization library
  - [x] Integrate D3.js or similar library
  - [x] Create base visualization component
- [x] Implement relationship graph
  - [x] Create node representation for documents
  - [x] Implement interactive connections between documents
  - [x] Add zooming and panning functionality
- [x] Build relationship detail view
  - [x] Show connected documents
  - [x] Display relationship type and metadata
  - [x] Allow navigation to related documents

## 5. Entity Browser
- [x] Create entities list page
  - [x] Implement entity card component
  - [x] Add entity categorization (people, organizations, locations)
  - [x] Implement sorting and filtering
- [x] Build entity detail view
  - [x] Display entity metadata and description
  - [x] Show related documents
  - [x] Implement connections to other entities
- [x] Add search and filtering capabilities
  - [x] Create entity search functionality
  - [x] Add filtering by entity type
  - [x] Implement relationship filters

## 6. Network Visualization
- [x] Create network page
  - [x] Design network graph interface
  - [x] Implement network visualization controls
  - [x] Create legend and information panel
- [x] Add interactive features
  - [x] Implement entity-document connection views
  - [x] Add filtering options for network visualization
  - [x] Create focus mode for specific connections

## 7. About Page
- [x] Create about page content
  - [x] Add project description and background
  - [x] Include information about the JFK documents
  - [x] Provide usage instructions
- [x] Implement help features
  - [x] Create getting started guide
  - [x] Add FAQ section
  - [x] Include contact information

## 8. Homepage Consolidation
- [x] Make Document Browser the default landing page
  - [x] Update app/page.tsx to render Documents content or redirect
  
- [x] Update navigation structure
  - [x] Update Navbar to reflect Documents as home page
  - [x] Adjust active link states for correct highlighting
  - [x] Ensure mobile navigation works correctly
- [x] Update internal links
  - [x] Change any links that point to the old homepage
  - [x] Update component references
  - [x] Fix any navigation paths throughout the codebase

## 10. Advanced Features
- [ ] Implement document history tracking
  - [ ] Create recently viewed documents list
  - [ ] Add ability to bookmark documents
- [ ] Add view customization options
  - [ ] Implement light/dark mode
  - [ ] Create display preference settings
- [ ] Optimize for performance
  - [ ] Implement code splitting and lazy loading
  - [ ] Add caching for document data
  - [ ] Optimize bundle size

