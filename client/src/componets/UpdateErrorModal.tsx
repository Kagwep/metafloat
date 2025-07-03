import React from 'react';
import { AlertTriangle, X, RefreshCw, CreditCard, Database, Wifi } from 'lucide-react';

interface UpdateErrorModalProps {
  error: string;
  statusCode?: number;
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
}

export const UpdateErrorModal: React.FC<UpdateErrorModalProps> = ({
  error,
  statusCode,
  isOpen,
  onClose,
  onRetry
}) => {
  if (!isOpen) return null;

  const getErrorInfo = () => {
    // Handle 404 - Wallet not found in transaction data
    if (statusCode === 404 || error.includes('not found in transaction data')) {
      return {
        title: 'No Transaction History Found',
        description: 'Your wallet address was not found in our MetaMask Card transaction dataset.',
        icon: CreditCard,
        iconColor: 'text-yellow-400',
        bgColor: 'bg-yellow-500/20',
        suggestions: [
          'Make sure you have used MetaMask Card for transactions',
          'Check that you\'re connected with the correct wallet address',
          'Transaction history might not be available yet for your wallet',
          'Try again later as we regularly update our dataset'
        ],
        canRetry: true,
        severity: 'warning'
      };
    }

    // Handle 500 - Server errors
    if (statusCode === 500 || error.includes('server error') || error.includes('Internal')) {
      return {
        title: 'Server Error',
        description: 'There was an internal error while processing your request.',
        icon: Database,
        iconColor: 'text-red-400',
        bgColor: 'bg-red-500/20',
        suggestions: [
          'Our servers are experiencing issues',
          'Try again in a few minutes',
          'The issue has been logged and will be investigated',
          'Contact support if the problem persists'
        ],
        canRetry: true,
        severity: 'error'
      };
    }

    // Handle 400 - Bad request
    if (statusCode === 400 || error.includes('wallet_address is required')) {
      return {
        title: 'Invalid Request',
        description: 'There was an issue with the wallet address format.',
        icon: AlertTriangle,
        iconColor: 'text-orange-400',
        bgColor: 'bg-orange-500/20',
        suggestions: [
          'Make sure your wallet is properly connected',
          'Try disconnecting and reconnecting your wallet',
          'Refresh the page and try again'
        ],
        canRetry: true,
        severity: 'warning'
      };
    }

    // Handle network/connection errors
    if (error.includes('fetch') || error.includes('network') || error.includes('timeout')) {
      return {
        title: 'Connection Error',
        description: 'Unable to connect to the reputation service.',
        icon: Wifi,
        iconColor: 'text-blue-400',
        bgColor: 'bg-blue-500/20',
        suggestions: [
          'Check your internet connection',
          'Try refreshing the page',
          'Disable VPN if you\'re using one',
          'Contact support if the issue continues'
        ],
        canRetry: true,
        severity: 'warning'
      };
    }

    // Default error
    return {
      title: 'Update Failed',
      description: 'An unexpected error occurred while updating your reputation.',
      icon: AlertTriangle,
      iconColor: 'text-red-400',
      bgColor: 'bg-red-500/20',
      suggestions: [
        'Try the update again',
        'Check your wallet connection',
        'Refresh the page if the problem continues',
        'Contact support with the error details below'
      ],
      canRetry: true,
      severity: 'error'
    };
  };

  const errorInfo = getErrorInfo();
  const IconComponent = errorInfo.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl border border-slate-600 max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Error header */}
        <div className="text-center mb-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${errorInfo.bgColor}`}>
            <IconComponent className={`w-8 h-8 ${errorInfo.iconColor}`} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{errorInfo.title}</h2>
          <p className="text-slate-300">{errorInfo.description}</p>
        </div>

        {/* Suggestions */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">What you can try:</h3>
          <div className="space-y-3">
            {errorInfo.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-slate-800/50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-slate-300">{index + 1}</span>
                </div>
                <p className="text-slate-300">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Error details (collapsible) */}
        <details className="mb-6">
          <summary className="cursor-pointer text-slate-400 text-sm hover:text-slate-300 transition-colors">
            Show technical details
          </summary>
          <div className="mt-3 bg-slate-900/50 p-3 rounded-lg">
            <p className="text-xs text-slate-400 font-mono break-all">
              {statusCode && `Status: ${statusCode} | `}
              {error}
            </p>
          </div>
        </details>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {errorInfo.canRetry && (
            <button
              onClick={onRetry}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 border-2 border-slate-600 text-slate-300 py-3 px-4 rounded-xl font-semibold hover:border-slate-500 hover:text-white transition-all duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};