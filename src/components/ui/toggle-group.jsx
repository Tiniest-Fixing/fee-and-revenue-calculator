import { useState } from 'react';

export function ToggleGroup({ type = 'single', value, onValueChange, children, className = '' }) {
  return <div className={`flex gap-1 ${className}`}>{children}</div>;
}

export function ToggleGroupItem({ value, children, className = '', onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded border text-sm font-medium hover:bg-gray-100 transition ${className}`}
    >
      {children}
    </button>
  );
}
