import { Component, type ErrorInfo, type ReactNode } from "react";

import { Stack } from "../../primitives/stack";
import { cn } from "../../utils/cn";

/** Props for the {@link CrudErrorBoundary} component. */
export interface CrudErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
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
        className="rounded-lg border border-destructive/50 bg-destructive/5 p-8"
        role="alert"
      >
        <p className="text-sm font-medium text-destructive">
          Something went wrong
        </p>
        <p className={cn("max-w-md text-center text-xs text-muted-foreground")}>
          {error.message}
        </p>
        <button
          type="button"
          onClick={this.handleReset}
          className={cn(
            "inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium",
            "border border-input bg-background ring-offset-background transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          )}
        >
          Try again
        </button>
      </Stack>
    );
  }
}
