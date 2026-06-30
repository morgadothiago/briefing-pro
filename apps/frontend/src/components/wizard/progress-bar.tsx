"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  totalSteps: number;
  currentStep: number;
  completedSteps: number[];
  onStepClick?: (step: number) => void;
}

export function WizardProgressBar({
  totalSteps,
  currentStep,
  completedSteps,
  onStepClick,
}: ProgressBarProps) {
  const progressPct = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="w-full px-4 py-4 bg-white border-b border-gray-100">
      <div className="max-w-2xl mx-auto">
        {/* Track */}
        <div className="relative flex items-center">
          <div className="absolute left-0 right-0 h-0.5 bg-gray-200 rounded-full" />
          <motion.div
            className="absolute left-0 h-0.5 bg-blue-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />

          {/* Bubbles */}
          <div className="relative w-full flex justify-between">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
              const isCompleted = completedSteps.includes(step);
              const isCurrent = step === currentStep;
              const isClickable = isCompleted || step <= currentStep;

              return (
                <motion.button
                  key={step}
                  onClick={() => isClickable && onStepClick?.(step)}
                  disabled={!isClickable}
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all duration-200 bg-white",
                    isCompleted
                      ? "bg-blue-500 border-blue-500 text-white"
                      : isCurrent
                      ? "border-blue-500 text-blue-600"
                      : "border-gray-200 text-gray-400",
                    isClickable && "cursor-pointer"
                  )}
                  whileHover={isClickable ? { scale: 1.1 } : {}}
                  whileTap={isClickable ? { scale: 0.95 } : {}}
                >
                  {isCompleted ? <Check size={12} /> : step}
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="mt-2 flex justify-between text-xs text-gray-400">
          <span>Etapa {currentStep} de {totalSteps}</span>
          <span>{Math.round((completedSteps.length / totalSteps) * 100)}% completo</span>
        </div>
      </div>
    </div>
  );
}
