import React from "react";

interface InputSectionProps {
  note: string;
  setNote: (n: string) => void;
  file: File | null;
  setFile: (f: File | null) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({
  note,
  setNote,
  file,
  setFile,
  onAnalyze,
  isLoading,
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 shadow-lg h-full flex flex-col">
      <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Doctor's Input
      </h2>

      <div className="mb-4 flex-grow">
        <label className="block text-slate-400 text-sm font-bold mb-2">
          Clinical Observations
        </label>
        <textarea
          className="w-full h-40 bg-slate-900 border border-slate-600 rounded p-3 text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
          placeholder="Enter patient symptoms, history, and observations here (e.g., Patient John Doe, DOB 01/01/1980...)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        ></textarea>
      </div>

      <div className="mb-6">
        <label className="block text-slate-400 text-sm font-bold mb-2">
          Multimodal Scan (X-Ray / MRI)
        </label>
        <div className="relative border-2 border-dashed border-slate-600 rounded-lg p-4 hover:bg-slate-700/50 transition-colors text-center cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center justify-center pointer-events-none">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-slate-300 text-sm">
              {file ? file.name : "Click to upload scan image"}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={onAnalyze}
        disabled={isLoading || !note}
        className={`w-full py-3 px-4 rounded font-bold text-white shadow-lg transition-all flex justify-center items-center gap-2
          ${isLoading || !note 
            ? "bg-slate-600 cursor-not-allowed" 
            : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-95"
          }`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            Analyze with Gemini
          </>
        )}
      </button>
    </div>
  );
};

export default InputSection;
