import React, { useEffect, useState } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { useUpdateReputation } from '../hooks/useUpdateReputation';
import { UpdateSuccessModal } from './UpdateSuccessModal';
import { UpdateErrorModal } from './UpdateErrorModal';

interface UpdateReputationButtonProps {
  walletAddress: `0x${string}`;
  onSuccess?: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const UpdateReputationButton: React.FC<UpdateReputationButtonProps> = ({
  walletAddress,
  onSuccess,
  variant = 'secondary',
  size = 'md',
  className = ''
}) => {
  const { 
    updateReputation, 
    isUpdating, 
    updateError, 
    updateSuccess, 
    contractResult, 
    errorStatusCode,
    clearState 
  } = useUpdateReputation();
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const handleClick = async () => {
    await updateReputation(walletAddress);
  };

  // Show modals based on state
  useEffect(() => {
    if (updateSuccess && contractResult) {
      setShowSuccessModal(true);
    }
  }, [updateSuccess, contractResult]);

  useEffect(() => {
    if (updateError) {
      setShowErrorModal(true);
    }
  }, [updateError]);

  // Call onSuccess callback
  useEffect(() => {
    if (updateSuccess && onSuccess) {
      onSuccess();
    }
  }, [updateSuccess, onSuccess]);

  const handleModalClose = () => {
    setShowSuccessModal(false);
    setShowErrorModal(false);
    clearState();
  };

  const handleRetry = () => {
    setShowErrorModal(false);
    clearState();
    handleClick();
  };

  // Size and variant classes
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:from-cyan-600 hover:to-purple-700',
    secondary: 'border-2 border-slate-600 text-slate-300 hover:border-slate-500 hover:text-white'
  };

  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isUpdating}
        className={`
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${className}
          rounded-xl font-semibold transition-all duration-300 
          flex items-center space-x-2 
          ${isUpdating ? 'opacity-75 cursor-not-allowed' : 'transform hover:scale-105'}
        `}
      >
        {isUpdating ? (
          <>
            <RefreshCw className={`${iconSize} animate-spin`} />
            <span>Updating...</span>
          </>
        ) : (
          <>
            <RefreshCw className={iconSize} />
            <span>Update Reputation</span>
          </>
        )}
      </button>

      {/* Success Modal */}
      {contractResult && (
        <UpdateSuccessModal
          contractResult={contractResult}
          isOpen={showSuccessModal}
          onClose={handleModalClose}
        />
      )}

      {/* Error Modal */}
      <UpdateErrorModal
        error={updateError || ''}
        statusCode={errorStatusCode || undefined}
        isOpen={showErrorModal}
        onClose={handleModalClose}
        onRetry={handleRetry}
      />
    </>
  );
};