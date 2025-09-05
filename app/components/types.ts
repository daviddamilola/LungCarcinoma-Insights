
export type DataTypeScore = { id: string; score: number; };

export type AssocRow = {
  id: string;
  approvedSymbol: string;
  approvedName: string;
  score: number;
  datatypeScores: DataTypeScore[];
};
