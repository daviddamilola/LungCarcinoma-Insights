import * as d3 from "d3";
import { Box } from "@mui/material";
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

    g.append("g")
      .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".3f")) as any)
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
