import { Component, type ErrorInfo, type ReactNode } from "react";

interface State {
  error: Error | null;
}

/** Catches rendering errors so one broken panel does not blank the whole app. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Interface error:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="main">
          <div className="form-error" role="alert">
            <strong>Something went wrong on this screen.</strong>
            <p>{this.state.error.message}</p>
            <button type="button" className="btn" onClick={() => this.setState({ error: null })}>
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
