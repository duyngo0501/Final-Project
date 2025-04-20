# Project Name

## API Client Generation

To generate the API client from an OpenAPI specification:

\`\`\`bash
npm run generate:api
\`\`\`

This will create generated files in \`src/generated/api\` directory.

### Using Generated Hooks

After generating the API client, you can import and use the generated hooks in your components:

\`\`\`typescript
import { useGetUsers } from './generated/api/hooks/useGetUsers'

function UserList() {
  const { data, isLoading } = useGetUsers()
  // Use data and handle loading state
}
\`\`\`

### Updating OpenAPI Specification

Replace the \`openapi.json\` file with your actual API specification and run the generation script.

## Data Providers

The project uses both SWR and React Query for data fetching:

- SWR: Lightweight data fetching with caching and revalidation
- React Query: Powerful async state management with advanced caching

The \`DataProvider\` wraps the application, providing context for both libraries.

## Development Scripts

- \`npm run generate:api\`: Generate API client from OpenAPI spec
- \`npm run dev\`: Start development server
- \`npm run build\`: Build production assets
