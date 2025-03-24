import React from "react";

export function Input(props) {
  return (
    <input
      {...props}
      className={
        'border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ' +
        (props.className || '')
      }
    />
  );
}
