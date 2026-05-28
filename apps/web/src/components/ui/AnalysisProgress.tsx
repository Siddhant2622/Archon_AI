"use client";

interface AnalysisProgressProps {
  currentStep: number;
}

export function AnalysisProgress({ currentStep }: AnalysisProgressProps) {
  const steps = [
    { label: "Fetching Code", icon: "📥" },
    { label: "Indexing Files", icon: "🗂️" },
    { label: "AI Analysis", icon: "🧠" },
    { label: "Generating Report", icon: "📝" },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto p-6 rounded-2xl bg-bg-secondary border border-white/[0.06]">
      <div className="flex justify-between mb-8">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isPast = index < currentStep;
          
          return (
            <div key={step.label} className="flex flex-col items-center relative z-10 w-1/4">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mb-3 transition-all duration-500
                  ${isActive ? "bg-accent-cyan/20 border-2 border-accent-cyan shadow-[0_0_15px_rgba(34,211,238,0.3)]" : ""}
                  ${isPast ? "bg-accent-emerald/20 border-2 border-accent-emerald" : ""}
                  ${!isActive && !isPast ? "bg-white/[0.02] border-2 border-white/[0.05] opacity-50" : ""}
                `}
              >
                {isPast ? "✅" : step.icon}
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wider text-center transition-colors duration-500
                ${isActive ? "text-accent-cyan" : ""}
                ${isPast ? "text-accent-emerald" : ""}
                ${!isActive && !isPast ? "text-text-muted" : ""}
              `}>
                {step.label}
              </span>
            </div>
          );
        })}
        
        {/* Progress Line Background */}
        <div className="absolute top-11 left-[12%] right-[12%] h-1 bg-white/[0.05] rounded-full z-0" />
        
        {/* Active Progress Line */}
        <div 
          className="absolute top-11 left-[12%] h-1 bg-accent-cyan rounded-full z-0 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(34,211,238,0.5)]" 
          style={{ width: `${(currentStep / (steps.length - 1)) * 76}%` }}
        />
      </div>

      {/* Mock Terminal Output Area */}
      <div className="bg-[#0a0e14] rounded-xl p-4 font-mono text-xs text-text-secondary h-32 overflow-hidden border border-white/[0.04]">
        <div className="opacity-50 mb-2">Analysis log...</div>
        {currentStep === 0 && <div className="text-accent-cyan animate-pulse">> Fetching repository metadata...</div>}
        {currentStep === 1 && <div className="text-accent-cyan animate-pulse">> Indexing 14,203 files into AST...</div>}
        {currentStep === 2 && <div className="text-accent-cyan animate-pulse">> Running deep semantic analysis via Gemini 2.5 Pro...</div>}
        {currentStep === 3 && <div className="text-accent-cyan animate-pulse">> Formatting output and generating patches...</div>}
      </div>
    </div>
  );
}
