"use client";

import { useState, useCallback } from "react";
import type { BriefingData } from "@/types";

interface UseWizardOptions {
  totalSteps: number;
  initialStep?: number;
  initialCompleted?: number[];
  initialData?: BriefingData;
}

export function useWizard({
  totalSteps,
  initialStep = 1,
  initialCompleted = [],
  initialData = {},
}: UseWizardOptions) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<number[]>(initialCompleted);
  const [data, setData] = useState<BriefingData>(initialData);

  const goNext = useCallback(() => {
    if (currentStep < totalSteps) {
      setCompletedSteps((prev) =>
        prev.includes(currentStep) ? prev : [...prev, currentStep]
      );
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep, totalSteps]);

  const goPrev = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 1 && step <= totalSteps) {
        setCurrentStep(step);
      }
    },
    [totalSteps]
  );

  const updateData = useCallback((stepKey: keyof BriefingData, stepData: BriefingData[keyof BriefingData]) => {
    setData((prev) => ({ ...prev, [stepKey]: stepData }));
  }, []);

  const markComplete = useCallback((step: number) => {
    setCompletedSteps((prev) =>
      prev.includes(step) ? prev : [...prev, step]
    );
  }, []);

  return {
    currentStep,
    completedSteps,
    data,
    goNext,
    goPrev,
    goToStep,
    updateData,
    markComplete,
    isFirst: currentStep === 1,
    isLast: currentStep === totalSteps,
    progress: Math.round((completedSteps.length / totalSteps) * 100),
  };
}
