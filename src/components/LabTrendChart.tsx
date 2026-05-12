import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useStore } from '../store/useStore';
import { format, parseISO, subMonths } from 'date-fns';

interface LabTrendChartProps {
  metricName: string;
}

export const LabTrendChart: React.FC<LabTrendChartProps> = ({ metricName }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { reports, activeProfileId } = useStore();

  const data = React.useMemo(() => {
    // Filter reports for the active profile that are lab results and have the specific metric
    const filtered = reports
      .filter(r => r.profileId === activeProfileId && r.type === 'lab_result' && r.metrics)
      .map(r => {
        const metric = r.metrics?.find(m => m.name.toLowerCase().includes(metricName.toLowerCase()));
        return {
          date: parseISO(r.date),
          value: metric ? parseFloat(metric.value.toString()) : null,
          unit: metric?.unit || ''
        };
      })
      .filter(d => d.value !== null)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return filtered;
  }, [reports, activeProfileId, metricName]);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = 250;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };

    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value as number) || 0] as [number, number]).nice()
      .range([height - margin.bottom, margin.top]);

    // Draw grid lines
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(5).tickSize(-(height - margin.top - margin.bottom)).tickFormat(() => ""))
      .attr("stroke-opacity", 0.1);

    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickSize(-(width - margin.left - margin.right)).tickFormat(() => ""))
      .attr("stroke-opacity", 0.1);

    // X Axis
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => format(d as Date, 'MMM yy')))
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .attr("color", "#94a3b8")
      .select(".domain").attr("stroke-opacity", 0.2);

    // Y Axis
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5))
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .attr("color", "#94a3b8")
      .select(".domain").attr("stroke-opacity", 0.2);

    // Gradient definition
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "line-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", y(0))
      .attr("x2", 0).attr("y2", y(d3.max(data, d => d.value as number) || 0));

    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#3b82f6").attr("stop-opacity", 0.2);
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#3b82f6").attr("stop-opacity", 0.8);

    // Line generator
    const line = d3.line<{date: Date, value: number | null}>()
      .x(d => x(d.date))
      .y(d => y(d.value as number))
      .curve(d3.curveMonotoneX);

    // Area generator
    const area = d3.area<{date: Date, value: number | null}>()
      .x(d => x(d.date))
      .y0(y(0))
      .y1(d => y(d.value as number))
      .curve(d3.curveMonotoneX);

    // Area
    svg.append("path")
      .datum(data)
      .attr("fill", "url(#line-gradient)")
      .attr("d", area as any);

    // Line
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 3)
      .attr("d", line as any);

    // Points
    svg.selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.date))
      .attr("cy", d => y(d.value as number))
      .attr("r", 5)
      .attr("fill", "#fff")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2);

    // Value Labels
    svg.selectAll(".label")
      .data(data)
      .enter()
      .append("text")
      .attr("x", d => x(d.date))
      .attr("y", d => y(d.value as number) - 10)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("font-weight", "black")
      .attr("fill", "#334155")
      .text(d => d.value);

  }, [data]);

  if (data.length === 0) {
    return (
      <div className="h-48 flex flex-col items-center justify-center bg-muted/20 rounded-3xl border border-dashed border-border p-6 text-center">
        <p className="text-sm font-bold text-muted-foreground">Insufficient lab data to plot {metricName} trend.</p>
        <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-widest">Upload more lab reports in the vault</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4 px-1">
        <div>
          <h4 className="text-sm font-bold text-foreground capitalize">{metricName} Analysis</h4>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{data.length} results found</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-primary">{data[data.length-1].value} <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-normal">{data[data.length-1].unit}</span></p>
          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Latest Insight</p>
        </div>
      </div>
      <div className="relative bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-border p-2">
        <svg ref={svgRef} className="w-full h-[250px]"></svg>
      </div>
    </div>
  );
};
