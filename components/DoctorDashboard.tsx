import React, { useState, useEffect, useCallback, useRef } from "react";
import VitalsMonitor from "./VitalsMonitor";
import { GuardPanel, ResearcherPanel, DoctorPanel } from "./AgentPanels";
import { VitalData, AgentState, AgentGuardResult, AgentResearcherResult, AgentDoctorResult } from "../types";
import { runAgentGuard, runAgentResearcher, runAgentDoctor } from "../services/geminiService";

interface DoctorDashboardProps {
  onBack: () => void;
}

const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ onBack }) => {
  const [vitalsHistory, setVitalsHistory] = useState<VitalData[]>([]);
  const [currentVital, setCurrentVital] = useState<VitalData>({
    timestamp: new Date().toLocaleTimeString(),
    heartRate: 72,
    spo2: 98,
    bpSystolic: 120,
    bpDiastolic: 80,
  });

  const generateVital = (): VitalData => {
    const now = new Date();
    return {
      timestamp: now.toLocaleTimeString(),
      heartRate: Math.floor(Math.random() * (100 - 60 + 1)) + 60,
      spo2: Math.floor(Math.random() * (100 - 92 + 1)) + 92,
      bpSystolic: Math.floor(Math.random() * (140 - 110 + 1)) + 110,
      bpDiastolic: Math.floor(Math.random() * (90 - 70 + 1)) + 70,
    };
  };

  useEffect(() => {
    const initialData: VitalData[] = Array.from({ length: 20 }, generateVital);
    setVitalsHistory(initialData);
    const intervalId = setInterval(() => {
      setVitalsHistory((prev) => {
        const newDataPoint = generateVital();
        setCurrentVital(newDataPoint);
        const newHistory = [...prev, newDataPoint];
        if (newHistory.length > 20) newHistory.shift();
        return newHistory;
      });
    }, 1000); 
    return () => clearInterval(intervalId);
  }, []);

  const [note, setNote] = useState<string>("Patient 45-year-old John Doe presents with acute chest tightness and shortness of breath starting 2 hours ago. History of hypertension.");
  const [scanFile, setScanFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [guardState, setGuardState] = useState<AgentState<AgentGuardResult>>({ status: 'idle', data: null, logs: [] });
  const [researcherState, setResearcherState] = useState<AgentState<AgentResearcherResult>>({ status: 'idle', data: null, logs: [] });
  const [doctorState, setDoctorState] = useState<AgentState<AgentDoctorResult>>({ status: 'idle', data: null, logs: [] });

  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    if (!SpeechRecognition) {
      alert("Voice dictation is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                const transcript = event.results[i][0].transcript;
                if (transcript.toLowerCase().includes("stop recording")) {
                    recognition.stop();
                    setIsRecording(false);
                    return;
                }
                setNote(prev => prev + (prev.length > 0 && !prev.endsWith(' ') ? ' ' : '') + transcript);
            }
        }
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setScanFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const addLog = (setter: React.Dispatch<React.SetStateAction<AgentState<any>>>, message: string) => {
    setter(prev => ({ ...prev, logs: [...prev.logs, message] }));
  };

  const startTriage = useCallback(async () => {
    if (!note) return;
    setGuardState({ status: 'working', data: null, logs: ["Scanning note for PII patterns...", "Initializing privacy protocols..."] });
    setResearcherState({ status: 'idle', data: null, logs: [] });
    setDoctorState({ status: 'idle', data: null, logs: [] });

    try {
      await new Promise(r => setTimeout(r, 600)); 
      const guardResult = await runAgentGuard(note);
      addLog(setGuardState, "PII Redacted successfully.");
      setGuardState(prev => ({ ...prev, status: 'complete', data: guardResult }));

      setResearcherState({ status: 'working', data: null, logs: ["Receiving anonymized context...", "Accessing medical knowledge base..."] });
      await new Promise(r => setTimeout(r, 1000)); 
      
      addLog(setResearcherState, "Querying PubMed & NIH databases...");
      const researcherResult = await runAgentResearcher(guardResult.anonymized, currentVital);
      addLog(setResearcherState, `Retrieved ${researcherResult.papers.length} citations.`);
      setResearcherState(prev => ({ ...prev, status: 'complete', data: researcherResult }));

      setDoctorState({ status: 'working', data: null, logs: ["Synthesizing clinical data...", "Evaluating vital trends...", scanFile ? "Analyzing multimodal visual data..." : "Checking for visual inputs..."] });
      await new Promise(r => setTimeout(r, 1200));
      
      addLog(setDoctorState, "Formulating diagnosis and XAI rationale...");
      const doctorResult = await runAgentDoctor(guardResult.anonymized, currentVital, researcherResult.summary, scanFile);
      setDoctorState(prev => ({ ...prev, status: 'complete', data: doctorResult }));

    } catch (error) {
      console.error(error);
      addLog(setGuardState, "System Error: Orchestration failed.");
    }
  }, [note, currentVital, scanFile]);

  const isProcessing = guardState.status === 'working' || researcherState.status === 'working' || doctorState.status === 'working';

  return (
    <div className="min-h-screen p-4 md:p-6 flex flex-col font-sans gap-6 max-w-[1920px] mx-auto animate-fade-up">
      
      {/* Top Bar */}
      <header className="glass-sci-fi p-4 flex justify-between items-center">
           <div className="flex items-center gap-6">
               <button onClick={onBack} className="text-cyan-400 hover:text-white transition-colors group flex items-center gap-2">
                 <div className="w-8 h-8 rounded-lg border border-cyan-500/30 flex items-center justify-center bg-cyan-950/20 group-hover:bg-cyan-500/20">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                     </svg>
                 </div>
                 <span className="text-xs font-mono font-bold tracking-widest uppercase">Return</span>
               </button>
               <div className="h-8 w-px bg-white/10"></div>
               <div>
                  <h1 className="text-xl font-bold tracking-tight text-white text-glow">
                    Command<span className="text-cyan-400">Center</span>
                  </h1>
               </div>
           </div>

           <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 px-4 py-2 bg-black/30 rounded-full border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400 tracking-widest">LIVE NET</span>
              </div>
              <div className="text-right hidden md:block border-l border-white/10 pl-6">
                  <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mb-1">Local Time</div>
                  <div className="text-lg text-slate-200 font-mono font-bold leading-none">{currentVital.timestamp}</div>
              </div>
           </div>
      </header>

      {/* Vitals Ribbon */}
      <section className="animate-fade-up" style={{animationDelay: '0.1s'}}>
          <VitalsMonitor data={vitalsHistory} current={currentVital} />
      </section>

      {/* Main Command Grid */}
      <main className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-[600px] animate-fade-up" style={{animationDelay: '0.2s'}}>
        
        {/* Input & Guard Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-sci-fi p-1 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/50"></div>
                <div className="p-5 bg-black/20 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-cyan-200 font-bold text-xs uppercase tracking-[0.2em]">00. Input Stream</h2>
                        <button 
                            onClick={startTriage}
                            disabled={isProcessing || !note}
                            className={`px-4 py-2 rounded font-bold text-[10px] uppercase tracking-widest btn-neon ${isProcessing ? "opacity-50 cursor-not-allowed bg-slate-800" : "bg-cyan-600/20 border border-cyan-500 text-cyan-400"}`}
                        >
                            {isProcessing ? "PROCESSING..." : "INITIATE SEQUENCE"}
                        </button>
                    </div>
                    
                    <div className="relative mb-4 flex-grow">
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            disabled={isProcessing}
                            className="w-full h-40 bg-black/40 border border-white/10 rounded-lg p-4 text-cyan-100/90 text-sm focus:outline-none focus:border-cyan-500/50 transition-all resize-none font-mono leading-relaxed"
                            placeholder="Awaiting clinical data input..."
                        />
                        <button onClick={toggleRecording} className={`absolute bottom-3 right-3 p-2 rounded-lg border transition-all ${isRecording ? "bg-red-500/20 border-red-500 text-red-400 animate-pulse" : "bg-white/5 border-white/10 text-slate-400 hover:text-white"}`}>
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                 {isRecording ? <rect x="6" y="6" width="8" height="8" rx="1" /> : <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />}
                             </svg>
                        </button>
                    </div>

                    <div className="relative border border-dashed border-white/20 rounded-lg h-24 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all cursor-pointer flex items-center justify-center overflow-hidden">
                        <input type="file" accept="image/*" onChange={handleFileChange} disabled={isProcessing} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        {previewUrl ? (
                           <img src={previewUrl} alt="Scan" className="w-full h-full object-cover opacity-60" />
                        ) : (
                           <div className="flex items-center gap-3 text-slate-500">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              <span className="text-xs font-mono uppercase">Upload Scan</span>
                           </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-grow">
               <GuardPanel state={guardState} />
            </div>
        </div>

        {/* Researcher Column */}
        <div className="lg:col-span-4 h-full">
            <ResearcherPanel state={researcherState} />
        </div>

        {/* Doctor Column */}
        <div className="lg:col-span-4 h-full">
            <DoctorPanel state={doctorState} />
        </div>

      </main>
    </div>
  );
};

export default DoctorDashboard;