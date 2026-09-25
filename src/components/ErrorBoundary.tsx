import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-black px-4 text-center text-white">
          <h2 className="font-serif text-2xl sm:text-3xl">Alpha stories studio</h2>
          <p className="mt-3 text-sm text-zinc-400">An unexpected error occurred. Please refresh or return to home.</p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.href = '/';
            }}
            className="mt-6 rounded-full bg-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-black transition-colors hover:bg-zinc-200"
          >
            Reload Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
