import { useState, Fragment } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Typography, Box, Tabs, Tab, Collapse, Link, Stack, Tooltip
} from "@mui/material";
import BarChart from "./BarChart";
import RadarChart from "./RadarChart";
import { Add, Remove } from "@mui/icons-material";

export type DataTypeScore = { id: string; score: number };

export type AssocRow = {
  id: string;
  approvedSymbol: string;
  approvedName: string;
  score: number;
  datatypeScores: DataTypeScore[];
  approvedNameRaw: string;
};

type Props = { rows: AssocRow[] };
type TargetLinkProps = { approvedName: string; approvedSymbol: string };

const styles = {
  paper: { borderRadius: 0, overflow: "hidden" },
  expandedBox: { px: 2, py: 2, bgcolor: "background.default" },
  tabsRoot: { minHeight: 36 },
  scoreText: { fontVariantNumeric: "tabular-nums" as const },
};

function TargetLink({ approvedName, approvedSymbol }: TargetLinkProps) {
  const href = `https://platform.opentargets.org/target/${encodeURIComponent(approvedName)}`;
  return (
    <Link href={href} target="_blank" rel="noreferrer" underline="hover">
      {approvedSymbol}
    </Link>
  );
}

export default function AssociationTable({ rows }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [tabById, setTabById] = useState<Record<string, 0 | 1>>({}); // 0=bar, 1=radar

  return (
    <Paper variant="outlined" sx={styles.paper}>
      <TableContainer>
        <Table aria-label="Genes associated with lung carcinoma">
          <TableHead>
            <TableRow>
              <TableCell width={48} />
              <TableCell>Approved Symbol</TableCell>
              <TableCell>Gene Name</TableCell>
              <TableCell align="right">Overall Association Score</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((eachRow) => {
              const tab = tabById[eachRow.id] ?? 0;
              return (
                <Fragment key={eachRow.id}>
                  <TableRow hover>
                    <TableCell>
                      <Tooltip title={openId === eachRow.id ? "Collapse" : "Expand"}>
                        <IconButton
                          size="small"
                          onClick={() =>
                            setOpenId(openId === eachRow.id ? null : eachRow.id)
                          }
                          aria-label={
                            openId === eachRow.id ? "Collapse row" : "Expand row"
                          }
                        >
                          {openId === eachRow.id ? <Remove /> : <Add />}
                        </IconButton>
                      </Tooltip>
                    </TableCell>

                    <TableCell>
                      <TargetLink
                        approvedSymbol={eachRow.approvedSymbol}
                        approvedName={eachRow.approvedNameRaw}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography>{eachRow.approvedName}</Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Typography sx={styles.scoreText}>
                        {eachRow.score.toFixed(3)}
                      </Typography>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell colSpan={4} sx={{ p: 0, border: 0 }}>
                      <Collapse in={openId === eachRow.id} timeout="auto" unmountOnExit>
                        <Box sx={styles.expandedBox}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={2}
                            sx={{ mb: 2 }}
                          >
                            <Tabs
                              value={tab}
                              onChange={(_, value: 0 | 1) =>
                                setTabById((tabIds) => ({ ...tabIds, [eachRow.id]: value }))
                              }
                              aria-label="chart view tabs"
                              sx={styles.tabsRoot}
                            >
                              <Tab label="Bar chart" sx={styles.tabsRoot} />
                              <Tab label="Radar chart" sx={styles.tabsRoot} />
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
