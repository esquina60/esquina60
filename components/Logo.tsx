import React from 'react';

export const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`inline-flex flex-col items-center justify-center border-2 border-white p-2 px-4 ${className}`}>
      <span className="font-logo text-2xl leading-none text-white tracking-widest">ESQUINA60</span>
      <span className="font-logo text-sm leading-none text-white tracking-widest mt-1">BAR&ADEGA</span>
    </div>
  );
};
