import { Component, type ErrorInfo, type ReactNode } from "react";

import { Stack } from "../../primitives/stack";
import { slotAttributes, partAttributes } from "../../design/slot-style";
import {
  errorBoundaryMessageStyle,
  errorBoundaryRetryStyle,
  errorBoundaryStyle,
  errorBoundaryTitleStyle,
} from "./error-boundary.style";

/** Props for the {@link CrudErrorBoundary} component. */
export interface CrudErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Error boundary for CRUD components.
 * Catches render errors and displays a default fallback with retry,
 * or a custom fallback ReactNode/render function.
 */
export class CrudErrorBoundary extends Component<
  CrudErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: CrudErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({ error: null });
  };

  override render(): ReactNode {
    const { error } = this.state;

    if (!error) {
      return this.props.children;
    }

    // Custom fallback (ReactNode or render function)
    if (typeof this.props.fallback === "function") {
      return this.props.fallback(error, this.handleReset);
    }
    if (this.props.fallback !== undefined) {
      return this.props.fallback;
    }

    // Default fallback UI
    return (
      <Stack
        align="center"
        justify="center"
        gap="md"
        role="alert"
        {...partAttributes(errorBoundaryStyle, {})}
      >
        <p {...slotAttributes(errorBoundaryTitleStyle, {})}>
          Something went wrong
        </p>
        <p className="max-w-md" {...slotAttributes(errorBoundaryMessageStyle, {})}>
          {error.message}
        </p>
        <button
          type="button"
          onClick={this.handleReset}
          className="inline-flex h-9 items-center justify-center"
          {...slotAttributes(errorBoundaryRetryStyle, {})}
        >
          Try again
        </button>
      </Stack>
    );
  }
}
