# MCP Agents Orchestration Structure

This directory contains the orchestration structure for Cursor's MCP agents swarm to manage frontend, backend, and design implementation.

## Agent Structure

### Backend Agent
- **Purpose**: Manages backend API development, database operations, and server logic
- **Scope**: `/backend` directory
- **Responsibilities**:
  - API endpoint development
  - Database schema and migrations
  - Business logic implementation
  - Integration with external APIs (IGDB)

### Frontend Agent
- **Purpose**: Manages frontend UI/UX development and React/Next.js implementation
- **Scope**: `/frontend` directory
- **Responsibilities**:
  - Component development
  - Page routing and navigation
  - State management
  - User interface implementation

### Design Agent
- **Purpose**: Manages design system, UI/UX patterns, and Figma integration
- **Scope**: Design system, component styling, Figma MCP integration
- **Responsibilities**:
  - Design system consistency
  - Component styling
  - Figma design sync
  - UI/UX improvements

## Agent Coordination

Agents communicate through:
1. **Shared Configuration**: Environment variables, API contracts
2. **Type Definitions**: Shared TypeScript types (when applicable)
3. **API Contracts**: REST API endpoints and data structures
4. **Design Tokens**: Colors, spacing, typography from Figma

## Usage

Each agent should:
1. Focus on its designated scope
2. Follow established patterns and conventions
3. Coordinate with other agents when cross-cutting concerns arise
4. Update shared documentation when making significant changes

