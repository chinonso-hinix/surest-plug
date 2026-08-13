import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface LoadingGearProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
  fullPage?: boolean;
}

export const LoadingGear: React.FC<LoadingGearProps> = ({
  size = 'md',
  text,
  className = '',
  fullPage = false
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  };

  const iconSize = sizeClasses[size] || sizeClasses.md;

  const content = (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="relative flex items-center justify-center">
        {!imgError ? (
          <img
            src="/logo.png"
            alt="Loading..."
            className={`${iconSize} animate-spin object-contain select-none`}
            onError={() => setImgError(true)}
            loading="eager"
          />
        ) : (
          <div className={`${iconSize} rounded-xl bg-blue-600/10 flex items-center justify-center border border-blue-200 animate-spin`}>
            <Sparkles className="w-1/2 h-1/2 text-blue-600" />
          </div>
        )}
      </div>
      {text && (
        <p className="text-xs sm:text-sm font-bold text-slate-700 tracking-wide text-center">
          {text}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        {content}
      </div>
    );
  }

  return content;
};
