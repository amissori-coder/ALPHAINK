import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State {
  error: Error | null;
  info: ErrorInfo | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null, info: null };

  static getDerivedStateFromError(error: Error): State {
    return { error, info: null };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[AlphaInk]', error, info);
    this.setState({ error, info });
  }

  reset = () => {
    this.setState({ error: null, info: null });
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-ink-50">
        <div className="card max-w-lg w-full p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-semibold">
              !
            </div>
            <div>
              <h2 className="text-base font-semibold text-ink-900">
                Errore di rendering
              </h2>
              <p className="text-xs text-ink-500">
                L'app ha intercettato un errore. I dati salvati sono integri.
              </p>
            </div>
          </div>
          <pre className="text-xs bg-ink-900 text-red-200 rounded-lg p-3 overflow-auto max-h-60 whitespace-pre-wrap">
            {this.state.error.message}
            {'\n\n'}
            {this.state.error.stack?.split('\n').slice(0, 6).join('\n')}
          </pre>
          <div className="mt-4 flex gap-2">
            <button className="btn-primary" onClick={this.reset}>
              Riprova
            </button>
            <button
              className="btn-secondary"
              onClick={() => {
                localStorage.removeItem('alphaink.state.v1');
                location.reload();
              }}
            >
              Azzera stato locale
            </button>
          </div>
        </div>
      </div>
    );
  }
}
