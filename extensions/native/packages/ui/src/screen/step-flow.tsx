import { useTranslation } from "@simplix-react/i18n/react";
import {
  Children,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { View } from "react-native";

import { Button } from "../controls/button";
import { Heading } from "../primitives/heading";
import { Text } from "../primitives/text";
import { cn } from "../utils/cn";

/** State and controls exposed by {@link useStepFlow}. */
export interface StepFlowContextValue {
  index: number;
  count: number;
  isFirst: boolean;
  isLast: boolean;
  next: () => void;
  back: () => void;
  goTo: (index: number) => void;
}

const StepFlowContext = createContext<StepFlowContextValue | null>(null);

/** Access the surrounding step flow (for custom in-step controls). */
export function useStepFlow(): StepFlowContextValue {
  const ctx = useContext(StepFlowContext);
  if (!ctx) throw new Error("useStepFlow must be used within StepFlow");
  return ctx;
}

/** Props for a {@link StepFlow.Step}. */
export interface StepProps {
  /** Step title shown above the content. */
  title?: string;
  /** Disable the footer Next action for this step (validation gate). */
  nextDisabled?: boolean;
  children?: ReactNode;
}

function Step({ children }: StepProps) {
  return <>{children}</>;
}

/** Props for the {@link StepFlow} component. */
export interface StepFlowProps {
  /** Called when Next is pressed on the last step. */
  onFinish?: () => void;
  /** Called when Back is pressed on the first step. */
  onCancel?: () => void;
  /** Hide the built-in footer (steps drive navigation via `useStepFlow`). */
  hideFooter?: boolean;
  /** Hide the progress indicator row. */
  hideProgress?: boolean;
  /** Label of the Next button on the last step. Defaults to localized "Done". */
  finishLabel?: string;
  className?: string;
  children: ReactNode;
}

/**
 * One-step-per-screen flow container: progress indicator, single active step,
 * Back/Next footer. Long forms split into steps instead of scrolling; kiosk
 * flows hide the footer and drive navigation from step content.
 *
 * @example
 * ```tsx
 * <StepFlow onFinish={submit} onCancel={goBack}>
 *   <StepFlow.Step title="Applicant">…</StepFlow.Step>
 *   <StepFlow.Step title="Host" nextDisabled={!host}>…</StepFlow.Step>
 *   <StepFlow.Step title="Agreement">…</StepFlow.Step>
 * </StepFlow>
 * ```
 */
export function StepFlow({
  onFinish,
  onCancel,
  hideFooter,
  hideProgress,
  finishLabel,
  className,
  children,
}: StepFlowProps) {
  const { t } = useTranslation("simplix/native");
  const [index, setIndex] = useState(0);

  const steps = Children.toArray(children).filter(
    (child): child is ReactElement<StepProps> =>
      isValidElement(child) && child.type === Step,
  );
  const count = steps.length;
  const isFirst = index === 0;
  const isLast = index === count - 1;

  const next = useCallback(() => {
    if (index >= count - 1) {
      onFinish?.();
    } else {
      setIndex((i) => Math.min(i + 1, count - 1));
    }
  }, [index, count, onFinish]);

  const back = useCallback(() => {
    if (index === 0) {
      onCancel?.();
    } else {
      setIndex((i) => Math.max(i - 1, 0));
    }
  }, [index, onCancel]);

  const goTo = useCallback(
    (target: number) => setIndex(Math.max(0, Math.min(target, count - 1))),
    [count],
  );

  const value = useMemo<StepFlowContextValue>(
    () => ({ index, count, isFirst, isLast, next, back, goTo }),
    [index, count, isFirst, isLast, next, back, goTo],
  );

  const active = steps[index];

  return (
    <StepFlowContext.Provider value={value}>
      <View className={cn("flex-1", className)}>
        {!hideProgress ? (
          <View className="gap-2 px-4 pb-3 pt-2">
            <Text size="caption" tone="muted">
              {t("stepFlow.stepOf", { current: index + 1, total: count })}
            </Text>
            <View className="h-1 flex-row overflow-hidden rounded-full bg-surface-3">
              <View
                className="h-1 rounded-full bg-primary"
                style={{ width: `${((index + 1) / Math.max(count, 1)) * 100}%` }}
              />
            </View>
            {active?.props.title ? (
              <Heading level={4}>{active.props.title}</Heading>
            ) : null}
          </View>
        ) : null}
        <View className="flex-1">{active}</View>
        {!hideFooter ? (
          <View className="flex-row gap-2 border-t border-border px-4 py-3">
            <Button variant="outline" className="flex-1" onPress={back}>
              {isFirst ? t("common.cancel") : t("stepFlow.previous")}
            </Button>
            <Button
              className="flex-1"
              disabled={active?.props.nextDisabled}
              onPress={next}
            >
              {isLast ? (finishLabel ?? t("common.done")) : t("stepFlow.next")}
            </Button>
          </View>
        ) : null}
      </View>
    </StepFlowContext.Provider>
  );
}

StepFlow.Step = Step;
