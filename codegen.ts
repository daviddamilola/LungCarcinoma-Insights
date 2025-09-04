import type { CodegenConfig } from '@graphql-codegen/cli';
const config: CodegenConfig = {
  overwrite: true,
  schema: 'https://api.platform.opentargets.org/api/v4/graphql',
  documents: ['app/graphql/**/*.graphql'],
  generates: {
    'app/graphql/generated.ts': {
      plugins: ['typescript','typescript-operations','typescript-graphql-request'],
      config: { gqlTagName: 'gql', rawRequest: false }
    }
  }
};
export default config;
