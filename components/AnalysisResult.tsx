import React from "react";
import { AnalysisResponse } from "../types";

interface AnalysisResultProps {
  result: AnalysisResponse | null;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ result }) => {
  if (!result) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 shadow-lg h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-lg">Waiting for analysis...</p>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score <= 3) return "bg-green-500";
    if (score <= 7) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 shadow-lg h-full overflow-y-auto">
      <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Analysis Report
      </h2>

      {/* Task 1: Anonymization */}
      <div className="mb-6 border-b border-slate-700 pb-4">
        <h3 className="text-cyan-400 text-sm font-bold uppercase tracking-wider mb-2">
          Anonymized Record
        </h3>
        <p className="text-slate-300 leading-relaxed font-mono text-sm bg-slate-900 p-3 rounded border border-slate-700">
          {result.anonymizedNote}
        </p>
      </div>

      {/* Task 2: Diagnosis & Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-cyan-400 text-sm font-bold uppercase tracking-wider mb-2">
            Potential Diagnosis
          </h3>
          <p className="text-slate-100 font-semibold text-lg">
            {result.diagnosis}
          </p>
        </div>
        <div>
           <h3 className="text-cyan-400 text-sm font-bold uppercase tracking-wider mb-2">
            Recommended Next Steps
          </h3>
          <ul className="list-disc list-inside space-y-1">
            {result.recommendedNextSteps.map((step, idx) => (
              <li key={idx} className="text-slate-300 text-sm">{step}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Task 3: Privacy Check */}
      <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-purple-400 text-sm font-bold uppercase tracking-wider">
            Privacy Sensitivity Score
          </h3>
          <span className="text-white font-bold text-xl">{result.privacyScore}/10</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2.5 mb-2">
          <div
            className={`h-2.5 rounded-full ${getScoreColor(result.privacyScore)}`}
            style={{ width: `${result.privacyScore * 10}%` }}
          ></div>
        </div>
        <p className="text-slate-400 text-xs italic">
          Reasoning: {result.privacyReasoning}
        </p>
      </div>
    </div>
  );
};

export default AnalysisResult;
