'use client'

import { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class PaymentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Payment Error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
                Erreur de paiement
              </h3>
              <p className="text-red-700 dark:text-red-300 mb-4">
                Une erreur inattendue s'est produite lors du traitement de votre paiement. 
                Veuillez réessayer ou contacter notre support.
              </p>
              {this.state.error && (
                <details className="mb-4">
                  <summary className="text-sm text-red-600 dark:text-red-400 cursor-pointer">
                    Détails techniques
                  </summary>
                  <pre className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-2 rounded overflow-auto">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Réessayer
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
