// src/components/LazyLoadWrapper.tsx
'use client';

import React, { Component, ReactNode, ComponentType, lazy, Suspense } from 'react';

interface LazyLoadWrapperState {
  hasError: boolean;
  retryCount: number;
}

interface LazyLoadWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  maxRetries?: number;
  retryDelay?: number;
}

// Wrapper para manejar errores de chunk loading con retry automático
class LazyLoadWrapper extends Component<LazyLoadWrapperProps, LazyLoadWrapperState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: LazyLoadWrapperProps) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): LazyLoadWrapperState | null {
    // Detectar si es un error de chunk loading
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      return {
        hasError: true,
        retryCount: 0
      };
    }
    return null;
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log del error para debugging
    console.error('LazyLoadWrapper caught an error:', error, errorInfo);
    
    // Si es un ChunkLoadError, intentar retry
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      this.handleChunkLoadError();
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  handleChunkLoadError = () => {
    const { maxRetries = 3, retryDelay = 1000 } = this.props;
    
    if (this.state.retryCount < maxRetries) {
      console.info(`Retrying chunk load... Attempt ${this.state.retryCount + 1}/${maxRetries}`);
      
      this.retryTimeoutId = setTimeout(() => {
        this.setState(prevState => ({
          hasError: false,
          retryCount: prevState.retryCount + 1
        }));
      }, retryDelay * (this.state.retryCount + 1)); // Incrementar delay con cada retry
    }
  };

  handleManualRetry = () => {
    this.setState({
      hasError: false,
      retryCount: 0
    });
  };

  render() {
    if (this.state.hasError) {
      const { maxRetries = 3 } = this.props;
      
      // Si ya agotamos los retries automáticos, mostrar UI de error
      if (this.state.retryCount >= maxRetries) {
        return (
          <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-lg font-semibold">Error al cargar componente</h3>
              <p className="text-sm text-red-500 mt-2 max-w-md text-center">
                No se pudo cargar este contenido. Esto puede deberse a una actualización del sitio.
              </p>
            </div>
            <button
              onClick={this.handleManualRetry}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        );
      }

      // Mostrar loader mientras reintenta automáticamente
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-sm">
            Cargando... (Intento {this.state.retryCount + 1}/{maxRetries})
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook para crear lazy components con retry automático
export function createLazyComponentWithRetry<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: ReactNode,
  maxRetries: number = 3,
  retryDelay: number = 1000
) {
  const LazyComponent = lazy(importFunc);
  
  const LazyComponentWithRetry = (props: React.ComponentProps<T>) => (
    <LazyLoadWrapper 
      fallback={fallback} 
      maxRetries={maxRetries}
      retryDelay={retryDelay}
    >
      <Suspense fallback={fallback || (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}>
        <LazyComponent {...props} />
      </Suspense>
    </LazyLoadWrapper>
  );
  
  LazyComponentWithRetry.displayName = `LazyComponentWithRetry(${importFunc.toString()})`;
  
  return LazyComponentWithRetry;
}

// Wrapper de error boundary mejorado para toda la aplicación
export class GlobalChunkErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Global chunk error caught:', error, errorInfo);
    
    // Si es un ChunkLoadError, recargar la página después de un delay
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      setTimeout(() => {
        console.info('Reloading page due to chunk load error...');
        window.location.reload();
      }, 2000);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback por defecto para errores de chunk
      if (this.state.error?.name === 'ChunkLoadError' || 
          this.state.error?.message.includes('Loading chunk')) {
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Actualizando aplicación...
            </h2>
            <p className="text-gray-600 text-center max-w-md">
              Se detectó una actualización. La página se recargará automáticamente en unos segundos.
            </p>
          </div>
        );
      }

      // Fallback genérico para otros errores
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Algo salió mal
            </h2>
            <p className="text-gray-600 text-center max-w-md mb-4">
              Ocurrió un error inesperado. Por favor, recarga la página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default LazyLoadWrapper;