import { Component, type ErrorInfo, type ReactNode } from "react";
import { Card } from "./ui/Card";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  public state: ErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(_error: Error, _errorInfo: ErrorInfo): void {
    // Errors can be reported to an external service here if needed.
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
          <div className="max-w-md w-full">
            <Card
              title="Something went wrong"
              description="An unexpected error occurred while rendering this view."
            >
              <p className="text-sm text-slate-600">
                The team has been notified. You can try refreshing the page, or
                navigate using the sidebar to continue working.
              </p>
            </Card>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

