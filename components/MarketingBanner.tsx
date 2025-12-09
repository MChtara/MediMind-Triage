import React from 'react';
import { GuardPanel, ResearcherPanel, DoctorPanel } from './AgentPanels';
import { AgentState } from '../types';

const MarketingBanner: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  // Mock Data for visual fidelity in the "screenshot" area
  const mockGuard: AgentState<any> = { 
    status: 'complete', 
    logs: ['PII Detected: Name', 'Redacting sensitive data...', 'Encryption key generated'], 
    data: { masked: 'Patient ~~John Doe~~', anonymized: 'Patient [REDACTED]' } 
  };
  
  const mockResearcher: AgentState<any> = { 
    status: 'working', 
    logs: ['Querying NIH Database...', 'Analyzing 14,000 records...', 'Cross-referencing symptoms'], 
    data: null 
  };
  
  const mockDoctor: AgentState<any> = { 
    status: 'idle', 
    logs: ['Awaiting Research Context...', 'Vital Signs Stable'], 
    data: null 
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md" onClick={onClose}>
      
      {/* The Banner Container - 560x280px */}
      <div 
        className="relative w-[560px] h-[280px] bg-[#0f172a] flex overflow-hidden shadow-[0_0_100px_rgba(6,182,212,0.2)] cursor-default select-none border border-slate-800" 
        onClick={e => e.stopPropagation()}
      >
        
        {/* Left Side: Typography */}
        <div className="w-[50%] h-full flex flex-col justify-center pl-10 z-20 relative">
            <h1 className="text-5xl font-bold text-white leading-[0.9] tracking-tighter drop-shadow-xl font-sans">
                MediMind
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Triage</span>
            </h1>
            
            <div className="mt-6 w-16 h-1.5 bg-cyan-500 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.8)]"></div>
            
            <p className="mt-6 text-[10px] text-slate-400 font-mono tracking-[0.2em] uppercase opacity-80">
                Next-Gen Medical AI
            </p>
            
            {/* Subtle background glow behind text */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-32 h-32 bg-cyan-500/10 blur-[50px] -z-10"></div>
        </div>

        {/* Right Side: The "Screenshot" Simulation */}
        {/* We use a container with overflow hidden and a drop shadow to simulate the "Crop & Paste" effect */}
        <div className="absolute right-[-20px] top-[20px] bottom-[20px] w-[300px] bg-slate-900/50 rounded-l-2xl border-l border-t border-b border-white/10 shadow-[-20px_0_60px_rgba(0,0,0,0.8)] backdrop-blur-sm overflow-hidden flex flex-col transform -skew-x-2">
            
            {/* Simulated Window Header */}
            <div className="h-8 bg-slate-900 border-b border-white/5 flex items-center px-4 gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <div className="ml-4 h-1.5 w-20 bg-white/10 rounded-full"></div>
            </div>

            {/* Simulated Interface Grid (Agents) */}
            <div className="flex-grow bg-slate-900/80 p-3 grid grid-rows-3 gap-3 overflow-hidden opacity-90">
                
                {/* We scale the actual components down to create a high-fidelity "thumbnail" look */}
                <div className="relative h-full w-full overflow-hidden rounded-lg border border-white/5 bg-black/40">
                    <div className="origin-top-left transform scale-[0.6] w-[166%] h-[166%]">
                         <GuardPanel state={mockGuard} />
                    </div>
                </div>

                <div className="relative h-full w-full overflow-hidden rounded-lg border border-white/5 bg-black/40">
                    <div className="origin-top-left transform scale-[0.6] w-[166%] h-[166%]">
                         <ResearcherPanel state={mockResearcher} />
                    </div>
                </div>

                <div className="relative h-full w-full overflow-hidden rounded-lg border border-white/5 bg-black/40">
                    <div className="origin-top-left transform scale-[0.6] w-[166%] h-[166%]">
                         <DoctorPanel state={mockDoctor} />
                    </div>
                </div>
            </div>

            {/* Glass Highlight Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>
        </div>
      </div>
      
      <div className="absolute bottom-10 text-white/40 text-xs font-mono">
        (Click background to close)
      </div>
    </div>
  );
};

export default MarketingBanner;