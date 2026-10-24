import { useTranslation } from "@simplix-react/i18n/react";
import {
  Children,
  type ReactElement,
  type ReactNode,
  useCallback,
  useState,
} from "react";

import { Flex } from "../../primitives/flex";
import { Stack } from "../../primitives/stack";
import { slotAttributes, partAttributes } from "../../design/slot-style";
import { cn } from "../../utils/cn";
import {
  wizardActionsStyle,
  wizardNextStyle,
  wizardPreviousStyle,
  wizardStepConnectorStyle,
  wizardStepDescriptionStyle,
  wizardStepMarkerStyle,
  wizardStepTitleStyle,
  wizardStepsStyle,
} from "./wizard.style";

// ── Wizard.Step ──

/**
 * Props for the Wizard.Step sub-component.
 *
 * Each step defines its title, optional description, and an optional
 * async validation function that must return `true` to proceed.
 */
export interface WizardStepProps {
  /** Step title displayed in the step indicator. */
  title: string;
  /** Optional description shown below the title. */
  description?: string;
  /** Validation function called before advancing. Return `false` to block navigation. */
  validate?: () => boolean | Promise<boolean>;
  /** Step content. */
  children: ReactNode;
}

function WizardStep({ children }: WizardStepProps) {
  return <>{children}</>;
}

// ── Step indicator ──

/** Props for {@link StepIndicator}. */
export interface StepIndicatorProps {
  /** The steps in order: what each is, and an optional second line (who holds it, when it closed). */
  steps: readonly { title: string; description?: string }[];
  /** The step in hand; every step before it is done. Pass `steps.length` when all are done. */
  currentStep: number;
  /** A step that was turned back: drawn as rejected instead of in hand. */
  rejectedStep?: number;
  /** Names the list for assistive technology; the wizard's own label when absent. */
  label?: string;
  /**
   * `horizontal` (the wizard's) runs the steps along one line; `vertical` stacks them down a rule,
   * for a side column where a long chain would otherwise run past its box.
   *
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";
}

/**
 * The steps of a procedure as a wizard draws them: a numbered marker per step joined by a line,
 * the done steps ticked, the one in hand filled, the rest outlined, so the order and the place in
 * it read at a glance. One line that scrolls sideways when it is wider than its box.
 */
export function StepIndicator({ steps, currentStep, rejectedStep, label, orientation = "horizontal" }: StepIndicatorProps) {
  const { t } = useTranslation("simplix/ui");
  const vertical = orientation === "vertical";
  return (
    <nav aria-label={label ?? t("wizard.steps")} className={vertical ? "min-w-0" : "min-w-0 overflow-x-auto"}>
      <ol className={vertical ? "flex flex-col" : "flex items-center"} {...slotAttributes(wizardStepsStyle, {})}>
        {steps.map((step, index) => {
          const isRejected = index === rejectedStep;
          const isActive = index === currentStep && !isRejected;
          const isCompleted = index < currentStep && !isRejected;

          return (
            <li key={`${index}-${step.title}`} className={vertical ? "flex flex-col" : "flex shrink-0 items-center"}>
              <Flex gap="xs" align="center">
                <span
                  className="inline-flex h-8 w-8 items-center justify-center"
                  {...slotAttributes(wizardStepMarkerStyle, {
                    state: isRejected ? "rejected" : isActive ? "active" : isCompleted ? "completed" : "pending",
                  })}
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
                <Stack gap="none" className={vertical ? "min-w-0" : "min-w-0 whitespace-nowrap"}>
                  <span
                    {...slotAttributes(wizardStepTitleStyle, { active: isActive })}
                  >
                    {step.title}
                  </span>
                  {step.description && (
                    <span {...slotAttributes(wizardStepDescriptionStyle, {})}>
                      {step.description}
                    </span>
                  )}
                </Stack>
              </Flex>
              {index < steps.length - 1 && (
                <span
                  // Vertical: a rule down from the centre of the 32px marker to the next one.
                  className={vertical ? "my-1 ml-4 h-5 w-px flex-shrink-0" : "mx-3 h-px w-8 flex-shrink-0"}
                  {...slotAttributes(wizardStepConnectorStyle, { done: index < currentStep })}
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

/**
 * Props for the {@link Wizard} compound component root.
 *
 * ```
 * ┌─────────────────────────────────────────┐
 * │  (1) Basic ── (2) Details ── (3) Review │
 * ├─────────────────────────────────────────┤
 * │                                         │
 * │  Active step content                    │
 * │                                         │
 * ├─────────────────────────────────────────┤
 * │  [Previous]                     [Next]  │
 * └─────────────────────────────────────────┘
 * ```
 */
export interface WizardProps {
  /** Called when the user completes the final step. */
  onComplete: () => void;
  className?: string;
  /** One or more `<Wizard.Step>` children. */
  children: ReactNode;
}

function WizardRoot({ onComplete, className, children }: WizardProps) {
  const { t } = useTranslation("simplix/ui");
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
      <section
        aria-label={t("wizard.stepLabel", {
          step: currentStep + 1,
          title: steps[currentStep]?.title ?? "",
        })}
      >
        {activeStep}
      </section>

      {/* Navigation buttons */}
      <Flex gap="sm" justify="between" {...partAttributes(wizardActionsStyle, {})}>
        <button
          type="button"
          onClick={goToPrevious}
          disabled={isFirstStep}
          className="inline-flex items-center disabled:cursor-not-allowed"
          {...slotAttributes(wizardPreviousStyle, {})}
        >
          Previous
        </button>
        <button
          type="button"
          onClick={goToNext}
          disabled={isValidating}
          className="inline-flex items-center disabled:cursor-not-allowed"
          {...slotAttributes(wizardNextStyle, {})}
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
 * ```
 * ┌─────────────────────────────────────────┐
 * │  (1) Basic ── (2) Details ── (3) Review │
 * ├─────────────────────────────────────────┤
 * │  <Wizard.Step title="Basic">            │
 * │    form fields...                       │
 * │  </Wizard.Step>                         │
 * ├─────────────────────────────────────────┤
 * │  [Previous]                  [Next]     │
 * └─────────────────────────────────────────┘
 * ```
 *
 * Sub-components: Step (with title, description, and optional validate function).
 *
 * @example
 * ```tsx
 * <Wizard onComplete={handleSubmit}>
 *   <Wizard.Step title="Basic" validate={() => form.validate()}>
 *     <TextField label="Name" ... />
 *   </Wizard.Step>
 *   <Wizard.Step title="Review">
 *     <p>Confirm your data.</p>
 *   </Wizard.Step>
 * </Wizard>
 * ```
 */
export const Wizard = Object.assign(WizardRoot, {
  Step: WizardStep,
});
