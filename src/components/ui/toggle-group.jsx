import React from "react";

export function ToggleGroup({ type = 'single', value, onValueChange, children, className = '' }) {
  // Clone each child and inject `isActive` + proper onClick
  const items = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;

    const isActive = child.props.value === value;
    return React.cloneElement(child, {
      isActive,
      onClick: () => onValueChange(child.props.value),
    });
  });

  return <div className={`flex gap-1 ${className}`}>{items}</div>;
}

export function ToggleGroupItem({ value, isActive, children, className = '', onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded border text-sm font-medium transition ${
        isActive ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-100'
      } ${className}`}
    >
      {children}
    </button>
  );
}
