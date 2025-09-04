import { GraphQLClient } from "graphql-request";
export const endpoint = "https://api.platform.opentargets.org/api/v4/graphql";
export function getClient() {
  return new GraphQLClient(endpoint, { headers: {} });
}
