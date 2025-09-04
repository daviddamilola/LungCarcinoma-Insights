import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { getClient } from "~/lib/graphql";
import { getSdk } from "~/graphql/generated";
import type { LoaderFunctionArgs } from "react-router";

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
      approvedName: r?.target?.id ?? "",
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

export default function Home({ loaderData }: Route.ComponentProps) {
  console.log(loaderData);
  return <Welcome />;
}
