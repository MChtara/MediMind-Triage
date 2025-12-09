import React, { useState } from "react";
import DoctorDashboard from "./components/DoctorDashboard";
import PatientDashboard from "./components/PatientDashboard";
import MarketingBanner from "./components/MarketingBanner";
import { Role } from "./types";

const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<Role>('home');
  const [showBanner, setShowBanner] = useState(false);

  if (showBanner) {
      return <MarketingBanner onClose={() => setShowBanner(false)} />;
  }

  const renderDashboard = () => {
    switch (currentRole) {
      case 'doctor':
        return <DoctorDashboard onBack={() => setCurrentRole('home')} />;
      case 'patient':
        return <PatientDashboard onBack={() => setCurrentRole('home')} />;
      default:
        return (
          <div className="min-h-screen flex flex-col items-center justify-center p-6 font-sans relative">
             
             {/* Header */}
             <div className="text-center mb-20 space-y-4 animate-fade-up">
                <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 tracking-tighter drop-shadow-2xl text-glow">
                   MediMind
                </h1>
                <p className="text-lg md:text-xl text-cyan-200/70 font-light tracking-[0.2em] uppercase">
                   Autonomous Medical Neural Network
                </p>
             </div>
             
             {/* Cards Container */}
             <div className="flex flex-col md:flex-row gap-10 w-full max-w-5xl px-4 animate-fade-up" style={{animationDelay: '0.2s'}}>
                
                {/* Patient Portal Card */}
                <button 
                 onClick={() => setCurrentRole('patient')}
                 className="flex-1 group relative h-96 glass-sci-fi transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(6,182,212,0.2)]"
                >
                   <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                   
                   <div className="relative h-full flex flex-col items-center justify-center p-8 z-10">
                      <div className="w-28 h-28 mb-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all duration-500">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-cyan-400 group-hover:animate-pulse transition-all duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                         </svg>
                      </div>
                      <h2 className="text-3xl font-bold text-white mb-2 tracking-tight group-hover:text-cyan-400 transition-colors text-glow">I am a Patient</h2>
                      <div className="h-0.5 w-12 bg-cyan-500/30 my-4 group-hover:w-24 transition-all duration-500"></div>
                      <p className="text-slate-400 text-center text-sm font-light leading-relaxed group-hover:text-cyan-100/80 transition-colors">
                         Access AI-assisted triage, symptom analysis, and live vital monitoring.
                      </p>
                   </div>
                </button>

                {/* Doctor Portal Card */}
                <button 
                 onClick={() => setCurrentRole('doctor')}
                 className="flex-1 group relative h-96 glass-sci-fi transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(59,130,246,0.3)]"
                >
                   <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>

                   <div className="relative h-full flex flex-col items-center justify-center p-8 z-10">
                      <div className="w-28 h-28 mb-8 rounded-full bg-blue-600/10 border border-blue-500/30 flex items-center justify-center group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all duration-500">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-blue-400 group-hover:animate-pulse transition-all duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                         </svg>
                      </div>
                      <h2 className="text-3xl font-bold text-white mb-2 tracking-tight group-hover:text-blue-400 transition-colors text-glow">I am a Doctor</h2>
                      <div className="h-0.5 w-12 bg-blue-500/30 my-4 group-hover:w-24 transition-all duration-500"></div>
                      <p className="text-slate-400 text-center text-sm font-light leading-relaxed group-hover:text-blue-100/80 transition-colors">
                         Enter the Command Center for multi-agent diagnostics and research synthesis.
                      </p>
                   </div>
                </button>

             </div>
             
             <div className="mt-16 text-slate-500 text-xs font-mono tracking-widest opacity-50 animate-fade-up" style={{animationDelay: '0.4s'}}>
                SYSTEM VERSION 3.0 // SECURE CONNECTION ESTABLISHED
             </div>

             {/* Dev Tool: Banner Toggle */}
             <button 
                onClick={() => setShowBanner(true)}
                className="fixed bottom-4 right-4 bg-slate-800/50 hover:bg-slate-700/80 text-white/30 hover:text-white px-3 py-1 rounded-full text-[10px] font-mono border border-white/5 transition-all"
             >
                📷 Banner
             </button>
          </div>
        );
    }
  };

  return renderDashboard();
};

export default App;