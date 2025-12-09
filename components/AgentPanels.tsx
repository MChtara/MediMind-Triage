import React, { useState } from "react";
import { AgentState, AgentGuardResult, AgentResearcherResult, AgentDoctorResult } from "../types";

const PanelContainer: React.FC<{
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  status: AgentState<any>['status'];
  logs: string[];
  children: React.ReactNode;
  color: string;
  stepNumber: string;
}> = ({ title, subtitle, icon, status, logs, children, color, stepNumber }) => {
  
  const isWorking = status === 'working';
  const isComplete = status === 'complete';
  const borderColor = isWorking ? `border-${color}-500/50` : isComplete ? `border-${color}-500/30` : 'border-white/10';
  const shadow = isWorking ? `shadow-[0_0_30px_rgba(var(--color-${color}-500),0.2)]` : '';

  return (
    <div className={`glass-sci-fi h-full flex flex-col transition-all duration-500 relative overflow-hidden group ${borderColor} ${shadow}`}>
       {isWorking && <div className={`absolute top-0 left-0 w-full h-0.5 bg-${color}-500 animate-pulse`}></div>}
       {isWorking && <div className={`absolute bottom-0 left-0 w-full h-full bg-${color}-500/5 animate-pulse`}></div>}

      <div className="p-5 flex items-start justify-between border-b border-white/5 bg-black/20 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-${color}-500/10 text-${color}-400 border border-${color}-500/20`}>
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-${color}-500/20 text-${color}-400 border border-${color}-500/30`}>{stepNumber}</span>
                <h2 className="text-white font-bold text-sm tracking-widest uppercase text-glow">{title}</h2>
            </div>
            <p className="text-slate-500 text-[10px] mt-0.5 font-mono uppercase tracking-wider">{subtitle}</p>
          </div>
        </div>
        
        {isWorking && <div className={`text-${color}-400 text-[10px] font-mono animate-pulse font-bold`}>PROCESSING...</div>}
      </div>

      <div className="flex-grow p-5 overflow-y-auto font-light space-y-4 relative z-10">
        {logs.length > 0 && isWorking && (
             <div className="font-mono text-[10px] space-y-1 mb-4 opacity-80 p-3 bg-black/40 rounded border border-white/5">
                {logs.map((log, i) => (
                    <div key={i} className={`text-${color}-400/80 truncate`}>
                        <span className="opacity-50 mr-2">></span>
                        {log}
                    </div>
                ))}
                <div className={`h-2 w-1 bg-${color}-500 animate-pulse mt-1`}></div>
             </div>
        )}
        {children}
      </div>
    </div>
  );
};

export const GuardPanel: React.FC<{ state: AgentState<AgentGuardResult> }> = ({ state }) => (
  <PanelContainer 
    title="Privacy Guard" 
    subtitle="PII Detection"
    stepNumber="01"
    status={state.status}
    logs={state.logs}
    color="emerald"
    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
  >
    {state.data && (
      <div className="animate-fade-up">
        <div className="mb-6">
            <span className="text-slate-500 text-[9px] uppercase font-bold tracking-widest mb-2 block">Detected Entities</span>
            <div className="bg-black/30 p-3 rounded border border-white/10 text-slate-300 text-xs font-mono leading-relaxed">
              {state.data.masked.split(/(~~.*?~~)/g).map((part, i) => 
                part.startsWith("~~") && part.endsWith("~~") 
                ? <span key={i} className="text-red-400 bg-red-900/30 px-1 mx-0.5 border border-red-500/30 rounded">{part.slice(2, -2)}</span>
                : <span key={i} className="opacity-50">{part}</span>
              )}
            </div>
        </div>
        <div>
            <span className="text-emerald-400 text-[9px] uppercase font-bold tracking-widest mb-2 block">Sanitized Output</span>
            <div className="bg-emerald-900/10 p-3 rounded border border-emerald-500/20 text-emerald-100 text-xs leading-relaxed font-mono">
                {state.data.anonymized}
            </div>
        </div>
      </div>
    )}
  </PanelContainer>
);

export const ResearcherPanel: React.FC<{ state: AgentState<AgentResearcherResult> }> = ({ state }) => (
  <PanelContainer 
    title="Research Agent" 
    subtitle="Literature Synthesis"
    stepNumber="02"
    status={state.status}
    logs={state.logs}
    color="cyan"
    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
  >
    {state.data && (
      <div className="space-y-6 animate-fade-up">
        <div>
            <span className="text-cyan-400 text-[9px] uppercase font-bold tracking-widest mb-2 block">Executive Summary</span>
            <p className="text-slate-300 text-xs leading-relaxed border-l-2 border-cyan-500/50 pl-3">{state.data.summary}</p>
        </div>
        {state.data.papers.length > 0 && (
            <div>
                <span className="text-slate-500 text-[9px] uppercase font-bold tracking-widest mb-2 block">Citations</span>
                <ul className="space-y-2">
                    {state.data.papers.map((paper, idx) => (
                        <li key={idx}>
                            <a href={paper.uri} target="_blank" rel="noreferrer" className="block bg-black/20 p-3 rounded border border-white/5 hover:border-cyan-500/50 transition-colors group">
                                <span className="text-cyan-200 text-xs font-bold block truncate group-hover:text-cyan-400">{paper.title}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        )}
      </div>
    )}
  </PanelContainer>
);

export const DoctorPanel: React.FC<{ state: AgentState<AgentDoctorResult> }> = ({ state }) => {
  const [showXAI, setShowXAI] = useState(false);
  return (
    <PanelContainer 
        title="Diagnostic Core" 
        subtitle="Analysis & Decisions"
        stepNumber="03"
        status={state.status}
        logs={state.logs}
        color="purple"
        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>}
    >
        {state.data && (
            <div className="animate-fade-up flex flex-col h-full">
                <div className="mb-6 bg-gradient-to-r from-purple-900/30 to-transparent p-4 rounded-lg border-l-4 border-purple-500">
                    <h3 className="text-purple-300 text-[9px] uppercase font-bold tracking-widest mb-1">Final Diagnosis</h3>
                    <p className="text-white text-lg font-bold tracking-tight text-glow-purple">{state.data.diagnosis}</p>
                </div>
                
                <div className="mb-6">
                    <h3 className="text-slate-500 text-[9px] uppercase font-bold tracking-widest mb-3">Protocol</h3>
                    <ul className="space-y-3">
                        {state.data.treatmentPlan.map((step, idx) => (
                            <li key={idx} className="flex gap-3 text-slate-300 text-xs items-start">
                                <span className="flex-shrink-0 flex items-center justify-center w-4 h-4 rounded bg-purple-500/20 text-purple-300 text-[9px] font-bold border border-purple-500/30">{idx + 1}</span>
                                <span className="leading-relaxed">{step}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-auto pt-4 border-t border-white/10">
                    <button 
                        onClick={() => setShowXAI(!showXAI)}
                        className="w-full flex items-center justify-between group"
                    >
                        <span className="text-amber-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 group-hover:text-amber-400">
                            Explainable AI Logic
                        </span>
                        <div className={`transition-transform duration-300 ${showXAI ? 'rotate-180' : ''}`}>
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </button>

                    {showXAI && (
                        <div className="mt-4 bg-amber-950/20 border border-amber-500/20 rounded p-4 animate-fade-up">
                             <div className="mb-3">
                                <span className="text-amber-500/50 text-[9px] uppercase font-bold block mb-1">Textual Weights</span>
                                <div className="flex flex-wrap gap-2">
                                    {state.data.xaiRationale.textEvidence.map((ev, i) => (
                                        <span key={i} className="text-amber-200 text-[10px] bg-amber-500/10 px-2 py-1 rounded border border-amber-500/10">"{ev}"</span>
                                    ))}
                                </div>
                             </div>
                             {state.data.xaiRationale.visualEvidence && (
                                <div>
                                    <span className="text-amber-500/50 text-[9px] uppercase font-bold block mb-1">Visual Analysis</span>
                                    <p className="text-amber-100/80 text-[10px] leading-relaxed">{state.data.xaiRationale.visualEvidence}</p>
                                </div>
                             )}
                        </div>
                    )}
                </div>
            </div>
        )}
    </PanelContainer>
  );
};