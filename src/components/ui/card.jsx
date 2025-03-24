export function Card({ className = '', children }) {
  return (
    <div className={`bg-white border rounded-lg shadow ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ className = '', children }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
