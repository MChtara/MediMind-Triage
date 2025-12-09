import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";
import { runSimpleHealthAssistant } from "../services/geminiService";

interface SimpleUserDashboardProps {
  onBack: () => void;
}

const SimpleUserDashboard: React.FC<SimpleUserDashboardProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'ai', text: "Hello! I'm your personal health assistant. How can I help you today?", timestamp: new Date().toLocaleTimeString() }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
        const responseText = await runSimpleHealthAssistant(messages, input);
        const aiMsg: ChatMessage = { role: 'ai', text: responseText, timestamp: new Date().toLocaleTimeString() };
        setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
        setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I couldn't connect right now.", timestamp: new Date().toLocaleTimeString() }]);
    }
    setLoading(false);
  };

  return (
    <div className="theme-user min-h-screen flex flex-col font-sans bg-slate-50">
        <header className="bg-white border-b border-slate-200 p-4 flex items-center gap-4 sticky top-0 z-10">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                </div>
                <h1 className="font-bold text-slate-700">Health Assistant</h1>
            </div>
        </header>

        <div className="flex-grow max-w-2xl w-full mx-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                        msg.role === 'user' 
                        ? 'bg-teal-600 text-white rounded-tr-none' 
                        : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                    }`}>
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        <span className={`text-[10px] block mt-2 opacity-70 ${msg.role === 'user' ? 'text-teal-100' : 'text-slate-400'}`}>
                            {msg.timestamp}
                        </span>
                    </div>
                </div>
            ))}
            {loading && (
                 <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-sm flex gap-2 items-center">
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                    </div>
                </div>
            )}
            <div ref={bottomRef}></div>
        </div>

        <div className="p-4 bg-white border-t border-slate-200 sticky bottom-0">
            <div className="max-w-2xl mx-auto flex gap-2">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask a health question..."
                    className="flex-grow bg-slate-100 border-0 rounded-full px-6 py-3 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                />
                <button 
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    className="bg-teal-600 hover:bg-teal-700 text-white rounded-full w-12 h-12 flex items-center justify-center transition-colors disabled:opacity-50"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
  );
};

export default SimpleUserDashboard;
