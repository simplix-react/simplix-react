import {
  Children,
  type ReactElement,
  type ReactNode,
  useCallback,
  useState,
} from "react";

import { Flex } from "../../primitives/flex";
import { Stack } from "../../primitives/stack";
import { cn } from "../../utils/cn";

// ── Wizard.Step ──

/** Props for the Wizard.Step sub-component. */
export interface WizardStepProps {
  title: string;
  description?: string;
  validate?: () => boolean | Promise<boolean>;
  children: ReactNode;
}

function WizardStep({ children }: WizardStepProps) {
  return <>{children}</>;
}

// ── Step indicator ──

interface StepIndicatorProps {
  steps: { title: string; description?: string }[];
  currentStep: number;
}

function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <nav aria-label="Form steps">
      <ol className="flex items-center gap-0">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <li key={step.title} className="flex items-center">
              <Flex gap="xs" align="center">
                <span
                  className={cn(
                    "inline-flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                    isActive && "border-primary bg-primary text-primary-foreground",
                    isCompleted && "border-primary bg-primary/10 text-primary",
                    !isActive && !isCompleted && "border-muted-foreground/30 text-muted-foreground",
                  )}
                  aria-current={isActive ? "step" : undefined}
                >
                  {isCompleted ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M4 8L7 11L12 5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </span>
                <Stack gap="none" className="min-w-0">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isActive ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {step.title}
                  </span>
                  {step.description && (
                    <span className="text-xs text-muted-foreground">
                      {step.description}
                    </span>
                  )}
                </Stack>
              </Flex>
              {index < steps.length - 1 && (
                <span
                  className={cn(
                    "mx-3 h-px w-8 flex-shrink-0",
                    index < currentStep ? "bg-primary" : "bg-muted-foreground/30",
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ── Wizard Root ──

/** Props for the {@link Wizard} compound component root. */
export interface WizardProps {
  onComplete: () => void;
  className?: string;
  children: ReactNode;
}

function WizardRoot({ onComplete, className, children }: WizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isValidating, setIsValidating] = useState(false);

  // Extract step props from children
  const stepElements = Children.toArray(children).filter(
    (child): child is ReactElement<WizardStepProps> =>
      typeof child === "object" &&
      child !== null &&
      "props" in child &&
      "title" in (child.props as Record<string, unknown>),
  );

  const totalSteps = stepElements.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  const steps = stepElements.map((el) => ({
    title: el.props.title,
    description: el.props.description,
  }));

  const goToPrevious = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  const goToNext = useCallback(async () => {
    const currentElement = stepElements[currentStep];
    const validateFn = currentElement?.props.validate;

    if (validateFn) {
      setIsValidating(true);
      try {
        const isValid = await validateFn();
        if (!isValid) return;
      } finally {
        setIsValidating(false);
      }
    }

    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep((prev) => Math.min(totalSteps - 1, prev + 1));
    }
  }, [currentStep, stepElements, isLastStep, onComplete, totalSteps]);

  const activeStep = stepElements[currentStep];

  return (
    <Stack gap="lg" className={cn("w-full", className)}>
      <StepIndicator steps={steps} currentStep={currentStep} />

      {/* Active step content */}
      <section aria-label={`Step ${currentStep + 1}: ${steps[currentStep]?.title}`}>
        {activeStep}
      </section>

      {/* Navigation buttons */}
      <Flex gap="sm" justify="between" className="pt-2">
        <button
          type="button"
          onClick={goToPrevious}
          disabled={isFirstStep}
          className={cn(
            "inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition-colors",
            "hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed",
          )}
        >
          Previous
        </button>
        <button
          type="button"
          onClick={goToNext}
          disabled={isValidating}
          className={cn(
            "inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
            isLastStep
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-primary text-primary-foreground hover:bg-primary/90",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          )}
        >
          {isValidating ? "Validating..." : isLastStep ? "Complete" : "Next"}
        </button>
      </Flex>
    </Stack>
  );
}

// ── Compound component assembly ──

/**
 * Multi-step form wizard with step indicator, validation, and navigation.
 *
 * Sub-components: Step (with title, description, and optional validate function).
 *
 * @example
 * \\n */
export const Wizard = Object.assign(WizardRoot, {
  Step: WizardStep,
});
