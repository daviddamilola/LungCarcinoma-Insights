import { Add, Remove } from "@mui/icons-material";
import {
  Box,
  ButtonBase,
  Collapse,
  Link,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import { Fragment,useState } from "react";

import BarChart from "./BarChart";
import RadarChart from "./RadarChart";
import type { AssocRow } from "./types";

type Props = { rows: AssocRow[] };
type TargetLinkProps = { approvedName: string; approvedSymbol: string };

const styles = {
  paper: { borderRadius: 0, overflow: "hidden" },
  expandedBox: { px: 2, py: 2, bgcolor: "background.default" },
  tabsRoot: { minHeight: 36 },
  scoreText: { fontVariantNumeric: "tabular-nums" as const },
  rowButtonWrapper: {
    p: 0,
    width: 48,
    textAlign: "center",
    position: "relative",
  },
  rowButton: {
    width: "100%",
    height: "100%",
    borderRadius: 0,
    bgcolor: "primary.main",
    position: "absolute",
    top: 0,
    left: 0,
    color: "white",
    "&:hover": {
      bgcolor: "primary.dark",
    },
  },
  table: {
    borderCollapse: "separate",
    borderSpacing: 0,
    "& th, & td": { border: 0, m: 0 },

    "& thead th": {
      fontWeight: "bold",
      borderBottom: "1px solid",
      borderColor: "grey.300",
      fontSize: "1rem",
    },

    "& tbody tr:not(:last-of-type) td": {
      borderBottom: "1px solid",
      borderColor: "grey.300",
    },

    "& tr > *:not(:last-child)": {
      borderRight: "1px solid",
      borderColor: "grey.300",
    },
  },
  tabRoot: {
    minHeight: 36,
    borderColor: "grey.300",
    "& .MuiTab-root": {
      textTransform: "none",
      minHeight: 36,
      px: 3,
      mr: 1,
      borderRadius: 0,
      color: "text.primary",
      fontWeight: 500,
    },
    "& .MuiTab-root.Mui-selected": {
      bgcolor: "primary.main",
      color: "common.white",
      fontWeight: 700,
    },
  },
  tab: { height: 20 },
  tabWrapper: { borderBottom: 1, borderColor: "grey.300", mb: 2 },
};

function TargetLink({ approvedName, approvedSymbol }: TargetLinkProps) {
  const href = `https://platform.opentargets.org/target/${encodeURIComponent(approvedName)}`;
  return (
    <Link href={href} target="_blank" rel="noreferrer" underline="hover">
      {approvedSymbol}
    </Link>
  );
}

/**
 * Renders a Material UI table of gene–disease associations with expandable rows.
 *
 * Each row displays:
 * - An expand/collapse button
 * - The gene's approved symbol (linked to Open Targets)
 * - The gene's approved name
 * - The overall association score (numeric, fixed to 3 decimals)
 *
 * When expanded, a row reveals a tabbed section where the user can
 * switch between a **Bar Chart** and a **Radar Chart** visualization
 * of the per-datatype association scores.
 *
 * @component
 *
 * @param {Object} props - Component props
 * @param {AssocRow[]} props.rows - An array of association rows,
 * each containing the gene symbol, name, overall score, and datatype scores.
 *
 * @example
 * ```tsx
 * <AssociationTable rows={[
 *   {
 *     id: "ENSG00000146648",
 *     approvedSymbol: "EGFR",
 *     approvedName: "epidermal growth factor receptor",
 *     score: 0.894,
 *     datatypeScores: [
 *       { id: "known_drug", score: 0.7 },
 *       { id: "literature", score: 0.8 },
 *     ],
 *     approvedNameRaw: "epidermal growth factor receptor"
 *   }
 * ]} />
 * ```
 *
 * @returns {JSX.Element} A table with expandable rows and chart visualizations.
 */
export default function AssociationTable({ rows }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [tabById, setTabById] = useState<Record<string, 0 | 1>>({}); // 0=bar, 1=radar

  return (
    <Paper variant="outlined" sx={styles.paper}>
      <TableContainer>
        <Table
          sx={styles.table}
          aria-label="Genes associated with lung carcinoma"
        >
          <TableHead>
            <TableRow>
              <TableCell width={48} />
              <TableCell>Approved Symbol</TableCell>
              <TableCell>Gene Name</TableCell>
              <TableCell>Overall Association Score</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((eachRow) => {
              const tab = tabById[eachRow.id] ?? 0;
              return (
                <Fragment key={eachRow.id}>
                  <TableRow hover>
                    <TableCell sx={styles.rowButtonWrapper}>
                      <Tooltip
                        title={openId === eachRow.id ? "Collapse" : "Expand"}
                      >
                        <ButtonBase
                          onClick={() =>
                            setOpenId(openId === eachRow.id ? null : eachRow.id)
                          }
                          aria-label={
                            openId === eachRow.id
                              ? "Collapse row"
                              : "Expand row"
                          }
                          sx={styles.rowButton}
                        >
                          {openId === eachRow.id ? <Remove /> : <Add />}
                        </ButtonBase>
                      </Tooltip>
                    </TableCell>

                    <TableCell>
                      <TargetLink
                        approvedSymbol={eachRow.approvedSymbol}
                        approvedName={eachRow.approvedName}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography>{eachRow.approvedName}</Typography>
                    </TableCell>

                    <TableCell>
                      <Typography sx={styles.scoreText}>
                        {eachRow.score.toFixed(3)}
                      </Typography>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell colSpan={4} sx={{ p: 0, border: 0 }}>
                      <Collapse
                        in={openId === eachRow.id}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Box sx={styles.expandedBox}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={2}
                            sx={styles.tabWrapper}
                          >
                            <Tabs
                              value={tab}
                              onChange={(_, value: 0 | 1) =>
                                setTabById((tabIds) => ({
                                  ...tabIds,
                                  [eachRow.id]: value,
                                }))
                              }
                              aria-label="chart view tabs"
                              sx={styles.tabRoot}
                            >
                              <Tab label="Bar chart" sx={styles.tab} />
                              <Tab label="Radar chart" sx={styles.tab} />
                            </Tabs>
                          </Stack>

                          {tab === 0 ? (
                            <BarChart
                              items={eachRow.datatypeScores}
                              title={`Data Type Scores: ${eachRow.approvedSymbol} and lung carcinoma`}
                            />
                          ) : (
                            <RadarChart
                              items={eachRow.datatypeScores}
                              title={`Data Type Scores: ${eachRow.approvedSymbol} and lung carcinoma`}
                            />
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
