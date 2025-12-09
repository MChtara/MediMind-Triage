import React, { useState, useEffect, useRef } from "react";
import { VitalData, ChatMessage } from "../types";
import { runZenCompanion } from "../services/geminiService";

interface PatientDashboardProps {
  onBack: () => void;
}

const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const PatientDashboard: React.FC<PatientDashboardProps> = ({ onBack }) => {
  const [currentVital, setCurrentVital] = useState<VitalData>({
    timestamp: new Date().toLocaleTimeString(),
    heartRate: 72,
    spo2: 98,
    bpSystolic: 120,
    bpDiastolic: 80,
  });

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentVital({
        timestamp: new Date().toLocaleTimeString(),
        heartRate: Math.floor(Math.random() * (100 - 60 + 1)) + 60,
        spo2: Math.floor(Math.random() * (100 - 95 + 1)) + 95,
        bpSystolic: Math.floor(Math.random() * (130 - 110 + 1)) + 110,
        bpDiastolic: Math.floor(Math.random() * (85 - 70 + 1)) + 70,
      });
    }, 2000);
    return () => clearInterval(intervalId);
  }, []);

  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'ai', text: "Systems online. I am your medical assistant. How can I assist you?", timestamp: new Date().toLocaleTimeString() }
  ]);
  const [inputText, setInputText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleVoiceInput = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    if (!SpeechRecognition) {
      alert("Voice features not supported.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; 
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) setInputText(prev => prev + (prev ? " " : "") + transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() && !selectedFile) return;

    const userText = inputText;
    const userFile = selectedFile;
    const userPreview = previewUrl;

    setInputText("");
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    const newUserMsg: ChatMessage = { 
        role: 'user', 
        text: userText,
        imageUrl: userPreview || undefined,
        timestamp: new Date().toLocaleTimeString() 
    };
    setMessages(prev => [...prev, newUserMsg]);
    setIsProcessing(true);

    try {
      const aiResponseText = await runZenCompanion([...messages, newUserMsg], currentVital, userFile);
      const newAiMsg: ChatMessage = { role: 'ai', text: aiResponseText, timestamp: new Date().toLocaleTimeString() };
      setMessages(prev => [...prev, newAiMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Connection error. Retrying...", timestamp: new Date().toLocaleTimeString() }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setSelectedFile(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen p-4 flex flex-col font-sans animate-fade-up">
      
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-20">
         <button onClick={onBack} className="group flex items-center gap-2 text-cyan-500 hover:text-cyan-300 transition-colors">
            <div className="w-10 h-10 rounded-full border border-cyan-500/30 flex items-center justify-center bg-cyan-950/30 group-hover:bg-cyan-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
            </div>
            <span className="text-xs font-mono font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">RETURN</span>
         </button>
      </div>

      <main className="flex-grow flex items-center justify-center w-full max-w-7xl mx-auto">
        
        {/* Main Interface Card */}
        <div className="glass-sci-fi w-full max-w-4xl h-[85vh] flex flex-col relative overflow-hidden">
            
            {/* Header / Vitals Bar */}
            <div className="p-6 border-b border-white/10 bg-black/20 flex items-center justify-between">
                <div>
                   <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3 text-glow">
                       <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
                       Patient Interface
                   </h2>
                </div>
                <div className="flex gap-6 font-mono text-sm">
                   <div className="flex flex-col items-end">
                      <span className="text-cyan-500/50 text-[10px] uppercase tracking-widest">Heart Rate</span>
                      <span className="text-cyan-400 font-bold">{currentVital.heartRate} <span className="text-[10px]">BPM</span></span>
                   </div>
                   <div className="flex flex-col items-end">
                      <span className="text-blue-500/50 text-[10px] uppercase tracking-widest">SpO2</span>
                      <span className="text-blue-400 font-bold">{currentVital.spo2}<span className="text-[10px]">%</span></span>
                   </div>
                </div>
            </div>

            {/* Chat History */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-up`}>
                        <div className={`max-w-[70%] p-5 rounded-2xl border backdrop-blur-md shadow-lg transition-all duration-300 ${
                            msg.role === 'user' 
                                ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-100 rounded-br-none' 
                                : 'bg-white/5 border-white/10 text-slate-200 rounded-bl-none'
                        }`}>
                            {msg.imageUrl && (
                                <img src={msg.imageUrl} alt="Attachment" className="max-w-[200px] w-full rounded-lg mb-3 border border-white/10 shadow-md block" />
                            )}
                            <p className="text-sm leading-relaxed font-light">{msg.text}</p>
                            <span className={`text-[10px] block mt-3 font-mono opacity-50 uppercase tracking-widest ${msg.role === 'user' ? 'text-right text-cyan-400' : 'text-slate-400'}`}>
                                {msg.timestamp}
                            </span>
                        </div>
                    </div>
                ))}
                
                {isProcessing && (
                     <div className="flex justify-start animate-fade-up">
                        <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-none p-4 flex gap-2 items-center">
                            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-100"></span>
                            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-200"></span>
                        </div>
                     </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Control Bar */}
            <div className="p-6 bg-black/20 border-t border-white/10">
                
                {/* Image Preview Area */}
                {previewUrl && (
                    <div className="mb-4 relative w-fit animate-fade-up group">
                        <div className="absolute -top-2 -right-2 z-10">
                            <button onClick={removeImage} className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                        <img src={previewUrl} alt="Preview" className="h-24 rounded-lg border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)] object-cover" />
                        <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/10 pointer-events-none"></div>
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-4 rounded-xl border transition-all btn-neon ${previewUrl ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-white/5 border-white/10 text-slate-400 hover:text-cyan-400'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                    </button>

                    <button
                        onClick={handleVoiceInput}
                        className={`p-4 rounded-xl border transition-all btn-neon ${isListening ? "bg-red-500/20 border-red-500 text-red-400 animate-pulse" : "bg-white/5 border-white/10 text-slate-400 hover:text-white"}`}
                    >
                        {isListening ? (
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                 <rect x="6" y="6" width="8" height="8" rx="1" />
                             </svg>
                        ) : (
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                             </svg>
                        )}
                    </button>

                    <div className="flex-grow relative">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Type symptoms..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all font-light"
                        />
                    </div>

                    <button
                        onClick={handleSendMessage}
                        disabled={(!inputText.trim() && !selectedFile) || isProcessing}
                        className={`p-4 rounded-xl border transition-all btn-neon flex items-center justify-center ${(!inputText.trim() && !selectedFile) || isProcessing ? "bg-white/5 border-white/5 text-slate-600 cursor-not-allowed" : "bg-cyan-600/20 border-cyan-500 text-cyan-400"}`}
                    >
                         {isProcessing ? (
                             <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
                         ) : (
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                             </svg>
                         )}
                    </button>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;