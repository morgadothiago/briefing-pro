"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useWizard } from "@/hooks/use-wizard";
import { useAutoSave } from "@/hooks/use-auto-save";
import { WizardProgressBar } from "./progress-bar";
import { AutoSaveIndicator } from "./auto-save-indicator";
import { Step1 } from "./steps/step-1";
import { Step2 } from "./steps/step-2";
import { Step3 } from "./steps/step-3";
import { Step4 } from "./steps/step-4";
import { Step5 } from "./steps/step-5";
import { Step6 } from "./steps/step-6";
import { Step7 } from "./steps/step-7";
import { Step8 } from "./steps/step-8";
import { Step9 } from "./steps/step-9";
import { Step10 } from "./steps/step-10";
import { Step11 } from "./steps/step-11";
import { Step12 } from "./steps/step-12";
import type { Briefing, BriefingData } from "@/types";

const TOTAL_STEPS = 12;

interface WizardContainerProps {
  briefing: Briefing;
  onComplete: () => void;
}

export function WizardContainer({ briefing, onComplete }: WizardContainerProps) {
  const { currentStep, completedSteps, data, goNext, goPrev, updateData, isFirst } =
    useWizard({
      totalSteps: TOTAL_STEPS,
      initialStep: Math.max(1, briefing.currentStep),
      initialCompleted: briefing.completedSteps,
      initialData: briefing.data,
    });

  const autoSave = useAutoSave(briefing.token, currentStep);

  function handleStepSave<K extends keyof BriefingData>(key: K, stepData: BriefingData[K]) {
    updateData(key, stepData);
    autoSave.schedule(stepData as Record<string, unknown>);
  }

  const stepProps = {
    onNext: goNext,
    onPrev: goPrev,
    isFirst,
  };

  const commonStep = (step: number) => ({
    ...stepProps,
    isFirst: step === 1,
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Logo */}
      <div className="text-center py-4 border-b border-gray-100 bg-white">
        <span className="text-lg font-bold text-gray-900">
          Briefing<span className="text-blue-500">Pro</span>
        </span>
      </div>

      {/* Progress bar */}
      <WizardProgressBar
        totalSteps={TOTAL_STEPS}
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={(s) => {
          if (completedSteps.includes(s) || s <= currentStep) {
            // Allow navigating to completed steps
          }
        }}
      />

      {/* Auto save indicator */}
      <div className="flex justify-end px-6 pt-2 max-w-2xl mx-auto w-full">
        <AutoSaveIndicator status={autoSave.status} onRetry={autoSave.retry} />
      </div>

      {/* Card */}
      <div className="flex-1 flex items-start justify-center px-4 py-6">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {currentStep === 1 && (
                  <Step1
                    data={data.step1}
                    onSave={(d) => handleStepSave("step1", d)}
                    {...commonStep(1)}
                  />
                )}
                {currentStep === 2 && (
                  <Step2
                    data={data.step2}
                    onSave={(d) => handleStepSave("step2", d)}
                    {...commonStep(2)}
                  />
                )}
                {currentStep === 3 && (
                  <Step3
                    data={data.step3}
                    onSave={(d) => handleStepSave("step3", d)}
                    {...commonStep(3)}
                  />
                )}
                {currentStep === 4 && (
                  <Step4
                    data={data.step4}
                    onSave={(d) => handleStepSave("step4", d)}
                    {...commonStep(4)}
                  />
                )}
                {currentStep === 5 && (
                  <Step5
                    data={data.step5}
                    step4Data={data.step4}
                    onSave={(d) => handleStepSave("step5", d)}
                    {...commonStep(5)}
                  />
                )}
                {currentStep === 6 && (
                  <Step6
                    data={data.step6}
                    onSave={(d) => handleStepSave("step6", d)}
                    {...commonStep(6)}
                  />
                )}
                {currentStep === 7 && (
                  <Step7
                    data={data.step7}
                    onSave={(d) => handleStepSave("step7", d)}
                    {...commonStep(7)}
                  />
                )}
                {currentStep === 8 && (
                  <Step8
                    data={data.step8}
                    token={briefing.token}
                    onSave={(d) => handleStepSave("step8", d)}
                    {...commonStep(8)}
                  />
                )}
                {currentStep === 9 && (
                  <Step9
                    data={data.step9}
                    onSave={(d) => handleStepSave("step9", d)}
                    {...commonStep(9)}
                  />
                )}
                {currentStep === 10 && (
                  <Step10
                    data={data.step10}
                    onSave={(d) => handleStepSave("step10", d)}
                    {...commonStep(10)}
                  />
                )}
                {currentStep === 11 && (
                  <Step11
                    data={data.step11}
                    onSave={(d) => handleStepSave("step11", d)}
                    {...commonStep(11)}
                  />
                )}
                {currentStep === 12 && (
                  <Step12
                    data={data}
                    onSubmit={(d) => {
                      handleStepSave("step12", d);
                      onComplete();
                    }}
                    onPrev={goPrev}
                    isSubmitting={false}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
