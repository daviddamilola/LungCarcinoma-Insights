import * as d3 from "d3";
import { useEffect, useRef } from "react";
import {Box} from "@mui/material";
import { formatLabel } from "~/lib/labels";

export type RadarItem = { id: string; score: number };
type Props = { items: RadarItem[]; title: string; };

const styles = {
  wrapper: { display: "flex", justifyContent: "center" },
  svg: { width: "60%", height: "auto", display: "block" },
} as const;

export default function RadarChart({ items, title }: Props) {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    // Canvas and geometry
    const width = 640;
    const height = 500;
    const margin = 80;
    const radius = Math.min(width, height) / 2 - margin; // to make sure the circle fits inside the width and height of the svg

    const g = svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("role", "img")
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);


    const data = items.map(d => ({
      label: formatLabel(d.id),
      value: d.score
    }));

    const numberOfAxis = data.length;
    const angle = d3.scaleLinear().domain([0, numberOfAxis]).range([0, 2 * Math.PI]);
    const radiusScale = d3.scaleLinear().domain([0, 1]).range([0, radius]);

    // To draw the rings in the radar chart
    const levels = [0, 0.25, 0.5, 0.75, 1];
    g.selectAll("circle.grid")
      .data(levels)
      .enter()
      .append("circle")
      .attr("class", "grid")
      .attr("r", d => radiusScale(d))
      .attr("fill", "none")
      .attr("stroke", "#e5e7eb"); // light gray

    // To draw the spokes (one per axis) from the center of the circle
    g.selectAll("line.spoke")
      .data(data)
      .enter()
      .append("line")
      .attr("class", "spoke")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", (_d, i) => Math.cos(angle(i) - Math.PI / 2) * radius)
      .attr("y2", (_d, i) => Math.sin(angle(i) - Math.PI / 2) * radius)
      .attr("stroke", "#d1d5db"); // slightly darker gray

    // Ring tick labels (stacked on the top vertical axis)
    const fmt = d3.format(".3f");
    g.selectAll("text.tick")
      .data(levels)
      .enter()
      .append("text")
      .attr("class", "tick")
      .attr("x", 0)
      .attr("y", d => -radiusScale(d))
      .attr("dy", -4)
      .attr("text-anchor", "middle")
      .attr("font-size", 12)
      .attr("fill", "#6b7280")
      .text(d => fmt(d));

    // Axis labels (category names)
    g.selectAll("text.axis-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "axis-label")
      .attr("x", (_d, i) => Math.cos(angle(i) - Math.PI / 2) * (radius + 20))
      .attr("y", (_d, i) => Math.sin(angle(i) - Math.PI / 2) * (radius + 20))
      .attr("text-anchor", (_d, i) => {
        const a = Math.cos(angle(i) - Math.PI / 2);
        return a > 0.1 ? "start" : a < -0.1 ? "end" : "middle";
      })
      .attr("dominant-baseline", "middle")
      .attr("font-size", 12)
      .text(d => d.label);

    // Polygon path (blue) + points
    const line = d3
      .lineRadial<number>()
      .radius((v, i) => radiusScale(data[i].value))
      .angle((_v, i) => angle(i))
      .curve(d3.curveLinearClosed);


    g.append("path")
      .datum(data.map(d => d.value))
      .attr("d", line as any)
      .attr("fill", "rgba(31, 119, 180, 0.12)") // light blue fill
      .attr("stroke", "#1f77b4") // blue stroke
      .attr("stroke-width", 1);

    // Markers
    g.selectAll("circle.point")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "point")
      .attr("cx", (_d, i) => Math.cos(angle(i) - Math.PI / 2) * radiusScale(data[i].value))
      .attr("cy", (_d, i) => Math.sin(angle(i) - Math.PI / 2) * radiusScale(data[i].value))
      .attr("r", 3.5)
      .attr("fill", "#ffffff")
      .attr("stroke", "#1f77b4")
      .attr("stroke-width", 1);

    // Title
    svg
      .append("text")
      .attr("y", 25)
      .attr("text-anchor", "left")
      .attr("fill", "#9f9f9fff")
      .attr("font-size", 14)
      .text(title);
  }, [items, title]);

  return (
    <Box sx={styles.wrapper}>
      <Box component="svg" ref={ref} sx={styles.svg} aria-label={title} />
    </Box>
  );
}
