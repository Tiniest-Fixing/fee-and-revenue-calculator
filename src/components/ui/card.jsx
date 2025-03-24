import React from "react";

export function Card({ className = '', children }) {
  return (
    <div className={`bg-white dark:bg-zinc-800 border rounded-lg shadow ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ className = '', children }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
