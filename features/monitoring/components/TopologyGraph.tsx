import React, { useMemo, useState } from 'react';
import { NodeStatus, PacketEvent } from '../../../types';
import { Server, Database, Cpu } from 'lucide-react';
import { useWebSocket } from '../../../hooks/useWebSocket';

interface TopologyGraphProps {
  nodes: NodeStatus[];
}

const TopologyGraph: React.FC<TopologyGraphProps> = ({ nodes }) => {
  const [inflightPackets, setInflightPackets] = useState<PacketEvent[]>([]);
  const [nodeFlash, setNodeFlash] = useState<{[id: string]: boolean}>({});

  useWebSocket<PacketEvent>('/ws/monitoring/packets', (packet) => {
      setInflightPackets(prev => [...prev, packet]);
      setTimeout(() => {
          setInflightPackets(current => current.filter(p => p.id !== packet.id));
          setNodeFlash(prev => ({ ...prev, [packet.to]: true }));
          setTimeout(() => setNodeFlash(prev => ({ ...prev, [packet.to]: false })), 300);
      }, 1000);
  });

  const dataNodes = nodes.filter(n => n.type === 'data');
  const viewBoxWidth = 1200;
  const viewBoxHeight = 600;
  const controlPos = { x: 150, y: viewBoxHeight / 2 - 50 };
  const controlAnchor = { x: controlPos.x + 50, y: controlPos.y };
  const metaPos = { x: 900, y: 120 };
  const metaAnchor = { x: metaPos.x - 50, y: metaPos.y };
  const dataArea = { xStart: 300, xEnd: viewBoxWidth - 50, yBase: viewBoxHeight - 150 };

  const dataNodeLayout = useMemo(() => {
      const count = dataNodes.length;
      if (count === 0) return { positions: [], scale: 1 };
      const availableWidth = dataArea.xEnd - dataArea.xStart;
      const baseNodeWidth = 120; 
      const minScale = 0.6;
      const maxScale = 1.0;
      let scale = Math.min(maxScale, availableWidth / (count * baseNodeWidth));
      scale = Math.max(minScale, scale);
      const effectiveNodeWidth = baseNodeWidth * scale;
      const totalUsedWidth = count * effectiveNodeWidth;
      const startOffset = dataArea.xStart + (availableWidth - totalUsedWidth) / 2 + (effectiveNodeWidth / 2);

      const positions = dataNodes.map((node, i) => ({
          ...node,
          x: startOffset + i * effectiveNodeWidth,
          y: dataArea.yBase,
          scale: scale,
          anchor: { x: startOffset + i * effectiveNodeWidth, y: dataArea.yBase - (50 * scale) }
      }));
      return { positions, scale };
  }, [dataNodes, dataArea.xStart, dataArea.xEnd, dataArea.yBase]);

  const getPathToNode = (targetType: 'meta' | 'data', ex: number, ey: number) => {
      const sx = controlAnchor.x;
      const sy = controlAnchor.y;
      if (targetType === 'meta') {
          const midX = sx + (ex - sx) * 0.5;
          return `M ${sx},${sy} L ${midX},${sy} L ${midX},${ey} L ${ex},${ey}`;
      } else {
          return `M ${sx},${sy} L ${ex},${sy} L ${ex},${ey}`;
      }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-900 rounded-xl border border-slate-800 shadow-inner overflow-hidden relative">
       <div className="absolute top-6 left-6 pointer-events-none z-10">
            <h3 className="text-slate-300 font-bold text-lg flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>Network Topology
            </h3>
            <p className="text-slate-500 text-xs font-mono mt-1">Live IBC Packet Visualization</p>
       </div>
       <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} className="w-full h-full select-none" preserveAspectRatio="xMidYMid meet">
          <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          <path d={getPathToNode('meta', metaAnchor.x, metaAnchor.y)} fill="none" stroke="#818cf8" strokeWidth="3" className="opacity-60"/>
          {dataNodeLayout.positions.map((dn) => (<path key={`link-${dn.id}`} d={getPathToNode('data', dn.anchor.x, dn.anchor.y)} fill="none" stroke="#38bdf8" strokeWidth="3" className="opacity-50 hover:opacity-100 transition-opacity duration-300" strokeLinecap="round" strokeLinejoin="round"/>))}
          {inflightPackets.map(pkt => {
              const targetNode = dataNodeLayout.positions.find(n => n.id === pkt.to);
              let path = "";
              if (pkt.to === 'meta-chain' || pkt.from === 'meta-chain') path = getPathToNode('meta', metaAnchor.x, metaAnchor.y);
              else if (targetNode) path = getPathToNode('data', targetNode.anchor.x, targetNode.anchor.y);
              if (!path) return null;
              return (<circle key={pkt.id} r="6" fill="#e0f2fe" filter="url(#glow)"><animateMotion dur="0.8s" repeatCount="1" path={path} fill="freeze" keyPoints="0;1" keyTimes="0;1" calcMode="linear" /></circle>);
          })}
          <g transform={`translate(${controlPos.x}, ${controlPos.y})`}>
               <path d="M 35,0 L 50,0" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
               <circle cx="50" cy="0" r="3" fill="#3b82f6" />
               <rect x="-35" y="-35" width="70" height="70" rx="14" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" className="shadow-[0_0_30px_rgba(59,130,246,0.5)]" />
               <Server className="text-blue-400 w-10 h-10" x="-20" y="-20" />
               <g transform="translate(0, 50)"><rect x="-50" y="0" width="100" height="18" rx="4" fill="#1e3a8a" fillOpacity="0.8" /><text y="12" textAnchor="middle" className="fill-blue-100 text-[10px] font-bold font-mono tracking-wider uppercase">Orchestrator</text></g>
          </g>
          <g transform={`translate(${metaPos.x}, ${metaPos.y})`}>
               <path d="M -35,0 L -50,0" stroke="#818cf8" strokeWidth="3" strokeLinecap="round" />
               <circle cx="-50" cy="0" r="3" fill="#818cf8" />
               <rect x="-35" y="-35" width="70" height="70" rx="14" fill="#312e81" stroke="#818cf8" strokeWidth="2" />
               <Cpu className="text-indigo-300 w-10 h-10" x="-20" y="-20" />
               <g transform="translate(0, 50)"><rect x="-40" y="0" width="80" height="18" rx="4" fill="#312e81" fillOpacity="0.8" /><text y="12" textAnchor="middle" className="fill-indigo-100 text-[10px] font-bold font-mono tracking-wider uppercase">Registry</text></g>
          </g>
          {dataNodeLayout.positions.map((node) => (
              <g key={node.id} transform={`translate(${node.x}, ${node.y}) scale(${node.scale})`} className="transition-all duration-500 ease-out">
                  <path d="M 0,-35 L 0,-50" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
                  <circle r="3" cx="0" cy="-50" fill="#38bdf8" />
                  <rect x="-35" y="-35" width="70" height="70" rx="14" fill={node.status === 'active' ? '#0f172a' : '#450a0a'} stroke={nodeFlash[node.id] ? '#ffffff' : node.status === 'active' ? '#10b981' : '#ef4444'} strokeWidth={nodeFlash[node.id] ? 4 : 2} className="transition-colors duration-200 shadow-xl" filter={nodeFlash[node.id] ? "url(#glow)" : ""} />
                  <Database className={`w-10 h-10 ${node.status === 'active' ? 'text-emerald-400' : 'text-red-400'}`} x="-20" y="-20" />
                  <g transform="translate(0, 50)"><rect x="-45" y="0" width="90" height="18" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" /><text y="12" textAnchor="middle" className="fill-slate-300 text-[11px] font-mono font-bold">{node.id}</text></g>
                  <g transform="translate(0, 74)"><circle r="3" cx="-18" cy="-1" fill={node.status === 'active' ? '#10b981' : '#ef4444'} className={node.status === 'active' ? 'animate-pulse' : ''} /><text x="-10" y="3" className="fill-slate-500 text-[10px] font-mono">Height: {node.height}</text></g>
              </g>
          ))}
       </svg>
    </div>
  );
};

export default TopologyGraph;