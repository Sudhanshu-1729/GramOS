import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BusinessNode } from '../data/mockData';
import { ZoomIn, ZoomOut, RotateCcw, AlertTriangle, ArrowRight, HelpCircle } from 'lucide-react';
import GlassCard from './ui/GlassCard';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface DigitalTwinProps {
  nodes: BusinessNode[];
  connections: { from: string; to: string }[];
}

export const DigitalTwin: React.FC<DigitalTwinProps> = ({ nodes, connections }) => {
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<BusinessNode | null>(null);

  // Sync selected node with the profile nodes on profile load
  useEffect(() => {
    if (nodes && nodes.length > 0) {
      setSelectedNode(nodes[0]);
    }
  }, [nodes]);

  // Handle zooming
  const handleZoom = (direction: 'in' | 'out') => {
    setScale((prev) => {
      const next = direction === 'in' ? prev + 0.15 : prev - 0.15;
      return Math.max(0.5, Math.min(2, next));
    });
  };

  // Reset view
  const handleReset = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
    if (nodes && nodes.length > 0) {
      setSelectedNode(nodes[0]);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).tagName === 'g') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getTypeColor = (type: BusinessNode['type']) => {
    switch (type) {
      case 'asset': return 'from-emerald-500 to-teal-600';
      case 'liability': return 'from-amber-500 to-orange-600';
      case 'revenue': return 'from-blue-500 to-indigo-600';
      case 'supplier': return 'from-zinc-500 to-slate-600';
      case 'customer': return 'from-purple-500 to-pink-600';
      case 'risk': return 'from-red-500 to-rose-600';
    }
  };

  const getNodeIconSymbol = (type: BusinessNode['type']) => {
    switch (type) {
      case 'asset': return '▲';
      case 'liability': return '▼';
      case 'revenue': return '◆';
      case 'supplier': return '◀';
      case 'customer': return '▶';
      case 'risk': return '●';
    }
  };

  const getSeasonalityData = (node: BusinessNode) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let base = 50;
    let amplitude = 20;
    let phase = 0;

    if (node.type === 'risk') {
      base = 20; amplitude = 60; phase = 5;
    } else if (node.id.includes('cow') || node.id.includes('coop') || node.id.includes('rent') || node.id.includes('wheat')) {
      base = 70; amplitude = 15; phase = 8;
    } else if (node.id.includes('feed') || node.id.includes('grid')) {
      base = 60; amplitude = 25; phase = 4;
    }

    return months.map((m, i) => {
      const val = base + amplitude * Math.sin((i - phase) * (Math.PI / 6));
      return { month: m, value: Math.round(Math.max(10, val)) };
    });
  };

  return (
    <div className="w-full h-full relative grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Network workspace */}
      <GlassCard className="lg:col-span-3 h-[600px] relative overflow-hidden flex flex-col justify-between" intensity="normal">
        <div className="absolute top-4 left-4 z-10 flex space-x-2 bg-black/35 backdrop-blur-md px-3 py-2 rounded-xl border border-white/5">
          <button onClick={() => handleZoom('in')} className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors">
            <ZoomIn size={16} />
          </button>
          <button onClick={() => handleZoom('out')} className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors">
            <ZoomOut size={16} />
          </button>
          <button onClick={handleReset} className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors">
            <RotateCcw size={16} />
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-10 bg-black/40 backdrop-blur-md px-3 py-2 rounded-xl border border-white/5 grid grid-cols-3 gap-2 text-[10px] text-zinc-400">
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Asset</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span> Liability</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span> Revenue</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-zinc-400 inline-block"></span> Partner</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block"></span> Buyer</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span> Risk</div>
        </div>

        <svg
          className="w-full h-full cursor-grab active:cursor-grabbing bg-zinc-950/20"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-zinc-800/20 dark:text-zinc-800/40" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          <g transform={`translate(${pan.x}, ${pan.y}) scale(${scale})`}>
            {/* Links */}
            {connections.map((conn, idx) => {
              const fromNode = nodes.find(n => n.id === conn.from);
              const toNode = nodes.find(n => n.id === conn.to);
              if (!fromNode || !toNode) return null;

              const isSelectedPath = selectedNode && (selectedNode.id === conn.from || selectedNode.id === conn.to);

              return (
                <g key={`path-${idx}`}>
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={isSelectedPath ? "#10b981" : "#3f3f46"}
                    strokeOpacity={isSelectedPath ? 0.35 : 0.05}
                    strokeWidth={isSelectedPath ? 6 : 2}
                  />
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={isSelectedPath ? "#10b981" : "#52525b"}
                    strokeOpacity={isSelectedPath ? 0.8 : 0.3}
                    strokeWidth={1}
                    strokeDasharray={isSelectedPath ? "none" : "4 4"}
                  />
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const isRoot = node.id === 'twin-root';
              
              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer group"
                >
                  {node.status === 'critical' && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isRoot ? 48 : 30}
                      className="fill-red-500/10 stroke-red-500/30 stroke-1 animate-pulse"
                    />
                  )}
                  {node.status === 'warning' && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isRoot ? 46 : 28}
                      className="fill-amber-500/10 stroke-amber-500/30 stroke-1 animate-pulse"
                    />
                  )}
                  {isSelected && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isRoot ? 50 : 32}
                      className="fill-emerald-500/5 stroke-emerald-500/40 stroke-[2px] animate-pulse-slow"
                    />
                  )}

                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isRoot ? 40 : 22}
                    className={`
                      fill-zinc-900 stroke-[1.5px] transition-colors duration-200
                      ${isSelected ? 'stroke-emerald-400' : 'stroke-zinc-700 hover:stroke-zinc-500'}
                    `}
                  />

                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isRoot ? 32 : 16}
                    className={`bg-gradient-to-br ${getTypeColor(node.type)} opacity-90`}
                    fill={`url(#grad-${node.id})`}
                  />
                  
                  <defs>
                    <linearGradient id={`grad-${node.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" className="text-white" stopColor="var(--tw-gradient-from)" />
                      <stop offset="100%" className="text-white" stopColor="var(--tw-gradient-to)" />
                    </linearGradient>
                  </defs>

                  <text
                    x={node.x}
                    y={node.y + (isRoot ? 5 : 4)}
                    textAnchor="middle"
                    fill="white"
                    fontSize={isRoot ? 16 : 11}
                    fontWeight="bold"
                    className="select-none"
                  >
                    {getNodeIconSymbol(node.type)}
                  </text>

                  <rect
                    x={node.x - 70}
                    y={node.y + (isRoot ? 46 : 28)}
                    width={140}
                    height={20}
                    rx={6}
                    className="fill-black/60 dark:fill-zinc-900/80 stroke-white/5 stroke-[0.5px]"
                  />
                  <text
                    x={node.x}
                    y={node.y + (isRoot ? 60 : 42)}
                    textAnchor="middle"
                    fill="currentColor"
                    fontSize={10}
                    className="text-zinc-200 font-medium select-none"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        <div className="px-4 py-3 bg-zinc-900/40 border-t border-white/5 flex justify-between items-center text-xs text-zinc-400">
          <span>💡 Double click or drag inside canvas to move nodes (simulated twin)</span>
          <span>Click a node to view dynamic relationships</span>
        </div>
      </GlassCard>

      {/* Detail Sidebar */}
      <div className="lg:col-span-1 flex flex-col space-y-4">
        <AnimatePresence mode="wait">
          {selectedNode ? (
            <motion.div
              key={selectedNode.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col space-y-4"
            >
              <GlassCard className="p-5 flex-1 flex flex-col justify-between" intensity="high">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-gradient-to-r ${getTypeColor(selectedNode.type)} text-white`}>
                      {selectedNode.type}
                    </span>
                    {selectedNode.status === 'critical' && (
                      <span className="flex items-center text-red-500 text-xs font-medium gap-1 bg-red-500/10 px-2 py-0.5 rounded-lg border border-red-500/20">
                        <AlertTriangle size={12} />
                        Critical Alert
                      </span>
                    )}
                    {selectedNode.status === 'warning' && (
                      <span className="flex items-center text-amber-500 text-xs font-medium gap-1 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                        <AlertTriangle size={12} />
                        Risk Trigger
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">{selectedNode.label}</h3>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-4">{selectedNode.value}</div>
                  
                  <hr className="border-zinc-200 dark:border-zinc-800 my-3" />
                  
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                    {selectedNode.details}
                  </p>

                  <h4 className="text-xs font-semibold tracking-wider text-zinc-500 uppercase mb-2">Simulated Seasonality (12 Mo)</h4>
                  <div className="h-[120px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={getSeasonalityData(selectedNode)} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="twinAreaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={selectedNode.status === 'critical' ? '#ef4444' : '#10b981'} stopOpacity={0.4}/>
                            <stop offset="95%" stopColor={selectedNode.status === 'critical' ? '#ef4444' : '#10b981'} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" stroke="#71717a" fontSize={9} tickLine={false} axisLine={false} />
                        <YAxis stroke="#71717a" fontSize={9} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                          labelStyle={{ color: '#a1a1aa', fontSize: '10px' }}
                          itemStyle={{ color: selectedNode.status === 'critical' ? '#ef4444' : '#10b981', fontSize: '10px' }}
                        />
                        <Area type="monotone" dataKey="value" stroke={selectedNode.status === 'critical' ? '#ef4444' : '#10b981'} strokeWidth={1.5} fillOpacity={1} fill="url(#twinAreaGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Upstream Dependencies</div>
                  <div className="space-y-2">
                    {connections
                      .filter(c => c.to === selectedNode.id)
                      .map((c, i) => {
                        const source = nodes.find(n => n.id === c.from);
                        return source ? (
                          <div key={i} className="flex items-center text-xs text-zinc-400 justify-between bg-zinc-900/10 dark:bg-zinc-900/40 p-2 rounded-lg border border-white/5">
                            <span>{source.label}</span>
                            <ArrowRight size={12} className="text-zinc-500" />
                          </div>
                        ) : null;
                      })}
                    {connections.filter(c => c.to === selectedNode.id).length === 0 && (
                      <span className="text-xs text-zinc-500 italic block">None (Independent Root Node)</span>
                    )}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ) : (
            <GlassCard className="p-5 flex-1 flex flex-col justify-center items-center text-center" intensity="normal">
              <HelpCircle size={32} className="text-zinc-500 mb-2 animate-pulse" />
              <p className="text-xs text-zinc-500">Select any node on the left twin diagram to investigate deep business metrics.</p>
            </GlassCard>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
export default DigitalTwin;
