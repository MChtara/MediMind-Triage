import { GoogleGenAI, Type } from "@google/genai";
import { VitalData, AgentGuardResult, AgentResearcherResult, AgentDoctorResult, PatientAnalysisResult, ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelName = "gemini-2.5-flash";

// Helper to convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

// --- DOCTOR ROLE: Agents A, B, C ---

export const runAgentGuard = async (rawNote: string): Promise<AgentGuardResult> => {
  const prompt = `
    Role: You are a Medical Data Privacy Officer.
    Task: Read the following medical note. Identify Personally Identifiable Information (PII) such as names, dates of birth, exact dates, and IDs.
    Output: Return the EXACT input text, but wrap all identified PII in double tildes, like this: ~~John Doe~~. Do not change any other words or punctuation. Do not output [REDACTED] yet.
    
    Note: "${rawNote}"
  `;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
  });

  const masked = response.text || "";
  const anonymized = masked.replace(/~~.*?~~/g, "[REDACTED]");

  return {
    raw: rawNote,
    masked: masked,
    anonymized: anonymized,
  };
};

export const runAgentResearcher = async (anonymizedNote: string, vitals: VitalData): Promise<AgentResearcherResult> => {
  const vitalsStr = `HR: ${vitals.heartRate}, BP: ${vitals.bpSystolic}/${vitals.bpDiastolic}, SpO2: ${vitals.spo2}%`;
  
  const researcherSystemPrompt = `
You are a Medical Research Agent.
You DO NOT hallucinate.
You must use the Google Search tool.
When you search, append "site:pubmed.ncbi.nlm.nih.gov" or "site:nih.gov" to the query.
Return a list of 3 relevant medical papers. 
Provide ONLY the Title and a brief summary for each.
ABSOLUTELY DO NOT include URL links or "URL:" labels in the text response.
`;

  const prompt = `
    ${researcherSystemPrompt}
    
    Context: Patient has the following vitals: ${vitalsStr}.
    Symptoms/Notes: "${anonymizedNote}"
  `;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const papers = chunks
    .map((chunk: any) => {
      if (chunk.web) {
        return { title: chunk.web.title, uri: chunk.web.uri };
      }
      return null;
    })
    .filter((p: any) => p !== null) as { title: string; uri: string }[];

  return {
    summary: response.text || "No specific research summary generated.",
    papers: papers,
  };
};

export const runAgentDoctor = async (
  anonymizedNote: string, 
  vitals: VitalData, 
  researchSummary: string,
  scanFile?: File | null
): Promise<AgentDoctorResult> => {
  const vitalsStr = `HR: ${vitals.heartRate}, BP: ${vitals.bpSystolic}/${vitals.bpDiastolic}, SpO2: ${vitals.spo2}%`;

  const systemPrompt = `
    Role: You are a Senior Attending Physician with Explainable AI (XAI) capabilities.
    
    Task: Synthesize all inputs to provide:
    1. A Final Diagnosis.
    2. A Treatment Plan.
    3. An XAI Rationale explaining *why* you made this decision.
    
    Input Context:
    - Vitals: ${vitalsStr}
    - Clinical Note: "${anonymizedNote}"
    - Research Findings: "${researchSummary}"
    
    For the XAI Rationale:
    - textEvidence: List specific phrases/symptoms from the note that were heavily weighted (e.g., "neck stiffness").
    - visualEvidence: If an image is provided, describe the specific visual findings supporting the diagnosis. If no image, state "No scan provided".
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      diagnosis: { type: Type.STRING },
      treatmentPlan: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING } 
      },
      xaiRationale: {
        type: Type.OBJECT,
        properties: {
          textEvidence: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          visualEvidence: { type: Type.STRING }
        },
        required: ["textEvidence", "visualEvidence"]
      }
    },
    required: ["diagnosis", "treatmentPlan", "xaiRationale"],
  };

  const parts: any[] = [{ text: systemPrompt }];

  if (scanFile) {
    const base64Data = await fileToBase64(scanFile);
    parts.push({
      inlineData: {
        mimeType: scanFile.type,
        data: base64Data,
      },
    });
  }

  const response = await ai.models.generateContent({
    model: modelName,
    contents: { parts: parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
    },
  });

  if (response.text) {
    return JSON.parse(response.text) as AgentDoctorResult;
  }
  throw new Error("Agent Doctor failed to generate a response");
};

// --- PATIENT ROLE: Empathetic Assistant ---

export const runPatientAssistant = async (symptoms: string, vitals: VitalData): Promise<PatientAnalysisResult> => {
    const vitalsStr = `Heart Rate: ${vitals.heartRate} bpm, Oxygen: ${vitals.spo2}%`;
    
    const prompt = `
      Role: You are a kind, empathetic home health assistant. You are speaking directly to a patient.
      Input:
      - Patient's Vitals: ${vitalsStr}
      - Patient's Description: "${symptoms}"

      Task: 
      1. Explain their vitals in very simple language (e.g., "Your heart rate is a bit high").
      2. Provide comforting advice based on their symptoms.
      3. Determine an alert level: 'normal', 'attention', or 'critical'.

      Tone: Warm, reassuring, non-alarmist, but clear if they need a doctor.
      Use 'You' to address the patient.
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            explanation: { type: Type.STRING },
            advice: { type: Type.STRING },
            alertLevel: { type: Type.STRING, enum: ['normal', 'attention', 'critical'] }
        },
        required: ['explanation', 'advice', 'alertLevel']
    };

    const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema
        }
    });

    if (response.text) {
        return JSON.parse(response.text) as PatientAnalysisResult;
    }
    throw new Error("Patient assistant failed");
};

export const runZenCompanion = async (history: ChatMessage[], vitals: VitalData, imageFile?: File | null): Promise<string> => {
  const vitalsStr = `HR: ${vitals.heartRate}, SpO2: ${vitals.spo2}%, BP: ${vitals.bpSystolic}/${vitals.bpDiastolic}`;
  
  // Format history for the prompt
  const conversationStr = history.map(msg => `${msg.role === 'user' ? 'Patient' : 'Medical Assistant'}: ${msg.text}`).join('\n');

  const prompt = `
    Role: You are an intelligent Medical Assistant. You are professional, efficient, yet empathetic.
    
    Context:
    - Real-time Vitals: ${vitalsStr}
    
    Conversation History:
    ${conversationStr}
    
    Instructions:
    - Your goal is to gather information (triage) and provide guidance.
    - Keep responses concise and clear.
    - If an image is provided, analyze it in the context of their symptoms.
    - If vitals are critical (HR > 120 or SpO2 < 92), advise immediate medical attention.
    
    Reply as "Medical Assistant":
  `;

  const parts: any[] = [{ text: prompt }];

  if (imageFile) {
    const base64Data = await fileToBase64(imageFile);
    parts.push({
      inlineData: {
        mimeType: imageFile.type,
        data: base64Data,
      },
    });
  }

  const response = await ai.models.generateContent({
    model: modelName,
    contents: { parts: parts }
  });

  return response.text || "I am processing your data. Please wait a moment.";
};

export const runSimpleHealthAssistant = async (history: ChatMessage[], lastMessage: string): Promise<string> => {
  const conversationStr = history.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.text}`).join('\n');
  
  const prompt = `
    Role: You are a personal health assistant.
    
    Conversation History:
    ${conversationStr}
    User: ${lastMessage}
    
    Instructions:
    - Answer the user's health question purely based on general medical knowledge.
    - Be concise and helpful.
    - Always advise consulting a doctor for serious issues.
    
    Assistant:
  `;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt
  });

  return response.text || "I'm having trouble connecting right now.";
};
