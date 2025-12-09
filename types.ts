export type Role = 'home' | 'doctor' | 'patient';

export interface VitalData {
  timestamp: string;
  heartRate: number; // bpm
  spo2: number; // %
  bpSystolic: number; // mmHg
  bpDiastolic: number; // mmHg
}

// Doctor Agent Types
export interface AgentGuardResult {
  raw: string;
  masked: string;
  anonymized: string;
}

export interface ResearchPaper {
  title: string;
  uri: string;
}

export interface AgentResearcherResult {
  summary: string;
  papers: ResearchPaper[];
}

export interface AgentDoctorResult {
  diagnosis: string;
  treatmentPlan: string[];
  xaiRationale: {
    textEvidence: string[]; // Quotes from the note
    visualEvidence: string; // Description of image findings
  };
}

export interface AgentState<T> {
  status: 'idle' | 'working' | 'complete' | 'error';
  data: T | null;
  logs: string[];
}

// Patient & User Types
export interface PatientAnalysisResult {
  explanation: string; // Simple explanation of vitals
  advice: string; // Empathetic advice based on symptoms
  alertLevel: 'normal' | 'attention' | 'critical';
}

export interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
  timestamp: string;
  imageUrl?: string;
}

export interface AnalysisResponse {
  anonymizedNote: string;
  diagnosis: string;
  recommendedNextSteps: string[];
  privacyScore: number;
  privacyReasoning: string;
}