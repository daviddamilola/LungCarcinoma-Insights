import { Box } from "@mui/material";
import * as d3 from "d3";
import { useEffect, useRef } from "react";

import { formatLabel } from "~/lib/labels";

import type { Datum } from "./types";

export type RadarItem = { id: string; score: number };
type Props = { items: RadarItem[]; title: string };

const styles = {
  wrapper: { display: "flex", justifyContent: "center", position: "relative" as const },
  svg: { width: "60%", height: "auto", display: "block" },
  tooltip: {
    position: "absolute" as const,
    pointerEvents: "none" as const,
    opacity: 0,
    padding: "6px 8px",
    borderRadius: 6,
    fontSize: 12,
    lineHeight: 1.2,
    background: "rgba(17, 24, 39, 0.92)",
    color: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
    transform: "translate(8px, -50%)", // show to the side of the cursor
    transition: "opacity 120ms ease",
    zIndex: 1,
  },
} as const;


/**
 * Renders a radar (spider) chart using D3.js inside a responsive SVG.
 *
 * Each axis represents a datatype score associated with a gene–disease relationship.
 * Scores are plotted radially from the center, connected into a polygon, and
 * annotated with axis labels and concentric grid rings.
 *
 * Features:
 * - Circular grid lines for score levels (0.000 → 1.000).
 * - Spokes for each datatype dimension.
 * - Axis labels positioned around the circle using cosine/sine geometry.
 * - Polygon area filled with semi-transparent blue and stroked outline.
 * - Markers drawn at each data point for clarity.
 * - Title displayed above the chart.
 *
 * @component
 *
 * @param {Object} props - Component props.
 * @param {RadarItem[]} props.items - Array of `{ id, score }` items representing
 * datatype identifiers and their scores (0.0 → 1.0).
 * @param {string} props.title - Title displayed above the chart.
 *
 * @example
 * ```tsx
 * <RadarChart
 *   title="Data Type Scores: EGFR and lung carcinoma"
 *   items={[
 *     { id: "known_drug", score: 0.7 },
 *     { id: "literature", score: 0.8 },
 *     { id: "genetic_association", score: 0.9 },
 *     { id: "somatic_mutation", score: 0.6 },
 *   ]}
 * />
 * ```
 *
 * @returns {JSX.Element} A responsive radar chart rendered in an SVG element.
 */
export default function RadarChart({ items, title }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Ensure a single tooltip div
    let tooltip = d3
      .select(containerRef.current)
      .select<HTMLDivElement>(".d3-tooltip");
    if (tooltip.empty()) {
      tooltip = d3.select(containerRef.current).append("div").attr("class", "d3-tooltip");
      Object.entries(styles.tooltip).forEach(([k, v]) => {
        (tooltip.node() as HTMLDivElement).style.setProperty(
          k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`),
          String(v)
        );
      });
    }

    // --- geometry
    const width = 640;
    const height = 500;
    const margin = 80;
    const radius = Math.min(width, height) / 2 - margin;

    const g = svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("role", "img")
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const data: Datum[] = items.map((d) => ({ label: formatLabel(d.id), value: d.score ?? 0 }));
    const n = data.length;
    const angle = d3.scaleLinear().domain([0, n]).range([0, 2 * Math.PI]);
    const r = d3.scaleLinear().domain([0, 1]).range([0, radius]);

    // To draw the rings in the radar chart
    const levels = [0, 0.25, 0.5, 0.75, 1];
    g.selectAll("circle.grid")
      .data(levels)
      .enter()
      .append("circle")
      .attr("class", "grid")
      .attr("r", (d) => r(d))
      .attr("fill", "none")
      .attr("stroke", "#e5e7eb");

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
      .attr("stroke", "#d1d5db");

    // Ring tick labels (stacked on the top vertical axis)
    const fmt = d3.format(".3f");
    g.selectAll("text.tick")
      .data(levels)
      .enter()
      .append("text")
      .attr("class", "tick")
      .attr("x", 0)
      .attr("y", (d) => -r(d))
      .attr("dy", -4)
      .attr("text-anchor", "middle")
      .attr("font-size", 12)
      .attr("fill", "#6b7280")
      .text((d) => fmt(d));

    // Axis labels (category names)
      g
      .selectAll<SVGTextElement, Datum>("text.axis-label")
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
      .text((d) => d.label)
      .attr("tabindex", 0);

    const radialLine: d3.LineRadial<number> = d3
      .lineRadial<number>()
      .radius((_v, i) => r(data[i].value))
      .angle((_v, i) => angle(i))
      .curve(d3.curveLinearClosed);

    const polygon = g
      .append("path")
      .datum<number[]>(data.map((d) => d.value))
      .attr("d", (values: number[]) => radialLine(values) ?? "")
      .attr("fill", "rgba(31, 119, 180, 0.12)")
      .attr("stroke", "#1f77b4")
      .attr("stroke-width", 1);

    // points
    const points = g
      .selectAll<SVGCircleElement, Datum>("circle.point")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "point")
      .attr("cx", (_d, i) => Math.cos(angle(i) - Math.PI / 2) * r(data[i].value))
      .attr("cy", (_d, i) => Math.sin(angle(i) - Math.PI / 2) * r(data[i].value))
      .attr("r", 3.5)
      .attr("fill", "#ffffff")
      .attr("stroke", "#1f77b4")
      .attr("stroke-width", 1)
      .attr("tabindex", 0);

    points.append("title").text((d) => `${d.label}: ${fmt(d.value)}`);

    
    const highlightPoint = (circle: SVGCircleElement) => {
      d3.select(circle).attr("r", 6).attr("stroke-width", 2);
      polygon.attr("fill", "rgba(31, 119, 180, 0.18)");
    };
    const resetPoint = (circle: SVGCircleElement) => {
      d3.select(circle).attr("r", 3.5).attr("stroke-width", 1);
      polygon.attr("fill", "rgba(31, 119, 180, 0.12)");
    };

    // Convert a point's SVG coordinates to container-relative coordinates
    const toContainerCoords = (cx: number, cy: number) => {
      const svgEl = svgRef.current!;
      const containerEl = containerRef.current!;
      const svgRect = svgEl.getBoundingClientRect();
      const containerRect = containerEl.getBoundingClientRect();
      
      // Calculate the actual SVG dimensions (accounting for viewBox scaling)
      const svgWidth = svgRect.width;
      const svgHeight = svgRect.height;
      const viewBoxWidth = 640;
      const viewBoxHeight = 500;
      
      // Scale factors for viewBox to actual SVG size
      const scaleX = svgWidth / viewBoxWidth;
      const scaleY = svgHeight / viewBoxHeight;
      
      // Convert from g-space (centered) to viewBox coordinates
      const viewBoxX = (viewBoxWidth / 2) + cx;
      const viewBoxY = (viewBoxHeight / 2) + cy;
      
      // Scale to actual SVG coordinates
      const actualX = viewBoxX * scaleX;
      const actualY = viewBoxY * scaleY;
      
      // Convert to container-relative coordinates
      return {
        x: actualX + (svgRect.left - containerRect.left),
        y: actualY + (svgRect.top - containerRect.top)
      };
    };

    const showTooltipAtPoint = (label: string, value: number, cx: number, cy: number) => {
      const { x, y } = toContainerCoords(cx, cy);
      tooltip
        .style("opacity", "1")
        .html(`<strong>${label}</strong><br/>Score: ${fmt(value)}`)
        .style("left", `${x}px`)
        .style("top", `${y}px`);
    };

    const hideTooltip = () => tooltip.style("opacity", "0");

    // interactivity: points (anchor tooltip to the point)
    points
      .on("mouseenter", function (_event, d) {
        const circle = d3.select(this);
        const cx = +circle.attr("cx");
        const cy = +circle.attr("cy");
        highlightPoint(this);
        showTooltipAtPoint(d.label, d.value, cx, cy);
      })
      .on("mouseleave", function () {
        resetPoint(this);
        hideTooltip();
      })
      .on("focus", function (_event, d) {
        const circle = d3.select(this);
        const cx = +circle.attr("cx");
        const cy = +circle.attr("cy");
        highlightPoint(this);
        showTooltipAtPoint(d.label, d.value, cx, cy);
      })
      .on("blur", function () {
        resetPoint(this);
        hideTooltip();
      });

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
    <Box ref={containerRef} sx={styles.wrapper}>
      <Box component="svg" ref={svgRef} sx={styles.svg} aria-label={title} />
    </Box>
  );
}