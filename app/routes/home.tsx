import type { Route } from "./+types/home";
import { getClient } from "~/lib/graphql";
import { getSdk } from "~/graphql/generated";
import { useLoaderData, type LoaderFunctionArgs } from "react-router";
import type { AssocRow } from "~/components/AssociationTable";
import AssociationTable from "~/components/AssociationTable";
import { Box, Typography } from "@mui/material";

export function meta({}: Route.MetaArgs) {
  return [
  { title: "Lung Carcinoma insights — Top targets for lung carcinoma" },
  { name: "description", content: "Top 10 targets with highest overall association score for lung carcinoma" },
  ];
}


export async function loader(_args: LoaderFunctionArgs) {
  const sdk = getSdk(getClient());
  const data = await sdk.lungCarcinomaAssociatedTargets();

  const rows= (data.disease?.associatedTargets?.rows ?? [])
    .map((r) => ({
      id: r?.target?.id ?? "",
      approvedSymbol: r?.target?.approvedSymbol ?? "",
      approvedName: r?.target?.approvedName ?? "",
      score: r?.score ?? 0,
      datatypeScores: (r?.datatypeScores ?? []).map((d) => ({
        id: d?.id ?? "",
        score: d?.score ?? 0,
      })),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return { rows };
}

export default function Home() {
    const { rows } = useLoaderData() as { rows: AssocRow[] };
    return (
    <Box px="10%" mb={20}>
      <Box my={2}>
        <Typography variant="h3" component="h2">
          Genes associated with lung carcinoma
        </Typography>
      </Box>

      <AssociationTable rows={rows} />
    </Box>
  );
}
