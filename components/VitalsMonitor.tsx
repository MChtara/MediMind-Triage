import React from "react";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { VitalData } from "../types";

interface VitalsMonitorProps {
  data: VitalData[];
  current: VitalData;
}

const MiniChart: React.FC<{
  color: string;
  dataKey: string;
  data: VitalData[];
  domain: [number, number];
}> = ({ color, dataKey, data, domain }) => (
  <div className="h-12 w-32 opacity-80">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <YAxis domain={domain} hide />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const VitalCard: React.FC<{
  label: string;
  value: string;
  unit: string;
  colorClass: string;
  hexColor: string;
  dataKey: string;
  data: VitalData[];
  domain: [number, number];
  icon?: React.ReactNode;
  showEcg?: boolean;
}> = ({ label, value, unit, colorClass, hexColor, dataKey, data, domain, icon, showEcg }) => (
  <div className="glass-sci-fi p-5 flex items-center justify-between group hover:border-white/30 transition-colors relative overflow-hidden">
    <div className={`absolute top-0 left-0 w-1 h-full`} style={{backgroundColor: hexColor, opacity: 0.5}}></div>
    
    <div className="flex flex-col z-10">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 group-hover:text-white transition-colors">{label}</span>
        {icon}
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-4xl font-mono font-bold ${colorClass} drop-shadow-md`}>{value}</span>
        <span className="text-slate-500 text-xs font-bold font-mono">{unit}</span>
      </div>
    </div>
    
    <div className="flex flex-col items-end gap-2 z-10">
       {showEcg && (
        <div className="w-32 h-10 overflow-hidden relative opacity-80">
          <svg viewBox="0 0 500 100" className="w-full h-full ecg-svg">
            <path d="M0,50 L20,50 L30,20 L40,80 L50,50 L100,50 L120,50 L130,20 L140,80 L150,50 L200,50 L220,50 L230,20 L240,80 L250,50 L300,50 L320,50 L330,20 L340,80 L350,50 L400,50 L420,50 L430,20 L440,80 L450,50 L500,50" className="ecg-line" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
       )}
       <MiniChart color={hexColor} dataKey={dataKey} data={data} domain={domain} />
    </div>
  </div>
);

const VitalsMonitor: React.FC<VitalsMonitorProps> = ({ data, current }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
      <VitalCard
        label="Heart Rate"
        value={current.heartRate.toString()}
        unit="BPM"
        colorClass="text-red-400"
        hexColor="#f87171"
        dataKey="heartRate"
        data={data}
        domain={[50, 130]}
        showEcg={true}
        icon={<div className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span></div>}
      />
      <VitalCard
        label="Blood Pressure"
        value={`${current.bpSystolic}/${current.bpDiastolic}`}
        unit="mmHg"
        colorClass="text-cyan-400"
        hexColor="#22d3ee"
        dataKey="bpSystolic"
        data={data}
        domain={[90, 180]}
      />
      <VitalCard
        label="SpO2 Level"
        value={current.spo2.toString()}
        unit="%"
        colorClass="text-blue-400"
        hexColor="#60a5fa"
        dataKey="spo2"
        data={data}
        domain={[80, 100]}
      />
    </div>
  );
};

export default VitalsMonitor;