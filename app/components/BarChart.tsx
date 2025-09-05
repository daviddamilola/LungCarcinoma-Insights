import { Box } from "@mui/material";
import * as d3 from "d3";
import { useEffect, useRef } from "react";

import { formatLabel } from "~/lib/labels";

export type BarItem = { id: string; score: number };
type Props = {
  items: BarItem[];
  title: string;
  height?: number;
  width?: number;
};

const styles = {
  container: { display: "flex", justifyContent: "center" },
  svg: { width: "60%", height: "auto", display: "block" },
} as const;

/**
 * Renders a vertical bar chart using D3.js inside a responsive SVG.
 *
 * Each bar represents a datatype score associated with a gene–disease relationship.
 * The chart is fully scalable via SVG `viewBox` and styled to fit within
 * a centered flex container.
 *
 * Features:
 * - X-axis: formatted datatype labels (from {@link formatLabel}).
 * - Y-axis: normalized scores from 0.000 to 1.000 (three decimals).
 * - Bars: blue rectangles sized by score value.
 * - Chart title and axis labels for context.
 *
 * @component
 *
 * @param {Object} props - Component props.
 * @param {BarItem[]} props.items - Array of `{ id, score }` items representing
 * datatype identifiers and their scores.
 * @param {string} props.title - Title displayed above the chart.
 * @param {number} [props.height=360] - Height of the chart in pixels.
 * @param {number} [props.width=640] - Width of the chart in pixels.
 *
 * @example
 * ```tsx
 * <BarChart
 *   title="Data Type Scores: EGFR and lung carcinoma"
 *   items={[
 *     { id: "known_drug", score: 0.7 },
 *     { id: "literature", score: 0.8 },
 *     { id: "genetic_association", score: 0.9 },
 *   ]}
 * />
 * ```
 *
 * @returns {JSX.Element} A responsive bar chart rendered in an SVG element.
 */
export default function BarChart({
  items,
  title,
  height = 360,
  width = 640,
}: Props) {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const margin = { top: 60, right: 20, bottom: 60, left: 70 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const g = svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("role", "img")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const data = items.map((d) => ({
      label: formatLabel(d.id),
      value: d.score ?? 0,
    }));

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([0, w])
      .padding(0.3);

    const y = d3.scaleLinear().domain([0, 1]).range([h, 0]);

    // Axes
    g.append("g")
      .attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(0)")
      .attr("dy", "1.5em")
      .attr("font-size", 8);

    const formatTick = d3.format(".3f");
    const yAxis: d3.Axis<d3.NumberValue> = d3
      .axisLeft(y)
      .ticks(5)
      .tickFormat((d: d3.NumberValue) => formatTick(Number(d)));

    g.append("g")
      .call(yAxis)
      .selectAll("text")
      .attr("font-size", 10);

    // Bars
    g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.label)!)
      .attr("y", (d) => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", (d) => h - y(d.value))
      .attr("fill", "#1f77b4"); // blue color

    // Chart title
    svg
      .append("text")
      .attr("y", 25)
      .attr("text-anchor", "left")
      .attr("fill", "#9f9f9fff")
      .attr("font-size", 14)
      .text(title);

    // Axis labels
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .attr("font-size", 10)
      .text("Data Type");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("font-size", 10)
      .text("Association Score");
  }, [items, title, height, width]);

  return (
    <Box sx={styles.container}>
      <Box component="svg" ref={ref} sx={styles.svg} aria-label={title} />
    </Box>
  );
}
