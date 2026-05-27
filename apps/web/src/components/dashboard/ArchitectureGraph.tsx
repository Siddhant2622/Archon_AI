"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

export interface GraphData {
  nodes: Array<{
    id: string;
    label: string;
    type: 'service' | 'database' | 'api' | 'component' | 'external';
    issues: number;
    size?: number;
  }>;
  links: Array<{
    source: string;
    target: string;
    type: 'sync' | 'async' | 'data' | 'circular';
    label?: string;
  }>;
}

export const sampleArchitectureData: GraphData = {
  nodes: [
    { id: "1", label: "Web Client (Next.js)", type: "component", issues: 0 },
    { id: "2", label: "API Gateway", type: "api", issues: 2 },
    { id: "3", label: "Auth Service", type: "service", issues: 0 },
    { id: "4", label: "User Database", type: "database", issues: 1 },
    { id: "5", label: "Payment Service", type: "service", issues: 0 },
    { id: "6", label: "Stripe API", type: "external", issues: 0 },
    { id: "7", label: "Analysis Engine", type: "service", issues: 3 },
    { id: "8", label: "Vector DB", type: "database", issues: 0 },
    { id: "9", label: "Redis Cache", type: "database", issues: 0 },
    { id: "10", label: "Worker Pool", type: "component", issues: 0 },
  ],
  links: [
    { source: "1", target: "2", type: "sync", label: "REST/GraphQL" },
    { source: "2", target: "3", type: "sync", label: "gRPC" },
    { source: "3", target: "4", type: "data" },
    { source: "2", target: "5", type: "sync" },
    { source: "5", target: "6", type: "sync", label: "HTTPS" },
    { source: "2", target: "7", type: "async", label: "Message Queue" },
    { source: "7", target: "8", type: "data" },
    { source: "7", target: "9", type: "data" },
    { source: "7", target: "10", type: "async" },
    { source: "10", target: "7", type: "circular", label: "Callback Loop" },
  ],
};

interface ArchitectureGraphProps {
  data: GraphData;
}

export default function ArchitectureGraph({ data }: ArchitectureGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = 600;
    
    // Clear previous graph
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);

    // Defs for markers (arrows)
    const defs = svg.append("defs");
    
    const defineMarker = (id: string, color: string) => {
      defs.append("marker")
        .attr("id", id)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 25) // Offset to not overlap node
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("fill", color)
        .attr("d", "M0,-5L10,0L0,5");
    };

    defineMarker("arrow-sync", "#94a3b8");
    defineMarker("arrow-async", "#22d3ee");
    defineMarker("arrow-circular", "#f43f5e");

    const g = svg.append("g");

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (e) => g.attr("transform", e.transform));
      
    svg.call(zoom);

    // Deep copy data for simulation
    const nodes = data.nodes.map(d => ({ ...d }));
    const links = data.links.map(d => ({ ...d }));

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(50));

    // Draw links
    const link = g.append("g")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", d => {
        if (d.type === 'circular') return "#f43f5e";
        if (d.type === 'async') return "#22d3ee";
        return "#94a3b8";
      })
      .attr("stroke-width", d => d.type === 'circular' ? 2 : 1.5)
      .attr("stroke-dasharray", d => d.type === 'async' ? "5,5" : "none")
      .attr("marker-end", d => `url(#arrow-${d.type})`);

    const linkLabel = g.append("g")
      .selectAll("text")
      .data(links.filter(d => d.label))
      .join("text")
      .attr("font-size", "10px")
      .attr("fill", "#64748b")
      .text(d => d.label!);

    // Draw nodes
    const node = g.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(d3.drag<any, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
      )
      .on("click", (e, d: any) => setSelectedNode(d.id));

    // Node shapes
    node.each(function(d: any) {
      const group = d3.select(this);
      
      // Issue pulse ring
      if (d.issues > 0) {
        group.append("circle")
          .attr("r", 25)
          .attr("fill", "none")
          .attr("stroke", "#f43f5e")
          .attr("stroke-width", 2)
          .attr("class", "animate-ping opacity-75");
      }

      let color = "#1e293b";
      let stroke = "#475569";
      
      switch(d.type) {
        case 'service': stroke = "#22d3ee"; break;
        case 'database': stroke = "#8b5cf6"; break;
        case 'api': stroke = "#34d399"; break;
        case 'component': stroke = "#fbbf24"; break;
        case 'external': 
          stroke = "#64748b"; 
          group.attr("stroke-dasharray", "4,4");
          break;
      }

      // Add glow filter
      group.append("circle")
        .attr("r", 20)
        .attr("fill", color)
        .attr("stroke", stroke)
        .attr("stroke-width", 2);
        
      // Add issue badge
      if (d.issues > 0) {
        group.append("circle")
          .attr("cx", 15)
          .attr("cy", -15)
          .attr("r", 8)
          .attr("fill", "#f43f5e");
        group.append("text")
          .attr("x", 15)
          .attr("y", -12)
          .attr("text-anchor", "middle")
          .attr("fill", "white")
          .attr("font-size", "9px")
          .attr("font-weight", "bold")
          .text(d.issues);
      }

      // Node label
      group.append("text")
        .attr("dy", 35)
        .attr("text-anchor", "middle")
        .attr("fill", "#f1f5f9")
        .attr("font-size", "12px")
        .text(d.label);
    });

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      linkLabel
        .attr("x", (d: any) => (d.source.x + d.target.x) / 2)
        .attr("y", (d: any) => (d.source.y + d.target.y) / 2 - 5);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [data]);

  return (
    <div className="relative w-full h-[600px] bg-bg-secondary rounded-xl border border-white/[0.06] overflow-hidden" ref={containerRef}>
      <div className="absolute top-4 left-4 flex gap-4 z-10">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-tertiary border border-white/[0.06] text-xs font-medium">
          <div className="w-3 h-3 rounded-full border-2 border-accent-cyan bg-bg-primary"></div> Service
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-tertiary border border-white/[0.06] text-xs font-medium">
          <div className="w-3 h-3 rounded-full border-2 border-accent-violet bg-bg-primary"></div> Database
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-tertiary border border-white/[0.06] text-xs font-medium">
          <div className="w-3 h-3 rounded-full border-2 border-accent-emerald bg-bg-primary"></div> API
        </div>
      </div>

      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      
      {selectedNode && (
        <div className="absolute top-4 right-4 w-64 p-4 rounded-xl bg-bg-tertiary/90 backdrop-blur-md border border-white/[0.1] shadow-xl animate-fade-in z-10">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-text-primary">
              {data.nodes.find(n => n.id === selectedNode)?.label}
            </h3>
            <button onClick={() => setSelectedNode(null)} className="text-text-muted hover:text-white">✕</button>
          </div>
          <p className="text-xs text-text-secondary uppercase mb-4 tracking-wider">
            {data.nodes.find(n => n.id === selectedNode)?.type} Node
          </p>
          
          {data.nodes.find(n => n.id === selectedNode)?.issues ? (
            <div className="p-3 rounded-lg bg-accent-rose/10 border border-accent-rose/20 mb-3">
              <span className="text-xs font-bold text-accent-rose flex items-center gap-1">
                ⚠️ {data.nodes.find(n => n.id === selectedNode)?.issues} Issues Detected
              </span>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-accent-emerald/10 border border-accent-emerald/20 mb-3">
              <span className="text-xs font-bold text-accent-emerald flex items-center gap-1">
                ✅ Healthy Status
              </span>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button className="flex-1 py-1.5 bg-white/[0.05] hover:bg-white/[0.1] rounded text-xs transition-colors">Inspect</button>
            <button className="flex-1 py-1.5 bg-accent-cyan/20 text-accent-cyan hover:bg-accent-cyan/30 rounded text-xs font-semibold transition-colors">Fix Issues</button>
          </div>
        </div>
      )}
    </div>
  );
}
