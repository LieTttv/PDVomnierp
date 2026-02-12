
import React, { ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Polyfill process for the browser environment
(window as any).process = (window as any).process || { env: {} };

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Fix: Defined explicit interfaces for Props and State to resolve TypeScript type inference issues
interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Simple error fallback for early initialization errors
// Fix: Added explicit generic types and state property declaration to resolve "Property does not exist" errors
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false, error: null };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    // Fix: Explicitly accessing state which is now correctly recognized by TypeScript
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>
          <h1 style={{ color: '#e11d48' }}>Algo deu errado na inicialização.</h1>
          <pre style={{ background: '#f1f5f9', padding: '10px', borderRadius: '8px', display: 'inline-block', textAlign: 'left' }}>
            {this.state.error?.message}
          </pre>
          <p>Verifique o console do desenvolvedor para mais detalhes.</p>
        </div>
      );
    }
    // Fix: Explicitly accessing props which is now correctly recognized by TypeScript
    return this.props.children;
  }
}

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
